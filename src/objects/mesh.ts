import { mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { TypedArray } from 'harmony-types';
import { HarmonyMenuItemsDict } from 'harmony-ui';
import { errorMap, errorOnce, Map2 } from 'harmony-utils';
import { ArrayInfo, MemberInfo, StructInfo, TemplateInfo, TypeInfo, VariableInfo } from 'wgsl_reflect';
import { Camera } from '../cameras/camera';
import { Entity, EntityParameters } from '../entities/entity';
import { BufferGeometry } from '../geometry/buffergeometry';
import { Graphics } from '../graphics/graphics2';
import { WebGPUInternal } from '../graphics/webgpuinternal';
import { InternalRenderContext } from '../interfaces/rendercontext';
import { Material } from '../materials/material';
import { MaterialManager } from '../materials/materialmanager';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { BoundingBox } from '../math/boundingbox';
import { getNormal, getUV } from '../math/triangle';
import { Intersection } from '../raycasting/intersection';
import { Ray } from '../raycasting/ray';
import { Raycaster } from '../raycasting/raycaster';
import { Texture } from '../textures/texture';
import { Interaction } from '../utils/interaction';
import { GL_TRIANGLES } from '../webgl/constants';
import { UniformBuffer, UniformValue } from '../webgl/uniform';
import { StorageBuffer, StorageValue, StorageValueArray, StorageValueStruct } from '../webgpu/storage';
import { Binding, WgslModule } from '../webgpu/types';
import { getViewDimension } from '../webgpu/viewdimension';

const tempVec3 = vec3.create();
const identityVec2 = vec2.create();

const v1 = vec3.create();
const v2 = vec3.create();
const v3 = vec3.create();
const n1 = vec3.create();
const n2 = vec3.create();
const n3 = vec3.create();
const uv1 = vec2.create();
const uv2 = vec2.create();
const uv3 = vec2.create();
const intersectionPoint = vec3.create();
const intersectionNormal = vec3.create();
const ray = new Ray();
const uv = vec2.create();

export type MeshParameters = EntityParameters & {
	geometry?: BufferGeometry,
	material?: Material,
	topology?: GPUPrimitiveTopology;
};

const meshDefaultBufferGeometry = new BufferGeometry();
const meshDefaultMaterial = new MeshBasicMaterial();

export type ObjDatas = {
	f: Uint8Array | Uint32Array,
	v?: Float32Array,
	vn?: Float32Array,
	vt?: Float32Array
	tangent?: Float32Array
	bitangent?: Float32Array
};

export class Mesh extends Entity {
	#geometry!: BufferGeometry;
	#material!: Material;
	#dirtyProgram = true;//TODOv3 use another method
	renderMode = GL_TRIANGLES;
	isRenderable = true;
	readonly #uniforms = new Map<string, UniformBuffer>();
	readonly storage: Record<string, StorageBuffer> = {};
	defines = Object.create(null);
	isMesh = true;
	topology: GPUPrimitiveTopology;

	// Internal use
	#pipelineLayout?: GPUPipelineLayout;
	#materialUpdateVersion = -1;
	#materialDefinesVersion = -1;
	#webGpuGroups = new Map2<number, number, Binding>();
	#webGpuShaderSource?: WeakRef<WgslModule>;
	dirty = false;
	#dirtyBuffers = false;

	constructor(params: MeshParameters = {}) {
		super(params);
		this.setGeometry(params.geometry ?? meshDefaultBufferGeometry);
		this.setMaterial(params.material ?? meshDefaultMaterial);
		this.topology = params.topology ?? 'triangle-list';
		this.#desaturate(this.getAttribute('desaturate'));
	}

	/**
	 * @deprecated Please use `setMaterial` instead.
	 */
	set material(material) {
		this.setMaterial(material);
	}

	/**
	 * @deprecated Please use `getMaterial` instead.
	 */
	get material() {
		return this.getMaterial();
	}

	setGeometry(geometry: BufferGeometry) {
		if (this.#geometry == geometry) {
			return;
		}
		if (this.#geometry) {
			this.#geometry.removeUser(this);
		}

		geometry.addUser(this);

		this.#geometry = geometry;
	}

	/**
	 * @deprecated Please use `getGeometry` instead.
	 */
	get geometry() {
		return this.#geometry;
	}

	getGeometry() {
		return this.#geometry;
	}

	setMaterial(material: Material): void {
		if (this.#material != material) {
			if (this.#material) {
				this.#material.removeUser(this);
			}

			material.addUser(this);

			this.#material = material;
			this.#materialUpdateVersion = -1;
		}
	}

	getMaterial() {
		return this.#material;
	}

	getUniforms(): Map<string, UniformBuffer> {
		return this.#uniforms;
	}

	getUniform(name: string): UniformBuffer | undefined {
		return this.#uniforms.get(name);
	}

	getUniformValue(name: string): UniformValue | Record<string, UniformValue> {
		return this.#uniforms.get(name)?.value;
	}

	setUniformValue(name: string, value: UniformValue | Record<string, UniformValue>): void {
		const existingValue = this.#uniforms.get(name);
		if (existingValue) {
			if (existingValue.buffer) {
				// TODO: only destroy is size is different
				existingValue.buffer.destroy();
			}
		}

		this.#uniforms.set(name, { value, dirty: true, });
		this.#dirtyBuffers = true;
	}

	updateUniformValue(name: string): void {
		const existingValue = this.#uniforms.get(name);
		if (existingValue) {
			existingValue.dirty = true;
			this.dirty = true;
		}
	}

	setSubUniformValue(name: string, value: UniformValue | Record<string, UniformValue>): void {
		const path = name.split('.');

		let len = path.length - 1;
		if (len === 0) {
			return this.setUniformValue(name, value);
		}

		const existingValue = this.#uniforms.get(path[0]!);
		if (!existingValue) {
			return;
		}

		let subValue = existingValue.value;
		for (let i = 1; i < len - 1; i++) {
			if (Object.prototype.toString.call(subValue) !== '[object Object]') {
				return;
			}

			subValue = (subValue as Record<string, UniformValue>)[path[i]!];
		}

		(subValue as Record<string, UniformValue | Record<string, UniformValue>>)[path[len]!] = value;
		existingValue.dirty = true;
		this.#dirtyBuffers = true;
	}

	deleteUniform(name: string): void {
		// TODO: do some cleanup ?
		this.#uniforms.delete(name);
	}

	getStorage(name: string): StorageBuffer | undefined {
		return this.storage[name];
	}

	setStorage(name: string, value: StorageValue): void {
		// TODO: copy the behavior of material setStorage
		this.storage[name] = { value, dirty: true, };
		this.dirty = false;
	}

	deleteStorage(name: string): void {
		const sto = this.storage[name];
		if (sto) {
			sto.buffer?.destroy();
			sto.buffer = null;
			sto.dirty = true;
			this.dirty = true;
		}
	}

	setDefine(define: string, value: string | number = '') {
		this.defines[define] = value;
	}

	removeDefine(define: string) {
		delete this.defines[define];
	}

	/**
	 * Export mesh as obj
	 * @param worldSpace Export mesh in world space. Default to false
	 * @returns Exported mesh
	 */
	exportObj(worldSpace = false): ObjDatas {
		//const ret: { f?: Uint8Array | Uint32Array, v?: Float32Array, vn?: Float32Array, vt?: Float32Array } = {};
		const ret: Record<string, Uint8Array | Uint32Array | Float32Array | []> = {};
		const attributes: Record<string, string> = { f: 'index', v: 'aVertexPosition', vn: 'aVertexNormal', vt: 'aTextureCoord', tangent: 'aVertexTangent' };
		const geometry = this.#geometry;
		for (const objAttribute in attributes) {
			const geometryAttribute = attributes[objAttribute]!;
			if (geometry?.getAttribute(geometryAttribute)) {
				const webglAttrib = geometry.getAttribute(geometryAttribute);
				if (webglAttrib) {
					ret[objAttribute as ('f' | 'v' | 'vn' | 'vt')] = webglAttrib._array?.slice() as Uint8Array | Uint32Array | Float32Array;
				}
			} else {
				if (objAttribute == 'f') {
					ret['f'] = new Uint8Array();
				} else {
					//ret[objAttribute as ('v' | 'vn' | 'vt')] = new Float32Array();
				}
			}
		}
		if (worldSpace) {
			const vertexArray = ret['v'] as Float32Array;
			if (vertexArray) {
				const worldMatrix = this.worldMatrix;
				const vec = vec3.create();
				for (let i = 0; i < vertexArray.length; i += 3) {
					vec[0] = vertexArray[i + 0]!;
					vec[1] = vertexArray[i + 1]!;
					vec[2] = vertexArray[i + 2]!;

					vec3.transformMat4(vec, vec, worldMatrix);

					vertexArray[i + 0] = vec[0];
					vertexArray[i + 1] = vec[1];
					vertexArray[i + 2] = vec[2];
				}
			}
		}
		return ret as ObjDatas;
	}

	override dispose() {
		super.dispose();
		this.#material?.removeUser(this);
		this.#geometry?.removeUser(this);
	}

	toString() {
		return 'Mesh ' + super.toString();
	}

	getBoundsModelSpace(min = vec3.create(), max = vec3.create()): void {
		min[0] = Infinity;
		min[1] = Infinity;
		min[2] = Infinity;
		max[0] = -Infinity;
		max[1] = -Infinity;
		max[2] = -Infinity;

		const vertexPosition = this.#geometry.getAttribute('aVertexPosition')?._array;
		if (!vertexPosition) {
			return;
		}
		for (let i = 0, l = vertexPosition.length; i < l; i += 3) {
			tempVec3[0] = vertexPosition[i + 0]!;
			tempVec3[1] = vertexPosition[i + 1]!;
			tempVec3[2] = vertexPosition[i + 2]!;
			vec3.min(min, min, tempVec3);
			vec3.max(max, max, tempVec3);
		}
		//console.error(min, max);
	}

	getBoundingBox(boundingBox = new BoundingBox()) {
		boundingBox.reset();
		const array = this.#geometry.getAttribute('aVertexPosition')?._array;
		if (array) {
			boundingBox.setPoints(array as Float32Array);
		}
		return boundingBox;
	}

	#desaturate(attributeValue: boolean) {
		if (attributeValue) {
			this.setDefine('DESATURATE');
		} else {
			this.removeDefine('DESATURATE');
		}
	}

	getPipelineLayout(shaderModule: WgslModule, /*groups: Map2<number, number, Binding>, */camera: Camera | null, uniforms: Map<string, BufferSource> | null, context: InternalRenderContext, isCompute: boolean): [GPUPipelineLayout, Map2<number, number, Binding>] {
		const material = this.#material;

		if (this.#webGpuShaderSource?.deref() !== shaderModule) {
			// Recreate the pipeline layout if the shader module has changed
			this.#pipelineLayout = undefined;
			// TODO: delete buffers inside
			this.#webGpuGroups.clear();

			this.#webGpuShaderSource = new WeakRef(shaderModule);
		}

		if (this.#pipelineLayout) {
			if (!this.dirty && (this.#materialUpdateVersion === this.#material.updateVersion)) {
				return [this.#pipelineLayout, this.#webGpuGroups];
			}
		}

		populateBindGroups(shaderModule, this.#webGpuGroups, material, this, camera, uniforms, context, isCompute);

		this.#pipelineLayout = WebGPUInternal.device.createPipelineLayout({
			label: material.getShaderSource(),
			bindGroupLayouts: getBindGroupLayouts(this.#webGpuGroups, isCompute),
		});

		return [this.#pipelineLayout, this.#webGpuGroups];
	}

	override buildContextMenu(): HarmonyMenuItemsDict {
		const contextMenu = super.buildContextMenu();

		const materialSubmenu = contextMenu.material!.submenu as HarmonyMenuItemsDict;

		materialSubmenu.mesh1 = null;

		materialSubmenu.setMaterial = {
			i18n: '#set_material', f: async () => {
				const materialName = await new Interaction().getString(0, 0, MaterialManager.getMaterialList());
				if (materialName) {
					MaterialManager.getMaterial(materialName, (material) => { if (material) { this.setMaterial(material); } });
				}
			}
		};
		return contextMenu;
	}

	raycast(raycaster: Raycaster, intersections: Intersection[]) {
		const geometry = this.#geometry;
		const indices = geometry?.getAttribute('index')?._array;
		if (!indices) {
			return;
		}
		const vertices = geometry?.getAttribute('aVertexPosition')?._array;
		if (!vertices) {
			return;
		}
		const textureCoords = geometry?.getAttribute('aTextureCoord')?._array;
		let normals = geometry?.getAttribute('aVertexNormal')?._array;
		const worldMatrix = this.worldMatrix;
		ray.copyTransform(raycaster.ray, worldMatrix);
		if (normals) {
			for (let i = 0, l = indices.length; i < l; i += 3) {
				let i1 = 3 * indices[i]!;
				let i2 = 3 * indices[i + 1]!;
				let i3 = 3 * indices[i + 2]!;

				vec3.set(v1, vertices[i1]!, vertices[i1 + 1]!, vertices[i1 + 2]!);
				vec3.set(v2, vertices[i2]!, vertices[i2 + 1]!, vertices[i2 + 2]!);
				vec3.set(v3, vertices[i3]!, vertices[i3 + 1]!, vertices[i3 + 2]!);

				if (ray.intersectTriangle(v1, v2, v3, intersectionPoint)) {
					vec3.set(n1, normals[i1]!, normals[i1 + 1]!, normals[i1 + 2]!);
					vec3.set(n2, normals[i2]!, normals[i2 + 1]!, normals[i2 + 2]!);
					vec3.set(n3, normals[i3]!, normals[i3 + 1]!, normals[i3 + 2]!);


					i1 = 2 * indices[i]!;
					i2 = 2 * indices[i + 1]!;
					i3 = 2 * indices[i + 2]!;
					if (textureCoords) {
						vec2.set(uv1, textureCoords[i1]!, textureCoords[i1 + 1]!);
						vec2.set(uv2, textureCoords[i2]!, textureCoords[i2 + 1]!);
						vec2.set(uv3, textureCoords[i3]!, textureCoords[i3 + 1]!);
					}

					getUV(uv, intersectionPoint, v1, v2, v3, uv1, uv2, uv3);
					getNormal(intersectionNormal, intersectionPoint, v1, v2, v3, n1, n2, n3);

					const x = intersectionNormal[0];
					const y = intersectionNormal[1];
					const z = intersectionNormal[2];

					//Tranform the normal with the world matrix
					intersectionNormal[0] = worldMatrix[0] * x + worldMatrix[4] * y + worldMatrix[8] * z;
					intersectionNormal[1] = worldMatrix[1] * x + worldMatrix[5] * y + worldMatrix[9] * z;
					intersectionNormal[2] = worldMatrix[2] * x + worldMatrix[6] * y + worldMatrix[10] * z;

					vec3.transformMat4(intersectionPoint, intersectionPoint, worldMatrix);
					intersections.push(ray.createIntersection(intersectionPoint, intersectionNormal, uv, this, 0));
				}
			}
		} else {
			normals = Float32Array.from([1, 0, 0]);
			for (let i = 0, l = indices.length; i < l; i += 3) {
				let i1 = 3 * indices[i]!;
				let i2 = 3 * indices[i + 1]!;
				let i3 = 3 * indices[i + 2]!;

				vec3.set(v1, vertices[i1]!, vertices[i1 + 1]!, vertices[i1 + 2]!);
				vec3.set(v2, vertices[i2]!, vertices[i2 + 1]!, vertices[i2 + 2]!);
				vec3.set(v3, vertices[i3]!, vertices[i3 + 1]!, vertices[i3 + 2]!);

				if (ray.intersectTriangle(v1, v2, v3, intersectionPoint)) {
					vec3.set(n1, normals[0]!, normals[1]!, normals[2]!);
					vec3.set(n2, normals[0]!, normals[1]!, normals[2]!);
					vec3.set(n3, normals[0]!, normals[1]!, normals[2]!);


					i1 = 2 * indices[i]!;
					i2 = 2 * indices[i + 1]!;
					i3 = 2 * indices[i + 2]!;
					if (textureCoords) {
						vec2.set(uv1, textureCoords[i1]!, textureCoords[i1 + 1]!);
						vec2.set(uv2, textureCoords[i2]!, textureCoords[i2 + 1]!);
						vec2.set(uv3, textureCoords[i3]!, textureCoords[i3 + 1]!);
					}

					getUV(uv, intersectionPoint, v1, v2, v3, uv1, uv2, uv3);
					getNormal(intersectionNormal, intersectionPoint, v1, v2, v3, n1, n2, n3);

					const x = intersectionNormal[0];
					const y = intersectionNormal[1];
					const z = intersectionNormal[2];

					//Tranform the normal with the world matrix
					intersectionNormal[0] = worldMatrix[0] * x + worldMatrix[4] * y + worldMatrix[8] * z;
					intersectionNormal[1] = worldMatrix[1] * x + worldMatrix[5] * y + worldMatrix[9] * z;
					intersectionNormal[2] = worldMatrix[2] * x + worldMatrix[6] * y + worldMatrix[10] * z;

					vec3.transformMat4(intersectionPoint, intersectionPoint, worldMatrix);
					intersections.push(ray.createIntersection(intersectionPoint, intersectionNormal, uv, this, 0));
				}
			}
		}
	}

	static getEntityName() {
		return 'Static mesh';
	}

	is(s: string): boolean {
		if (s == 'Mesh') {
			return true;
		} else {
			return super.is(s);
		}
	}
}

function getBindGroupLayouts(groups: Map2<number, number, Binding>, compute: boolean): GPUBindGroupLayout[] {
	const device = WebGPUInternal.device;

	const bindGroupLayouts: GPUBindGroupLayout[] = [];
	for (const [groupId, group] of groups.getMap()) {
		const entries: GPUBindGroupLayoutEntry[] = [];
		for (const [bindingId, binding] of group) {
			const entry: GPUBindGroupLayoutEntry = {
				binding: bindingId,// corresponds to @binding
				visibility: binding.visibility ?? (compute ? GPUShaderStage.COMPUTE : GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT),// TODO: set appropriate visibility
				//buffer: {},// TODO: set appropriate buffer, sampler, texture, storageTexture, texelBuffer, or externalTexture
			}

			if (binding.buffer) {
				entry.buffer = {
					type: binding.bufferType ?? 'uniform',
					// TODO: add minBindingSize ?
				};
			}

			if (binding.texture) {
				entry.texture = {
					viewDimension: binding.viewDimension,
				};
			}

			if (binding.textureArray) {
				entry.texture = {
					viewDimension: binding.viewDimension,
				};
			}

			if (binding.sampler) {
				entry.sampler = {};
			}

			if (binding.storageTexture) {
				entry.storageTexture = {
					viewDimension: binding.storageTexture.isCube ? 'cube' : '2d',
					format: binding.storageTexture.gpuFormat,
					access: binding.access,
				};
			}

			if (binding.storageTextureArray) {
				entry.storageTexture = {
					viewDimension: binding.viewDimension,
					format: binding.format!,
					access: binding.access,
				};
			}

			entries.push(entry);
		}

		bindGroupLayouts[groupId] = device.createBindGroupLayout({
			label: `group ${groupId}`,
			entries: entries,
		});
	}

	return bindGroupLayouts;
}

const tempViewProjectionMatrix = mat4.create();
export let pickedPrimitive: GPUBuffer;

const uniformBuffers = new Map2<Mesh, string, GPUBuffer>();

function populateBindGroups(
	shaderModule: WgslModule,
	groups: Map2<number, number, Binding>,
	material: Material,
	object: Mesh,
	camera: Camera | null,
	uniforms: Map<string, BufferSource> | null,
	context: InternalRenderContext | null,
	isCompute: boolean,
): void {
	if (!shaderModule.reflection) {
		return;
	}

	const cameraMatrix = camera?.cameraMatrix;
	const projectionMatrix = camera?.projectionMatrix;

	const device = WebGPUInternal.device;

	for (const uniform of shaderModule.reflection.uniforms) {
		const materialUniform = material.getUniform(uniform.name) ?? object.getUniform(uniform.name);

		if (materialUniform && !materialUniform.dirty && groups.has(uniform.group, uniform.binding)) {
			continue;
		}

		if (materialUniform) {
			materialUniform.dirty = false;
		}
		/*
		let additionalUsage: GPUFlagsConstant = 0;
		if (uniform.name == 'commonUniforms') {// TODO: improve that
			additionalUsage = GPUBufferUsage.STORAGE;
		}
		*/
		/*
		const uniformBuffer = device.createBuffer({// TODO: don't recreate buffers each time
			label: uniform.name,
			size: uniform.size,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,// | additionalUsage
		});
		*/

		let uniformBuffer = uniformBuffers.get(object, uniform.name);
		uniformBuffer = undefined;
		if (!uniformBuffer) {
			uniformBuffer = device.createBuffer({
				label: uniform.name,
				size: uniform.size,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,// | additionalUsage
			});
			uniformBuffers.set(object, uniform.name, uniformBuffer);
		}


		groups.set(uniform.group, uniform.binding, { buffer: uniformBuffer });

		const members = uniform.members;
		if (members) {

			const materialUniform = material.getUniformValue(uniform.name) ?? object.getUniformValue(uniform.name);
			if (materialUniform) {
				for (const member of members) {
					let bufferSource: BufferSource | null = null;
					uniformBuffer.label = uniform.name + '.' + member.name;
					const subUniform = (materialUniform as Record<string, UniformValue>)[member.name];
					if (subUniform !== undefined) {
						if (typeof subUniform === 'number') {
							switch (member.type.name) {
								case 'u32':
									bufferSource = new Uint32Array([subUniform]);
									break;
								case 'f32':
									bufferSource = new Float32Array([subUniform]);
									break;
								default:
									errorOnce(`unknwon type: ${member.type.name} for member: ${member.name} for uniform ${uniform.name}in ${material.getShaderSource() + '.wgsl'}`);
									break;
							}
						} else {
							bufferSource = subUniform as BufferSource;
						}
					} else {
						errorMap('unknwon wgsl uniform member', `${uniform.name}.${member.name}`, { uniform: uniform.name, member: member.name, shader: material.getShaderSource() + '.wgsl' });
					}

					if (bufferSource) {
						device.queue.writeBuffer(
							uniformBuffer,
							member.offset,
							bufferSource,
						);
					}
				}
			} else {
				for (const member of members) {
					let bufferSource: BufferSource | null = null;
					uniformBuffer.label = uniform.name + '.' + member.name;

					switch (member.name) {
						case 'modelMatrix':
							bufferSource = object?.worldMatrix as BufferSource;
							break;
						case 'viewMatrix':
							bufferSource = cameraMatrix as BufferSource;
							break;
						case 'modelViewMatrix':
							bufferSource = object?._mvMatrix as BufferSource;
							break;
						case 'projectionMatrix':
							bufferSource = projectionMatrix as BufferSource;
							break;
						case 'viewProjectionMatrix':
							bufferSource = tempViewProjectionMatrix as BufferSource;
							break;
						case 'normalMatrix':
							// In WGSL, mat3x3 actually are mat4x3
							// TODO: improve this
							if (object && cameraMatrix) {
								mat3.normalFromMat4(object._normalMatrix, cameraMatrix);//TODO: fixme
								const m = new Float32Array(12);
								m[0] = object._normalMatrix[0];
								m[1] = object._normalMatrix[1];
								m[2] = object._normalMatrix[2];
								m[4] = object._normalMatrix[3];
								m[5] = object._normalMatrix[4];
								m[6] = object._normalMatrix[5];
								m[8] = object._normalMatrix[6];
								m[9] = object._normalMatrix[7];
								m[10] = object._normalMatrix[8];
								bufferSource = m as BufferSource;
							}
							break;
						case 'cameraPosition':
							bufferSource = camera?.getPosition() as BufferSource;
							break;
						case 'resolution':
							bufferSource = new Float32Array([context?.width ?? 0, context?.height ?? 0, camera?.aspectRatio ?? 1, 0]) as BufferSource;// TODO: create float32 once and update it only on resolution change
							break;
						case 'time':
							bufferSource = new Float32Array([Graphics.getTime(), Graphics.currentTick, 0, 0]) as BufferSource;// TODO: create float32 once and update it once evry frame
							break;
						/*
						case 'pickingColor':
							bufferSource = new Float32Array(object?.pickingColor ?? this.#defaultPickingColor) as BufferSource;// TODO: create float32 once and update it once evry frame
							break;
						*/
						case 'pointerCoord':
							bufferSource = (context?.renderContext.pick?.position ?? identityVec2) as BufferSource;
							break;
						case 'boneMatrix':
							bufferSource = object.getUniformValue(member.name) as Float32Array<ArrayBuffer> ?? new Float32Array(16);//TODO don't create a Float32Array each time
							break;
						default:
							errorMap('unknwon wgsl uniform member', `${uniform.name}.${member.name}`, { uniform: uniform.name, member: member.name, shader: material.getShaderSource() + '.wgsl' });
					}

					if (bufferSource) {
						device.queue.writeBuffer(
							uniformBuffer,
							member.offset,
							bufferSource,
						);
					}
				}
			}
		} else if (uniform.isArray) {
			const members = (uniform.format as StructInfo).members;
			if (members) {
				const structSize = (uniform.format as StructInfo).size;
				for (const member of members) {
					for (let i = 0; i < uniform.count; i++) {
						const bufferSource = uniforms?.get(`${uniform.name}[${i}].${member.name}`);
						if (!bufferSource) {
							continue
						}

						device.queue.writeBuffer(
							uniformBuffer,
							member.offset + structSize * i,
							bufferSource,
						);
					}
				}
			} else {
				const arrayUniform = material.getUniformValue(uniform.name) ?? object.getUniformValue(uniform.name);
				if (arrayUniform !== undefined) {
					device.queue.writeBuffer(
						uniformBuffer,
						0,
						arrayUniform as BufferSource/*TODO: actually check the value type*/,
					);
				} else {
					errorOnce('unknwon array uniform ' + uniform.name);
				}
			}
		} else {// uniform is neither a struct nor an array
			const bufferSource = uniforms?.get(uniform.name);
			if (bufferSource) {
				device.queue.writeBuffer(
					uniformBuffer,
					0,
					bufferSource,
				);
			} else {
				const materialUniform = material.getUniformValue(uniform.name) ?? object.getUniformValue(uniform.name);
				if (materialUniform !== undefined) {
					switch (uniform.type.name) {
						case 'f32':
							device.queue.writeBuffer(
								uniformBuffer,
								0,
								new Float32Array([materialUniform as number]),
							);
							break;
						case 'u32':
							device.queue.writeBuffer(
								uniformBuffer,
								0,
								new Uint32Array([materialUniform as number]),
							);
							break;
						case 'mat3x3f':
							// In WGSL, mat3x3 actually are mat4x3
							const m = new Float32Array([
								materialUniform as Float32Array[0], materialUniform as Float32Array[1], materialUniform as Float32Array[2], 0,
								materialUniform as Float32Array[3], materialUniform as Float32Array[4], materialUniform as Float32Array[5], 0,
								materialUniform as Float32Array[6], materialUniform as Float32Array[7], materialUniform as Float32Array[8], 0,
							]);
							device.queue.writeBuffer(
								uniformBuffer,
								0,
								m as BufferSource,
							);
							break;
						case 'mat4x4f':
						case 'vec2f':
						case 'vec3f':
						case 'vec4f':
							device.queue.writeBuffer(
								uniformBuffer,
								0,
								materialUniform as BufferSource,
							);
							break;
						case 'vec2u':
							const vec2uArray = new Uint32Array([(materialUniform as Uint32Array)[0]!, (materialUniform as Uint32Array)[1]!]);
							device.queue.writeBuffer(
								uniformBuffer,
								0,
								vec2uArray as BufferSource,
							);
							break;
						case 'vec4':
							switch ((uniform.type as TemplateInfo).format?.name) {
								case 'u32':
									const m = new Uint32Array((uniform.type as TemplateInfo).format!.size);
									for (let i = 0; i < (materialUniform as Uint32Array).length; i++) {
										m[i] = (materialUniform as Uint32Array)[i]!;
									}
									device.queue.writeBuffer(
										uniformBuffer,
										0,
										m as BufferSource,
									);
									break;
							}
							break;
						default:
							errorOnce(`unknwon uniform type: ${uniform.type.name} for uniform ${uniform.name} in ${material.getShaderSource() + '.wgsl'}`);
							break;
					}
				} else {
					let bufferSource: BufferSource | null = null;
					switch (uniform.name) {
						case 'cameraPosition':
							bufferSource = camera?.getPosition() as BufferSource;
							break;
						default:
							errorMap('unknwon wgsl uniform', uniform.name, { group: uniform.group, binding: uniform.binding, shader: material.getShaderSource() + '.wgsl' });
							const format = (uniform.type as unknown as VariableInfo)?.format as TypeInfo;
							if (format) {
								let buffer: BufferSource;
								switch (format.name) {
									case 'f32':
										buffer = new Float32Array(format.size);
										break;
									case 'u32':
										buffer = new Uint32Array(format.size);
										break;
									default:

										errorOnce(`unknwon uniform type: ${format.name} for uniform ${uniform.name} in ${material.getShaderSource() + '.wgsl'}`);
										break;
								}

								if (buffer!) {
									device.queue.writeBuffer(
										uniformBuffer,
										0,
										buffer,
									);
								}
							}
					}

					if (bufferSource) {
						device.queue.writeBuffer(
							uniformBuffer,
							0,
							bufferSource,
						);
					}
				}
			}
		}
	}

	for (const shaderTexture of shaderModule.reflection.textures) {
		switch (shaderTexture.name) {
			case 'colorTexture':
				const texture = (material.getUniformValue('colorMap') as Texture | undefined);//?.texture as GPUTexture | undefined;
				if (texture) {
					groups.set(shaderTexture.group, shaderTexture.binding, { texture, viewDimension: '2d', });
				}
				break;
			case 'color2Texture':
				{
					const texture = (material.getUniformValue('color2Map') as Texture | undefined);//?.texture as GPUTexture | undefined;
					if (texture) {
						groups.set(shaderTexture.group, shaderTexture.binding, { texture, viewDimension: '2d', });
					}
				}
				break;
			default:
				{
					const texture = (material.getUniformValue(shaderTexture.name) as Texture | undefined);//?.texture as GPUTexture | undefined;
					if (texture) {
						groups.set(shaderTexture.group, shaderTexture.binding, { texture, viewDimension: getViewDimension(shaderTexture) });
					} else {
						errorOnce(`unknwon texture ${shaderTexture.name} in ${material.getShaderSource() + '.wgsl'}`);
					}
				}
				break;
		}
	}

	// TODO: set samplers and texture in a single pass ?
	for (const shaderSampler of shaderModule.reflection.samplers) {
		switch (shaderSampler.name) {
			case 'colorSampler':
				const sampler = (material.getUniformValue('colorMap') as Texture | undefined)?.sampler;
				if (sampler) {
					groups.set(shaderSampler.group, shaderSampler.binding, { sampler });
				}
				break;
			case 'color2Sampler':
				{
					const sampler = (material.getUniformValue('color2Map') as Texture | undefined)?.sampler;
					if (sampler) {
						groups.set(shaderSampler.group, shaderSampler.binding, { sampler });
					}
				}
				break;
			default:
				{
					const name = shaderSampler.name.replace(/Sampler$/, 'Texture');
					const sampler = (material.getUniformValue(name) as Texture | undefined)?.sampler;
					if (sampler) {
						groups.set(shaderSampler.group, shaderSampler.binding, { sampler });
					} else {
						errorOnce(`unknwon sampler ${shaderSampler.name} in ${material.getShaderSource() + '.wgsl'}`);
					}
				}
				break;
		}
	}

	for (const storage of shaderModule.reflection.storage) {
		const materialUniform = material.getStorage(storage.name) ?? object.getStorage(storage.name);
		if (materialUniform && !materialUniform.dirty && groups.has(storage.group, storage.binding)) {
			continue;
		}

		if (materialUniform) {
			materialUniform.dirty = false;
		}

		let access: GPUStorageTextureAccess = 'read-only';
		let bufferType: GPUBufferBindingType = 'storage';
		let visibility = isCompute ? GPUShaderStage.COMPUTE : GPUShaderStage.FRAGMENT;
		switch ((storage.type as TemplateInfo).access ?? storage.access) {
			case 'read':
				bufferType = 'read-only-storage';
				// TODO: only set vertex if the storage is actually used in a vertex buffer
				if (!isCompute) {
					visibility |= GPUShaderStage.VERTEX;
				}
				break;
			case 'write':
				access = 'write-only';
				break;
			case 'read_write':
				access = 'read-write';
				break;
			default:
				errorOnce(`Unknown storage access type ${(storage.type as TemplateInfo).access}`);
				break;
		}

		switch (storage.name) {
			case 'colorTexture':
				const storageTexture = (material.getUniformValue('colorMap') as Texture | undefined);//?.texture as GPUTexture | undefined;
				if (storageTexture) {
					groups.set(storage.group, storage.binding, { storageTexture, access, viewDimension: '2d', });
				}
				break;
			case 'pickedPrimitive':
				const buffer = pickedPrimitive ?? device.createBuffer({// TODO: don't recreate buffers each time
					label: storage.name,
					size: storage.size,
					usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
				});

				if (!pickedPrimitive) {
					pickedPrimitive = buffer;
				}

				groups.set(storage.group, storage.binding, { buffer, bufferType, access, visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE });
				break;
			default:
				{
					const storageTexture = (material.getUniformValue(storage.name) as (Texture | undefined)[] | Texture | undefined);//?.texture as GPUTexture | undefined;
					if (storageTexture) {
						if (storage.isArray) {
							console.error("check this branch");

							let isCube = false;
							let visibility: GPUShaderStageFlags | undefined = undefined;
							let format: GPUTextureFormat = 'rgba8unorm';

							for (const texture of storageTexture as Texture[]) {
								// TODO: find a better way to do this
								if (texture) {
									isCube = texture.isCube;
									format = texture.gpuFormat;
									visibility = texture.gpuVisibility;
									break;
								}
							}

							groups.set(storage.group, storage.binding, { storageTextureArray: storageTexture as Texture[], access, visibility, format, viewDimension: isCube ? 'cube-array' : '2d-array', });
						} else if (storage.isStruct) {
							throw new Error('this should be a storage ' + storage.name);
						} else {
							groups.set(storage.group, storage.binding, { storageTexture: storageTexture as Texture, access, visibility: (storageTexture as Texture).gpuVisibility, viewDimension: getViewDimension(storage) });
						}
					} else {
						const storageBuffer = object?.getStorage(storage.name) ?? material?.getStorage(storage.name);
						if (storageBuffer) {
							const usage = storageBuffer.usage ?? GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE;
							if (storageBuffer.shared) {
								// Do nothing
							} else if (storageBuffer.raw) {
								if (!storageBuffer.buffer) {
									storageBuffer.buffer = device.createBuffer({
										label: storage.name,
										size: storage.size || storageBuffer.size || (storageBuffer.value as TypedArray).byteLength,
										usage,
									});
								}
								if (storageBuffer.value) {
									device.queue.writeBuffer(
										storageBuffer.buffer,
										storageBuffer.rawOffset ?? 0,
										storageBuffer.value as BufferSource,
										0/*TODO: use data offset ?*/,
										storageBuffer.rawSize ?? storageBuffer.buffer.size,
									);
								}
							} else if (storage.isStruct) {
								// TODO: handle nested structs

								// TODO: Do this every time there is a struct
								// Compute the size of the struct if the last member is a dynamically sized array
								let size = storage.size;
								const members = (storage.type as StructInfo).members;
								const lastMember = members[members.length - 1]!;

								if (lastMember.isArray && lastMember.size === 0) {
									const value = (storageBuffer.value as StorageValueStruct)?.[lastMember.name];
									if (Array.isArray(value) || ArrayBuffer.isView(value)) {
										size += value.length * (lastMember.type as ArrayInfo).stride;
									}
								}

								if (!storageBuffer.buffer) {
									storageBuffer.buffer = device.createBuffer({
										label: storage.name,
										size,
										usage,
									});
								}

								for (const member of (storage.type as StructInfo).members) {
									const source = (storageBuffer.value as StorageValueStruct | undefined)?.[member.name];
									if (source) {
										device.queue.writeBuffer(
											storageBuffer.buffer,
											member.offset,
											source as BufferSource,
										);
									}
								}

							} else if (storage.isArray) {
								if (storage.format!.isArray) {
									// Array of array
									if (!storageBuffer.buffer) {
										storageBuffer.buffer = device.createBuffer({
											label: storage.name,
											size: storage.size || storageBuffer.size || (storageBuffer.value as TypedArray).byteLength,
											usage,
										});
									}
									if (storageBuffer.value !== null && storageBuffer.value !== undefined) {
										device.queue.writeBuffer(storageBuffer.buffer, 0, storageBuffer.value as BufferSource, 0, storageBuffer.value.length as number);
									}
								} else if (storage.format!.isStruct) {
									if (!storageBuffer.buffer) {
										storageBuffer.buffer = device.createBuffer({
											label: storage.name,
											size: storage.size || (storageBuffer.value as StorageValueStruct[]).length * storage.format!.size,
											usage,
										});
									}

									let baseOffset = 0;
									for (const s of storageBuffer.value as StorageValueStruct[]) {

										if (s) {
											writeStruct(device.queue, storageBuffer.buffer, (storage.format as StructInfo).members, s, baseOffset);
										}
										baseOffset += (storage.type as ArrayInfo).stride;
										/*
										for (const member of ((storage.type as ArrayInfo).format as StructInfo).members) {
											const source = s[member.name];
											if (source !== undefined) {
												if (typeof source === 'number') {
													writeNumber(device.queue, storageBuffer.buffer, member, source);
												} else {
													device.queue.writeBuffer(
														storageBuffer.buffer,
														member.offset,
														source as BufferSource,
													);
												}
											}
										}
										*/
									}


								} else if (storage.format!.isPointer) {
									throw new Error('code me: storage is a pointer array');
								} else if (storage.format!.isTemplate) {
									throw new Error('code me: storage is a template array');
								} else {
									// Array of primitives
									if (!storageBuffer.buffer) {
										storageBuffer.buffer = device.createBuffer({
											label: storage.name,
											size: storage.size || storageBuffer.size || (storageBuffer.value as TypedArray).byteLength,
											usage,
										});
									}
									if (storageBuffer.value !== null && storageBuffer.value !== undefined) {
										device.queue.writeBuffer(storageBuffer.buffer, 0, storageBuffer.value as BufferSource, 0, storageBuffer.value.length as number);
									}
								}

							} else {
								if (!storageBuffer.buffer) {
									storageBuffer.buffer = device.createBuffer({
										label: storage.name,
										size: storage.type.size,
										usage,
									});
								}
								//throw new Error('code me: storage is neither a struct nor an array');*
								const s = storageBuffer.value;
								if (s !== undefined && s !== null) {
									writePrimitive(device.queue, storageBuffer.buffer, storage.type.name, s as number | vec3, 0);
								}
							}
							groups.set(storage.group, storage.binding, { buffer: storageBuffer.buffer!, bufferType, access, visibility });
						} else {
							errorOnce(`unknwon storage ${storage.name} in ${material.getShaderSource() + '.wgsl'}`);
						}
					}
				}
				break;
		}
	}
}

function writePrimitive(queue: GPUQueue, buffer: GPUBuffer, type: string, /*member: MemberInfo, */value: number | vec3, baseOffset: number): void {
	switch (type) {
		case 'u32':
			queue.writeBuffer(
				buffer,
				baseOffset,
				new Uint32Array([value as number]),
			);
			break;
		case 'i32':
			queue.writeBuffer(
				buffer,
				baseOffset,
				new Int32Array([value as number]),
			);
			break;
		case 'f32':
			queue.writeBuffer(
				buffer,
				baseOffset,
				new Float32Array([value as number]),
			);
			break;
		case 'vec2f':
			queue.writeBuffer(
				buffer,
				baseOffset,
				value as vec2 as BufferSource,
			);
			break;
		case 'vec3f':
			queue.writeBuffer(
				buffer,
				baseOffset,
				value as vec3 as BufferSource,
			);
			break;
		case 'vec4f':
			queue.writeBuffer(
				buffer,
				baseOffset,
				value as vec4 as BufferSource,
			);
			break;
		default:
			throw new Error(`unknwon type ${type} in writePrimitive`);
	}
}

function writeStruct(queue: GPUQueue, buffer: GPUBuffer, members: MemberInfo[], struct: StorageValueStruct, baseOffset: number): void {
	for (const member of members) {
		const structValue = struct[member.name];

		if (member.isTemplate) {
			writeTemplate(queue, buffer, member.type, structValue as StorageValueArray, baseOffset + member.offset);
		} else if (member.isStruct) {
			// nested struct
			if (structValue) {
				writeStruct(queue, buffer, (member.type as StructInfo).members, structValue as StorageValueStruct, baseOffset + member.offset);
			}
		} else if (member.isArray) {
			writeArray(queue, buffer, (member.type as ArrayInfo), structValue as StorageValueArray, baseOffset + member.offset);
		} else {
			// primitive
			if (structValue !== undefined && structValue !== null) {
				writePrimitive(queue, buffer, member.type.name, structValue as number, baseOffset + member.offset);
			} else {
				errorOnce(`Primitive value is ${structValue} in writeStruct for member ${member.name}`);
			}
		}
	}
}

function writeTemplate(queue: GPUQueue, buffer: GPUBuffer, type: TypeInfo, value: StorageValueArray, offset: number): void {
	switch (type.name) {
		case 'vec4':
			queue.writeBuffer(
				buffer,
				offset,
				value as BufferSource,
			);

			break;
		default:
			throw new Error(`code this type ${type.name}`);
	}
}

function writeArray(queue: GPUQueue, buffer: GPUBuffer, type: ArrayInfo, value: StorageValueArray, baseOffset: number): void {
	if (type.format.isStruct) {
		for (let i = 0; i < type.count; ++i) {
			writeStruct(queue, buffer, (type.format as StructInfo).members, value[i] as StorageValueStruct, baseOffset + i * type.stride);
		}
	} else if (type.format.isArray) {
		throw new Error('code me');
	} else {
		throw new Error('code me');
	}
}
