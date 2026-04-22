import { mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { errorOnce, Map2, once } from 'harmony-utils';
import { StructInfo, WgslReflect } from 'wgsl_reflect';
import { BackGroundResult } from '../backgrounds/background';
import { USE_STATS } from '../buildoptions';
import { Camera } from '../cameras/camera';
import { EngineEntityAttributes, Entity } from '../entities/entity';
import { SceneNode } from '../entities/scenenode';
import { BufferGeometry } from '../geometry/buffergeometry';
import { InstancedBufferGeometry } from '../geometry/instancedbuffergeometry';
import { Graphics } from '../graphics/graphics2';
import { renderParticles } from '../graphics/render';
import { WebGPUInternal } from '../graphics/webgpuinternal';
import { InternalRenderContext } from '../interfaces/rendercontext';
import { ShaderManager } from '../managers/shadermanager';
import { Material, MaterialColorMode } from '../materials/material';
import { Mesh, pickedPrimitive } from '../objects/mesh';
import { FullScreenQuad } from '../primitives/fullscreenquad';
import { Renderer } from '../renderers/renderer';
import { RenderList } from '../renderers/renderlist';
import { Scene } from '../scenes/scene';
import { MAX_PARTICLES_IN_A_SYSTEM } from '../sourceengine/common/particles/constants';
import { Source1ParticleSystem } from '../sourceengine/export';
import { ToneMapping } from '../textures/constants';
import { ShadowMap } from '../textures/shadowmap';
import { getDefines } from '../utils/defines';
import { WebGLStats } from '../utils/webglstats';
import { ShaderType } from '../webgl/types';
import { Binding, WgslModule } from './types';

// remove these when unused
const clearColorError = once(() => console.error('TODO clearColor'));
const clearError = once(() => console.error('TODO clear'));

const tempViewProjectionMatrix = mat4.create();

const pickBufferSize = 8;

const lightDirection = vec3.create();
const vertexEntryPoint = 'vertex_main';
const fragmentEntryPoint = 'fragment_main';
const computeEntryPoint = 'compute_main';

export class WebGPURenderer implements Renderer {
	#renderList = new RenderList();
	#shadowMap = new ShadowMap();
	#frame = 0;
	#materialsShaderModule = new Map2<string, string, WgslModule>();
	#toneMapping = ToneMapping.None;
	#toneMappingExposure = 1.;
	#defines = new Map<string, string>();
	readonly #defaultPickingColor = vec3.create();
	//readonly #pointerPosition = vec2.create();
	//#pickedPrimitive?: GPUBuffer;
	readonly #identityVec2 = vec2.create();
	readonly #fullScreenQuad: FullScreenQuad;

	constructor() {
		this.#fullScreenQuad = new FullScreenQuad();
	}

	render(scene: Scene, camera: Camera, delta: number, context: InternalRenderContext): void {
		const renderList = this.#renderList;
		renderList.reset();
		camera.dirty();//Force matrices to recompute

		const depthTexture = WebGPUInternal.depthTexture;
		if (depthTexture.width != context.width || depthTexture.height != context.height) {
			WebGPUInternal.depthTexture.destroy();

			WebGPUInternal.depthTexture = WebGPUInternal.device.createTexture({
				size: [WebGPUInternal.gpuContext.canvas.width, WebGPUInternal.gpuContext.canvas.height],
				format: 'depth24plus',
				usage: GPUTextureUsage.RENDER_ATTACHMENT,
			});
		}


		//this.#shadowMap.render(this, renderList, camera, context);
		let backGroundResult: BackGroundResult = { clearColor: false };
		if (scene.background) {
			backGroundResult = scene.background.render(this, camera, context);
		}

		this.#prepareRenderList(renderList, scene, camera, delta, context, backGroundResult.clearValue);

		this.#renderRenderList(renderList, camera, true, context, backGroundResult.clearColor, backGroundResult.clearValue);
		++this.#frame;
	}

	renderShadowMap(renderList: RenderList, camera: Camera, renderLights: boolean, context: InternalRenderContext/*, lightPos?: vec3*/): void {
		this.#renderRenderList(renderList, camera, renderLights, context, false, undefined/*, lightPos*/);
	}

	invalidateShaders(): void {
		this.#materialsShaderModule.clear();
	}

	clear(/*color: boolean, depth: boolean, stencil: boolean*/): void {
		clearError();
	}

	clearColor(/*clearColor: vec4*/): void {
		clearColorError();
	}

	setToneMapping(toneMapping: ToneMapping): void {
		this.#toneMapping = toneMapping;
		Graphics.setDefine('TONE_MAPPING', `${toneMapping}`);
	}

	getToneMapping(): ToneMapping {
		return this.#toneMapping;
	}

	setToneMappingExposure(exposure: number): void {
		this.#toneMappingExposure = exposure;
		Graphics.setDefine('TONE_MAPPING_EXPOSURE', `${exposure.toFixed(2)}`);
	}

	getToneMappingExposure(): number {
		return this.#toneMappingExposure;
	}

	#prepareRenderList(renderList: RenderList, scene: Scene, camera: Camera, delta: number, context: InternalRenderContext, clearValue: GPUColorDict | undefined): void {
		renderList.reset();
		let currentObject: Entity | undefined = scene;
		const objectStack: Entity[] = [];
		//scene.pointLights = scene.getChildList(PointLight);
		//scene.ambientLights = scene.getChildList(AmbientLight);

		while (currentObject) {
			if (currentObject.getAttribute(EngineEntityAttributes.IsTool, false) && context.renderContext.DisableToolRendering) {
				currentObject = objectStack.shift();
				continue;
			}

			if ((currentObject as Source1ParticleSystem).isParticleSystem && !renderParticles) {
				currentObject = objectStack.shift();
				continue;
			}

			//objectStack.push(currentObject);
			for (const child of currentObject.children) {
				if (true || child.constructor.name !== 'Skeleton') {
					objectStack.push(child);
				}
			}

			if ((currentObject as SceneNode).isSceneNode && (currentObject as SceneNode).entity) {
				objectStack.push((currentObject as SceneNode).entity!);
			}

			if (currentObject.isRenderable) {
				renderList.addObject(currentObject);
			} else {
				currentObject.update(scene, camera, delta);
			}
			currentObject = objectStack.shift();
		}

		if (clearValue && context.viewport) {
			const material = this.#fullScreenQuad.getMaterial();
			material.setDefine('ALWAYS_BEHIND');
			material.setColor(vec4.fromValues(clearValue.r, clearValue.g, clearValue.b, clearValue.a));
			material.setColorMode(MaterialColorMode.PerMesh);
			renderList.addObject(this.#fullScreenQuad);
		}

		renderList.finish();
	}

	#renderRenderList(renderList: RenderList, camera: Camera, renderLights: boolean, context: InternalRenderContext, clearColor: boolean, clearValue?: GPUColorDict/*, lightPos?: vec3*/): void {
		let clearDepth = true;
		const pickPromises: Promise<[Mesh, number] | null>[] = [];

		for (const child of renderList.opaqueList) {
			const pickPromise = this.#renderObject(context, renderList, child, camera, clearColor, clearDepth, clearValue, renderLights/*, lightPos*/);
			if (pickPromise) {
				pickPromises.push(pickPromise);
			}
			clearDepth = false;
			clearColor = false;
		}

		if (renderLights) {
			for (const child of renderList.transparentList) {
				const pickPromise = this.#renderObject(context, renderList, child, camera, clearColor, clearDepth, clearValue, renderLights/*, lightPos*/);
				if (pickPromise) {
					pickPromises.push(pickPromise);
				}
				clearColor = false;
			}
		}

		if (pickPromises.length) {
			Promise.allSettled(pickPromises).then(async () => {
				let min = Infinity;
				let closest: Mesh | null = null;
				for (const pickPromise of pickPromises) {
					await pickPromise.then((value: [Mesh, number] | null) => {
						if (value && value[1] < min) {
							min = value[1];
							closest = value[0];
						}
					});
				}

				context.renderContext.pick?.resolve?.(closest);
			});
		} else {
			context.renderContext.pick?.resolve?.(null);
		}
	}

	#renderObject(context: InternalRenderContext, renderList: RenderList, object: Mesh, camera: Camera, clearColor: boolean, clearDepth: boolean, clearValue?: GPUColorDict, renderLights = true/*, lightPos?: vec3*/): Promise<[Mesh, number] | null> | void {
		if (!object.isRenderable) {
			return;
		}
		if (object.isVisible() === false) {
			return;
		}

		const geometry: BufferGeometry | InstancedBufferGeometry = object.getGeometry();
		const material: Material = object.getMaterial();

		if (geometry.count === 0) {
			return;
		}
		if (!renderLights) {
			if (!object.castShadow) {
				return;
			}
		}

		const geometryAttributes = geometry.attributes;
		const indexAttribute = geometryAttributes.get('index');

		const pick = context.renderContext.pick;

		material.updateMaterial(Graphics.getTime(), object);//TODO: frame delta

		const defines = new Map<string, string>(this.#defines);// TODO: don't create one each time
		defines.set('MAX_PARTICLES_IN_A_SYSTEM', `${MAX_PARTICLES_IN_A_SYSTEM}`);

		if (pick) {
			defines.set('PICKING_MODE', '');
		}

		if (geometryAttributes.has('aVertexNormal')) {
			defines.set('HAS_NORMALS', '');
		}

		getDefines(object, defines);
		getDefines(material, defines);

		if (renderLights) {
			this.#setLights(renderList.pointLights.length, renderList.spotLights.length, renderList.pointLightShadows, renderList.spotLightShadows, defines);
		} else {
			this.#unsetLights(defines);
		}

		const shaderModule = this.#getShaderModule(material, defines);
		if (!shaderModule) {
			return;
		}

		const device = WebGPUInternal.device;

		const indices = indexAttribute?._array;

		let indexBuffer: GPUBuffer | undefined = indexAttribute?.gpuBuffer;
		if (indexAttribute && indices && (indexAttribute.dirty || !indexAttribute.gpuBuffer)) {
			const size = Math.ceil(indices.length / 2) * 4;

			if (indexBuffer) {
				indexBuffer.destroy();
			}

			indexBuffer = device.createBuffer({
				label: 'index',
				size: size,
				usage: GPUBufferUsage.INDEX,
				mappedAtCreation: true,
			});

			new Uint16Array(indexBuffer.getMappedRange()).set(indices);
			indexBuffer.unmap();
			indexAttribute.gpuBuffer = indexBuffer;
			indexAttribute.dirty = false;
		}

		const cameraMatrix = camera.cameraMatrix;
		const projectionMatrix = camera.projectionMatrix;
		mat4.mul(object._mvMatrix, cameraMatrix, object.worldMatrix);
		mat4.mul(tempViewProjectionMatrix, projectionMatrix, cameraMatrix);//TODO: compute this in camera

		//const groups = new Map2<number, number, Binding>();

		if (renderLights) {
			material.beforeRender(camera);
		}

		const uniforms = new Map<string, BufferSource>();

		uniforms.set('meshColor', material.color as BufferSource);

		if (renderLights) {
			this.#setupLights(renderList, camera, cameraMatrix, uniforms);
		}

		/*
		this.#populateBindGroups(shaderModule, groups, material, object, camera, uniforms, context, false);

		const pipelineLayout = device.createPipelineLayout({
			label: material.getShaderSource(),
			bindGroupLayouts: this.#getBindGroupLayouts(groups, false),
		});
		*/
		const [pipelineLayout, groups] = object.getPipelineLayout(shaderModule/*, groups*/, camera, uniforms, context, false);

		const commandEncoder = device.createCommandEncoder();

		if (pick && pickedPrimitive) {
			commandEncoder.clearBuffer(pickedPrimitive);
		}

		let view = WebGPUInternal.gpuContext.getCurrentTexture().createView();

		let pipelineColorFormat = WebGPUInternal.format;
		const renderTarget = context.renderContext.renderTarget;
		if (renderTarget) {
			const gpuTexture = renderTarget.getTexture().texture as GPUTexture | null;
			if (gpuTexture) {
				view = gpuTexture.createView();
				pipelineColorFormat = gpuTexture.format;
			}
		}

		const renderPassDescriptor: GPURenderPassDescriptor = {
			colorAttachments: [{
				clearValue,
				// Notice: clear ignore scissor test
				loadOp: (clearColor && !context.viewport) ? 'clear' : 'load',
				storeOp: 'store',
				view,
			}],
			depthStencilAttachment: {
				view: WebGPUInternal.depthTexture.createView(),
				depthClearValue: 1.0,
				depthLoadOp: clearDepth ? 'clear' : 'load',
				depthStoreOp: 'store',
			},
		};

		const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
		if (context.viewport) {
			const viewport = context.viewport;
			const width = context?.width ?? 0;
			const height = context?.height ?? 0;

			const x = Math.round(viewport.x * width);
			const y = Math.round(viewport.y * height);
			const w = Math.round((viewport.x + viewport.width) * width) - x;
			const h = Math.round((viewport.y + viewport.height) * height) - y;

			passEncoder.setViewport(x, y, w, h, viewport.minDepth, viewport.maxDepth);
			passEncoder.setScissorRect(x, y, w, h);
		}

		if (indexBuffer) {
			passEncoder.setIndexBuffer(indexBuffer, 'uint16');// TODO: this could also be uint32
		}
		const vertexBuffers: GPUVertexBufferLayout[] = [];
		for (const [, attribute] of geometryAttributes) {
			const location = shaderModule.attributes.get(attribute.wgslName);
			if (location === undefined) {
				continue;
			}

			if (attribute.dirty || !attribute.gpuBuffer) {
				const attributeArray = attribute._array;

				if (attribute.gpuBuffer) {
					attribute.gpuBuffer.destroy();
				}

				if (attributeArray) {
					attribute.gpuBuffer = device.createBuffer({
						label: attribute.wgslName,
						size: attributeArray.length * attribute.elementSize,
						usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
					});
					device.queue.writeBuffer(attribute.gpuBuffer, 0, attributeArray as BufferSource, 0, attributeArray.length);
					attribute.dirty = false;
				}
			}
			passEncoder.setVertexBuffer(location, attribute.gpuBuffer);


			vertexBuffers.push({
				attributes: [
					{
						shaderLocation: location,
						offset: 0,// TODO: add a var
						format: attribute.wgslFormat,//'float32x3',
					},
				],
				arrayStride: attribute.elementSize * attribute.itemSize,
				stepMode: attribute.divisor === 0 ? 'vertex' : 'instance',
			});
		}

		const pipelineDescriptor: GPURenderPipelineDescriptor = {
			label: object.name,
			vertex: {
				module: shaderModule.module,
				entryPoint: vertexEntryPoint,
				buffers: vertexBuffers,
				constants: material.gpuConstants,
			},
			fragment: {
				module: shaderModule.module,
				entryPoint: fragmentEntryPoint,
				constants: material.gpuConstants,
				targets: [{
					format: pipelineColorFormat,
					blend: material.getWebGPUBlending(),
				}],
			},
			primitive: {
				topology: object.topology,
				cullMode: material.getWebGPUCullMode(),
			},
			depthStencil: {
				depthWriteEnabled: material.depthMask,
				depthCompare: material.depthTest ? 'less' : 'always',
				format: 'depth24plus',
				depthBias: material.polygonOffset ? -material.polygonOffsetFactor * material.polygonOffsetUnits : 0,
			},
			layout: pipelineLayout,
		};

		const renderPipeline = device.createRenderPipeline(pipelineDescriptor);

		/*
		for (const [groupId, group] of groups.getMap()) {
			const entries: GPUBindGroupEntry[] = [];
			for (const [bindingId, uniformBuffer] of group) {
				if (uniformBuffer.buffer) {
					entries.push({
						binding: bindingId,// corresponds to @binding
						resource: {
							buffer: uniformBuffer.buffer,
						},
					});
				}

				const uniformTexture = uniformBuffer.texture;
				if (uniformTexture) {
					if (uniformTexture.isCube) {
						entries.push({
							binding: bindingId,// corresponds to @binding
							resource: (uniformTexture.texture as GPUTexture).createView({
								dimension: 'cube',
							}),
						});
					} else {
						entries.push({
							binding: bindingId,// corresponds to @binding
							resource: uniformTexture.texture as GPUTexture,
						});
					}
				}
				if (uniformBuffer.sampler) {
					entries.push({
						binding: bindingId,// corresponds to @binding
						resource: uniformBuffer.sampler,
					});
				}
			}

			const uniformBindGroup = device.createBindGroup({
				label: `Binding group: ${groupId}`,
				layout: renderPipeline.getBindGroupLayout(groupId),// corresponds to @group
				entries: entries,
			});
			passEncoder.setBindGroup(groupId, uniformBindGroup);
		}
		*/

		this.#createBindGroups(groups, renderPipeline, passEncoder);

		passEncoder.setPipeline(renderPipeline);
		if (indexBuffer) {
			passEncoder.drawIndexed(geometry.count, (geometry as InstancedBufferGeometry).instanceCount);
		} else {
			passEncoder.draw(geometry.count, (geometry as InstancedBufferGeometry).instanceCount);
		}

		// End the render pass
		passEncoder.end();


		let stagingBuffer: GPUBuffer;
		if (pick && pickedPrimitive) {
			stagingBuffer = device.createBuffer({// TODO: destroy buffer
				size: pickBufferSize,
				usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
			});
			commandEncoder.copyBufferToBuffer(
				pickedPrimitive,
				stagingBuffer,
			);
		}

		// 10: End frame by passing array of command buffers to command queue for execution
		device.queue.submit([commandEncoder.finish()]);

		if (USE_STATS) {
			WebGLStats.drawElements(object.renderMode, geometry.count);
		}

		if (stagingBuffer!) {
			const promise = new Promise<[Mesh, number] | null>((resolve) => {
				stagingBuffer.mapAsync(
					GPUMapMode.READ,
					0, // Offset
					pickBufferSize,
				).then(() => {
					const copyArrayBuffer = stagingBuffer.getMappedRange(0, pickBufferSize);
					const data = copyArrayBuffer.slice();
					stagingBuffer.destroy();
					const result = new Float32Array(data);
					if (result[0]) {
						resolve([object, new Float32Array(data)[1]!]);
					} else {
						resolve(null);
					}
				});
			});

			return promise;
		}
	}

	#setupLights(renderList: RenderList, camera: Camera, viewMatrix: mat4, uniforms: Map<string, BufferSource>): void {
		//const uniforms = new Map<string, any>();
		//const lightPositionCameraSpace = vec3.create();//TODO: do not create a vec3
		//const lightPositionWorldSpace = vec3.create();//TODO: do not create a vec3
		//const colorIntensity = vec3.create();//TODO: do not create a vec3
		const pointLights = renderList.pointLights;//scene.getChildList(PointLight);
		const spotLights = renderList.spotLights;

		let shadow;
		let pointLightId = 0;
		//const pointShadowMap = [];
		//const pointShadowMatrix = [];

		for (const pointLight of pointLights) {
			if (pointLight.isVisible()) {
				const lightPositionWorldSpace = vec3.create();//TODO: do not create a vec3
				const lightPositionCameraSpace = vec3.create();//TODO: do not create a vec3
				pointLight.getWorldPosition(lightPositionWorldSpace);
				vec3.transformMat4(lightPositionCameraSpace, lightPositionWorldSpace, viewMatrix);

				const colorIntensity = vec3.scale(vec3.create(), pointLight.color, pointLight.intensity);

				uniforms.set('pointLights[' + pointLightId + '].position', lightPositionCameraSpace as BufferSource);
				uniforms.set('pointLights[' + pointLightId + '].color', colorIntensity as BufferSource);
				uniforms.set('pointLights[' + pointLightId + '].range', new Float32Array([pointLight.range]) as BufferSource);

				uniforms.set('pbrLights[' + pointLightId + '].position', lightPositionWorldSpace as BufferSource);
				uniforms.set('pbrLights[' + pointLightId + '].radiance', colorIntensity as BufferSource);

				shadow = pointLight.shadow;
				if (shadow && pointLight.castShadow) {
					//TODO
					/*
					pointShadowMap.push(shadow.renderTarget.getTexture());
					pointShadowMatrix.push(shadow.shadowMatrix);
					program.setUniformValue('uPointLightShadows[' + pointLightId + '].mapSize', shadow.textureSize);
					program.setUniformValue('uPointLightShadows[' + pointLightId + '].near', shadow.camera.nearPlane);
					program.setUniformValue('uPointLightShadows[' + pointLightId + '].far', shadow.camera.farPlane);
					program.setUniformValue('uPointLightShadows[' + pointLightId + '].enabled', true);
					*/
				}
				++pointLightId;
			}
		}

		//program.setUniformValue('uPointShadowMap[0]', pointShadowMap);
		//program.setUniformValue('uPointShadowMatrix[0]', pointShadowMatrix);


		let spotLightId = 0;
		//const spotShadowMap = [];
		//const spotShadowMatrix = [];

		for (const spotLight of spotLights) {
			if (spotLight.isVisible()) {
				const lightPositionCameraSpace = vec3.create();//TODO: do not create a vec3
				spotLight.getWorldPosition(lightPositionCameraSpace);
				vec3.transformMat4(lightPositionCameraSpace, lightPositionCameraSpace, viewMatrix);
				uniforms.set('spotLights[' + spotLightId + '].position', lightPositionCameraSpace as BufferSource);
				uniforms.set('spotLights[' + spotLightId + '].color', vec3.scale(vec3.create(), spotLight.color, spotLight.intensity) as BufferSource);
				uniforms.set('spotLights[' + spotLightId + '].range', new Float32Array([spotLight.range]) as BufferSource);
				uniforms.set('spotLights[' + spotLightId + '].innerAngleCos', new Float32Array([spotLight.innerAngleCos]) as BufferSource);
				uniforms.set('spotLights[' + spotLightId + '].outerAngleCos', new Float32Array([spotLight.outerAngleCos]) as BufferSource);
				//program.setUniformValue('spotLights[' + spotLightId + '].direction', spotLight.getDirection(tempVec3));
				//program.setUniformValue('spotLights[' + spotLightId + '].direction', [0, 0, -1]);

				spotLight.getDirection(lightDirection);
				const m = viewMatrix;
				const x = lightDirection[0];
				const y = lightDirection[1];
				const z = lightDirection[2];
				lightDirection[0] = m[0] * x + m[4] * y + m[8] * z;
				lightDirection[1] = m[1] * x + m[5] * y + m[9] * z;
				lightDirection[2] = m[2] * x + m[6] * y + m[10] * z;
				uniforms.set('spotLights[' + spotLightId + '].direction', lightDirection as BufferSource);

				shadow = spotLight.shadow;
				if (shadow && spotLight.castShadow) {
					/*
					TODO
					spotShadowMap.push(shadow.renderTarget.getTexture());
					spotShadowMatrix.push(shadow.shadowMatrix);
					uniforms.set('uSpotLightShadows[' + spotLightId + '].mapSize', shadow.textureSize);
					uniforms.set('uSpotLightShadows[' + spotLightId + '].enabled', true);
					*/
				}
				++spotLightId;
			}
		}
		//program.setUniformValue('uSpotShadowMap[0]', spotShadowMap);
		//program.setUniformValue('uSpotShadowMatrix[0]', spotShadowMatrix);

		const ambientLights = renderList.ambientLights;//scene.getChildList(AmbientLight);
		const ambientAccumulator = vec3.create();//TODO: do not create a vec3
		for (const ambientLight of ambientLights) {
			if (ambientLight.isVisible()) {
				vec3.scaleAndAdd(ambientAccumulator, ambientAccumulator, ambientLight.color, ambientLight.intensity);
			}
		}

		//shaderModule.reflection?.uniforms.
		uniforms.set('ambientLight', ambientAccumulator as BufferSource);

		//return uniforms;
	}

	/**
	 * Get a shader module for the material
	 * @param material The material
	 * @returns a shader module or null
	 */
	#getShaderModule(material: Material, defines: Map<string, string>): WgslModule | null {
		const shaderName = material.getShaderSource() + '.wgsl';

		let key = '';
		for (const define of defines) {
			key += define[0] + '\n' + define[1] + '\n';
		}

		let shaderModule = this.#materialsShaderModule.get(shaderName, key);
		if (shaderModule) {
			return shaderModule;
		}

		const shaderSource = ShaderManager.getShaderSource(ShaderType.Wgsl, shaderName);
		if (!shaderSource) {
			return null;
		}

		WebGPUInternal.device.pushErrorScope('validation');
		const definesSnapshot = new Map(defines);
		const source = shaderSource.getCompileSourceWebGPU(defines);
		const module = WebGPUInternal.device.createShaderModule({
			code: source,
			label: shaderName,
		});

		WebGPUInternal.device.popErrorScope().then(error => {
			if (error) {
				const m = 'Compile error in ' + shaderName + '. Reason : ' + error.message;
				console.warn(m, shaderSource.getCompileSourceLineNumber(source), m);
			}
		});

		module.getCompilationInfo().then(shaderInfo => shaderSource.setCompilationInfo(shaderInfo, definesSnapshot));

		// Schedule the execution to validate the shader
		WebGPUInternal.device.queue.submit([]);

		let reflection
		try {
			reflection = new WgslReflect(source);
		} catch (e) {
			errorOnce(`failed to reflect wgsl shader ${shaderName} ${e as string}`);
		}

		const attributes = new Map<string, number>();
		if (reflection) {
			// Get the attribute location from reflection
			for (const vertexEntry of reflection.entry.vertex) {
				if (vertexEntry.name == vertexEntryPoint) {
					for (const argument of vertexEntry.arguments) {
						if (argument.attributes) {
							for (const argumentAttribute of argument.attributes) {
								if (argumentAttribute.name == 'location') {
									attributes.set(argument.name, Number(argumentAttribute.value));
								}
							}
						} else {
							const type = argument.type as StructInfo;
							for (const member of type.members) {
								if (member.attributes) {
									for (const argumentAttribute of member.attributes) {
										if (argumentAttribute.name == 'location') {
											attributes.set(member.name, Number(argumentAttribute.value));
										}
									}
								}
							}
						}
					}
				}
			}
		}

		shaderModule = { module, reflection, attributes, source };
		this.#materialsShaderModule.set(shaderName, key, shaderModule);

		return shaderModule;
	}

	#setLights(pointLights: number, spotLights: number, pointLightShadows: number, spotLightShadows: number, defines: Map<string, string>): void {
		/*
		Graphics.setIncludeCode('USE_SHADOW_MAPPING', '#define USE_SHADOW_MAPPING');
		Graphics.setIncludeCode('NUM_POINT_LIGHTS', '#define NUM_POINT_LIGHTS ' + pointLights);
		Graphics.setIncludeCode('NUM_PBR_LIGHTS', '#define NUM_PBR_LIGHTS ' + pointLights);
		Graphics.setIncludeCode('NUM_SPOT_LIGHTS', '#define NUM_SPOT_LIGHTS ' + spotLights);
		Graphics.setIncludeCode('NUM_POINT_LIGHT_SHADOWS', '#define NUM_POINT_LIGHT_SHADOWS ' + pointLightShadows);
		Graphics.setIncludeCode('NUM_SPOT_LIGHT_SHADOWS', '#define NUM_SPOT_LIGHT_SHADOWS ' + spotLightShadows);
		*/
		//TODO: other lights of disable lighting all together
		defines.set('USE_SHADOW_MAPPING', '');
		defines.set('NUM_POINT_LIGHTS', String(pointLights));
		defines.set('NUM_PBR_LIGHTS', String(pointLights));
		defines.set('NUM_SPOT_LIGHTS', String(spotLights));
		defines.set('NUM_POINT_LIGHT_SHADOWS', String(pointLightShadows));
		defines.set('NUM_SPOT_LIGHT_SHADOWS', String(spotLightShadows));
		/*
		return `
	#define USE_SHADOW_MAPPING
	#define NUM_POINT_LIGHTS ${pointLights}
	#define NUM_PBR_LIGHTS ${pointLights}
	#define NUM_SPOT_LIGHTS ${spotLights}
	#define NUM_POINT_LIGHT_SHADOWS ${pointLightShadows}
	#define NUM_SPOT_LIGHT_SHADOWS ${spotLightShadows}
	`
	*/
	}

	#unsetLights(defines: Map<string, string>): void {
		/*
		Graphics.setIncludeCode('USE_SHADOW_MAPPING', '#undef USE_SHADOW_MAPPING');
		Graphics.setIncludeCode('NUM_POINT_LIGHTS', '#define NUM_POINT_LIGHTS 0');
		Graphics.setIncludeCode('NUM_SPOT_LIGHTS', '#define NUM_SPOT_LIGHTS 0');
		Graphics.setIncludeCode('NUM_POINT_LIGHT_SHADOWS', '#define NUM_POINT_LIGHTS 0');
		Graphics.setIncludeCode('NUM_SPOT_LIGHT_SHADOWS', '#define NUM_SPOT_LIGHTS 0');
		//TODO: other lights of disable lighting all together
		*/

		defines.delete('USE_SHADOW_MAPPING');
		defines.set('NUM_POINT_LIGHTS', '0');
		defines.set('NUM_PBR_LIGHTS', '0');
		defines.set('NUM_SPOT_LIGHTS', '0');
		defines.set('NUM_POINT_LIGHT_SHADOWS', '0');
		defines.set('NUM_SPOT_LIGHT_SHADOWS', '0');
		/*
		return `
	#undef USE_SHADOW_MAPPING
	#define NUM_POINT_LIGHTS 0
	#define NUM_PBR_LIGHTS 0
	#define NUM_SPOT_LIGHTS 0
	#define NUM_POINT_LIGHT_SHADOWS 0
	#define NUM_SPOT_LIGHT_SHADOWS 0
	`
	*/
	}

	/*
	setPointerPosition(x: uint, y: uint): void {
		// TODO: implement
		this.#pointerPosition[0] = x;
		this.#pointerPosition[1] = y;
	}
	*/

	setDefine(define: string, value = ''): void {
		this.#defines.set(define, value);
	}

	removeDefine(define: string): void {
		this.#defines.delete(define);
	}

	compute(mesh: Mesh, context: InternalRenderContext, postCompute?: (commandEncoder: GPUCommandEncoder) => void): void {
		const defines = new Map<string, string>(this.#defines);// TODO: don't create one each time
		const material = mesh.getMaterial();
		getDefines(material, defines);

		const shaderModule = this.#getShaderModule(material, defines);
		if (!shaderModule) {
			return;
		}
		const device = WebGPUInternal.device;

		//const groups = new Map2<number, number, Binding>();

		/*
		this.#populateBindGroups(shaderModule, groups, material, null, null, null, context, true);

		const pipelineLayout = device.createPipelineLayout({
			label: material.getShaderSource(),
			bindGroupLayouts: this.#getBindGroupLayouts(groups, true),
		});
		*/
		const [pipelineLayout, groups] = mesh.getPipelineLayout(shaderModule/*, groups*/, null, null, context, true);

		const pipelineDescriptor: GPUComputePipelineDescriptor = {
			compute: {
				module: shaderModule.module,
				entryPoint: computeEntryPoint,
				constants: material.gpuConstants,
			},
			layout: pipelineLayout,
		};

		const computePipeline = device.createComputePipeline(pipelineDescriptor);

		const encoder = device.createCommandEncoder({ label: 'compute encoder' });
		const passEncoder = encoder.beginComputePass({});

		passEncoder.setPipeline(computePipeline);
		//pass.setBindGroup(0, bindGroup);

		this.#createBindGroups(groups, computePipeline, passEncoder);
		passEncoder.dispatchWorkgroups(context.renderContext.workgroupCountX ?? 1, context.renderContext.workgroupCountY ?? 1, context.renderContext.workgroupCountZ ?? 1);
		passEncoder.end();

		postCompute?.(encoder);

		const commandBuffer = encoder.finish();
		device.queue.submit([commandBuffer]);
	}

	#createBindGroups(groups: Map2<number, number, Binding>, pipeline: GPUComputePipeline | GPURenderPipeline, encoder: GPUComputePassEncoder | GPURenderPassEncoder): void {
		const device = WebGPUInternal.device;

		for (const [groupId, group] of groups.getMap()) {
			const entries: GPUBindGroupEntry[] = [];
			for (const [bindingId, uniformBuffer] of group) {
				if (uniformBuffer.buffer) {
					entries.push({
						binding: bindingId,// corresponds to @binding
						resource: {
							buffer: uniformBuffer.buffer,
						},
					});
				}

				const uniformTexture = uniformBuffer.texture ?? uniformBuffer.storageTexture;
				if (uniformTexture) {
					if (!uniformBuffer.viewDimension) {
						throw new Error(`missing viewDimension for texture ${JSON.stringify(uniformBuffer)}`);
					}
					if (uniformTexture.isCube) {
						entries.push({
							binding: bindingId,// corresponds to @binding
							resource: (uniformTexture.texture as GPUTexture).createView({
								dimension: uniformBuffer.viewDimension,
							}),
						});
					} else {
						entries.push({
							binding: bindingId,// corresponds to @binding
							resource: uniformTexture.texture as GPUTexture,
						});
					}
				} else {
					const uniformTextureArray = uniformBuffer.textureArray ?? uniformBuffer.storageTextureArray;
					if (uniformTextureArray) {
						entries.push({
							binding: bindingId,// corresponds to @binding
							resource: (uniformTextureArray[0]!.texture as GPUTexture).createView({
								dimension: uniformBuffer.viewDimension,
							}),
						});
					}
				}

				if (uniformBuffer.sampler) {
					entries.push({
						binding: bindingId,// corresponds to @binding
						resource: uniformBuffer.sampler,
					});
				}
			}

			const uniformBindGroup = device.createBindGroup({
				label: `Binding group: ${groupId}`,
				layout: pipeline.getBindGroupLayout(groupId),// corresponds to @group
				entries: entries,
			});
			encoder.setBindGroup(groupId, uniformBindGroup);
		}
	}
}
