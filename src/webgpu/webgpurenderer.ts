import { mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { Map2, once } from 'harmony-utils';
import { StructInfo, TemplateInfo, TypeInfo, VariableInfo, WgslReflect } from 'wgsl_reflect';
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
import { Mesh } from '../objects/mesh';
import { FullScreenQuad } from '../primitives/fullscreenquad';
import { Renderer } from '../renderers/renderer';
import { RenderList } from '../renderers/renderlist';
import { Scene } from '../scenes/scene';
import { MAX_PARTICLES_IN_A_SYSTEM } from '../sourceengine/common/particles/constants';
import { Source1ParticleSystem } from '../sourceengine/export';
import { ToneMapping } from '../textures/constants';
import { ShadowMap } from '../textures/shadowmap';
import { Texture } from '../textures/texture';
import { errorOnce } from '../utils/console';
import { WebGLStats } from '../utils/webglstats';
import { ShaderType } from '../webgl/types';
import { UniformValue } from '../webgl/uniform';

// remove these when unused
const clearColorError = once(() => console.error('TODO clearColor'));
const clearError = once(() => console.error('TODO clear'));

const tempViewProjectionMatrix = mat4.create();

const pickBufferSize = 8;

type WgslModule = {
	module: GPUShaderModule;
	reflection?: WgslReflect;
	attributes: Map<string, number>;
	source: string;
}

type Binding = {
	buffer?: GPUBuffer,
	bufferType?: GPUBufferBindingType,
	texture?: Texture,
	textureArray?: (Texture | undefined)[],
	sampler?: GPUSampler,
	storageTexture?: Texture,
	storageTextureArray?: (Texture | undefined)[],
	access?: GPUStorageTextureAccess,
	visibility?: GPUShaderStageFlags,
	// for Textures
	viewDimension?: GPUTextureViewDimension,
	format?: GPUTextureFormat,
};

//const lightDirection = vec3.create();
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
	#pickedPrimitive?: GPUBuffer;
	readonly #identityVec2 = vec2.create();

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
		Graphics.setIncludeCode('TONE_MAPPING', `#define TONE_MAPPING ${toneMapping}`);
	}

	getToneMapping(): ToneMapping {
		return this.#toneMapping;
	}

	setToneMappingExposure(exposure: number): void {
		this.#toneMappingExposure = exposure;
		Graphics.setIncludeCode('TONE_MAPPING_EXPOSURE', `#define TONE_MAPPING_EXPOSURE ${exposure.toFixed(2)}`);
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
			const fullScreenQuad = new FullScreenQuad();
			const material = fullScreenQuad.getMaterial();
			material.setDefine('ALWAYS_BEHIND');
			material.setColor(vec4.fromValues(clearValue.r, clearValue.g, clearValue.b, clearValue.a));
			material.setColorMode(MaterialColorMode.PerMesh);
			renderList.addObject(fullScreenQuad);
		}

		renderList.finish();
	}

	#renderRenderList(renderList: RenderList, camera: Camera, renderLights: boolean, context: InternalRenderContext, clearColor: boolean, clearValue?: GPUColorDict/*, lightPos?: vec3*/): void {
		let clearDepth = true;
		const pickPromises: Promise<[Mesh, number] | null>[] = [];

		for (const child of renderList.opaqueList) {
			const pickPromise = this.#renderObject(context, renderList, child, camera, child.getGeometry(), child.getMaterial(), clearColor, clearDepth, clearValue, renderLights/*, lightPos*/);
			if (pickPromise) {
				pickPromises.push(pickPromise);
			}
			clearDepth = false;
			clearColor = false;
		}

		if (renderLights) {
			for (const child of renderList.transparentList) {
				const pickPromise = this.#renderObject(context, renderList, child, camera, child.getGeometry(), child.getMaterial(), clearColor, clearDepth, clearValue, renderLights/*, lightPos*/);
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

	#renderObject(context: InternalRenderContext, renderList: RenderList, object: Mesh, camera: Camera, geometry: BufferGeometry | InstancedBufferGeometry, material: Material, clearColor: boolean, clearDepth: boolean, clearValue?: GPUColorDict, renderLights = true/*, lightPos?: vec3*/): Promise<[Mesh, number] | null> | void {
		if (!object.isRenderable) {
			return;
		}
		if (object.isVisible() === false) {
			return;
		}
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
		if (!indexAttribute) {
			return;
		}

		const pick = context.renderContext.pick;

		material.updateMaterial(Graphics.getTime(), object);//TODO: frame delta

		const defines = new Map<string, string>(this.#defines);// TODO: don't create one each time
		defines.set('MAX_PARTICLES_IN_A_SYSTEM', String(MAX_PARTICLES_IN_A_SYSTEM));

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

		const indices = indexAttribute._array;
		if (!indices) {
			return;
		}

		let indexBuffer: GPUBuffer | undefined = indexAttribute.gpuBuffer;
		if (indexAttribute.dirty || !indexAttribute.gpuBuffer) {
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

		const groups = new Map2<number, number, Binding>();

		if (renderLights) {
			material.beforeRender(camera);
		}

		const uniforms = new Map<string, BufferSource>();

		uniforms.set('meshColor', material.color as BufferSource);

		if (renderLights) {
			this.#setupLights(renderList, camera, cameraMatrix, uniforms);
		}

		this.#populateBindGroups(shaderModule, groups, material, object, camera, uniforms, context, false);

		const pipelineLayout = device.createPipelineLayout({
			label: material.getShaderSource(),
			bindGroupLayouts: this.#getBindGroupLayouts(groups, false),
		});

		const commandEncoder = device.createCommandEncoder();

		if (pick && this.#pickedPrimitive) {
			commandEncoder.clearBuffer(this.#pickedPrimitive);
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

		passEncoder.setIndexBuffer(indexBuffer!, 'uint16');// TODO: this could also be uint32
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
				buffers: vertexBuffers
			},
			fragment: {
				module: shaderModule.module,
				entryPoint: fragmentEntryPoint,
				targets: [{
					format: pipelineColorFormat,
					blend: material.getWebGPUBlending(),
				}]
			},
			primitive: {
				topology: 'triangle-list',
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
		if ((geometry as InstancedBufferGeometry).instanceCount === undefined) {
			passEncoder.drawIndexed(geometry.count);
		} else {
			passEncoder.drawIndexed(geometry.count, (geometry as InstancedBufferGeometry).instanceCount);
		}

		// End the render pass
		passEncoder.end();


		let stagingBuffer: GPUBuffer;
		if (pick && this.#pickedPrimitive) {
			stagingBuffer = device.createBuffer({// TODO: destroy buffer
				size: pickBufferSize,
				usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
			});
			commandEncoder.copyBufferToBuffer(
				this.#pickedPrimitive,
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
		const lightPositionCameraSpace = vec3.create();//TODO: do not create a vec3
		const lightPositionWorldSpace = vec3.create();//TODO: do not create a vec3
		const colorIntensity = vec3.create();//TODO: do not create a vec3
		const pointLights = renderList.pointLights;//scene.getChildList(PointLight);
		//const spotLights = renderList.spotLights;

		let shadow;
		let pointLightId = 0;
		//const pointShadowMap = [];
		//const pointShadowMatrix = [];

		for (const pointLight of pointLights) {
			if (pointLight.isVisible()) {
				pointLight.getWorldPosition(lightPositionWorldSpace);;
				vec3.transformMat4(lightPositionCameraSpace, lightPositionWorldSpace, viewMatrix);

				uniforms.set('pointLights[' + pointLightId + '].position', lightPositionCameraSpace as BufferSource);
				uniforms.set('pointLights[' + pointLightId + '].color', vec3.scale(colorIntensity, pointLight.color, pointLight.intensity) as BufferSource);
				uniforms.set('pointLights[' + pointLightId + '].range', new Float32Array([pointLight.range]) as BufferSource);

				uniforms.set('pbrLights[' + pointLightId + '].position', lightPositionWorldSpace as BufferSource);
				uniforms.set('pbrLights[' + pointLightId + '].radiance', vec3.scale(colorIntensity, pointLight.color, pointLight.intensity) as BufferSource);
				//program.setUniformValue('uPointLights[' + pointLightId + '].position', lightPositionCameraSpace);
				//program.setUniformValue('uPointLights[' + pointLightId + '].color', vec3.scale(colorIntensity, pointLight.color, pointLight.intensity));
				//program.setUniformValue('uPointLights[' + pointLightId + '].range', pointLight.range);
				//program.setUniformValue('uPointLightsuPointLights[' + pointLightId + '].direction', pointLight.getDirection(tempVec3));
				//program.setUniformValue('uPointLights[' + pointLightId + '].direction', [0, 0, -1]);
				//program.setUniformValue('uPbrLights[' + pointLightId + '].position', lightPositionWorldSpace);
				//program.setUniformValue('uPbrLights[' + pointLightId + '].radiance', vec3.scale(colorIntensity, pointLight.color, pointLight.intensity));

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


		//let spotLightId = 0;
		//const spotShadowMap = [];
		//const spotShadowMatrix = [];
		/*
		for (const spotLight of spotLights) {
			if (spotLight.isVisible()) {
				spotLight.getWorldPosition(lightPositionCameraSpace);
				vec3.transformMat4(lightPositionCameraSpace, lightPositionCameraSpace, viewMatrix);
				program.setUniformValue('uSpotLights[' + spotLightId + '].position', lightPositionCameraSpace);
				program.setUniformValue('uSpotLights[' + spotLightId + '].color', vec3.scale(colorIntensity, spotLight.color, spotLight.intensity));
				program.setUniformValue('uSpotLights[' + spotLightId + '].range', spotLight.range);
				program.setUniformValue('uSpotLights[' + spotLightId + '].innerAngleCos', spotLight.innerAngleCos);
				program.setUniformValue('uSpotLights[' + spotLightId + '].outerAngleCos', spotLight.outerAngleCos);
				//program.setUniformValue('uSpotLights[' + spotLightId + '].direction', spotLight.getDirection(tempVec3));
				//program.setUniformValue('uSpotLights[' + spotLightId + '].direction', [0, 0, -1]);

				spotLight.getDirection(lightDirection);
				const m = viewMatrix;
				const x = lightDirection[0];
				const y = lightDirection[1];
				const z = lightDirection[2];
				lightDirection[0] = m[0] * x + m[4] * y + m[8] * z;
				lightDirection[1] = m[1] * x + m[5] * y + m[9] * z;
				lightDirection[2] = m[2] * x + m[6] * y + m[10] * z;
				program.setUniformValue('uSpotLights[' + spotLightId + '].direction', lightDirection);

				shadow = spotLight.shadow;
				if (shadow && spotLight.castShadow) {
					spotShadowMap.push(shadow.renderTarget.getTexture());
					spotShadowMatrix.push(shadow.shadowMatrix);
					program.setUniformValue('uSpotLightShadows[' + spotLightId + '].mapSize', shadow.textureSize);
					program.setUniformValue('uSpotLightShadows[' + spotLightId + '].enabled', true);
				}
				++spotLightId;
			}
		}
		*/
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

	compute(material: Material, context: InternalRenderContext, workgroupCountX: GPUSize32, workgroupCountY?: GPUSize32, workgroupCountZ?: GPUSize32): void {
		const defines = new Map<string, string>(this.#defines);// TODO: don't create one each time
		getDefines(material, defines);

		const shaderModule = this.#getShaderModule(material, defines);
		if (!shaderModule) {
			return;
		}
		const device = WebGPUInternal.device;

		const groups = new Map2<number, number, Binding>();

		this.#populateBindGroups(shaderModule, groups, material, null, null, null, context, true);

		const pipelineLayout = device.createPipelineLayout({
			label: material.getShaderSource(),
			bindGroupLayouts: this.#getBindGroupLayouts(groups, true),
		});

		const pipelineDescriptor: GPUComputePipelineDescriptor = {
			compute: {
				module: shaderModule.module,
				entryPoint: computeEntryPoint,
			},
			layout: pipelineLayout,
		};

		const computePipeline = device.createComputePipeline(pipelineDescriptor);

		const encoder = device.createCommandEncoder({ label: 'compute encoder' });
		const pass = encoder.beginComputePass({});

		pass.setPipeline(computePipeline);
		//pass.setBindGroup(0, bindGroup);

		this.#createBindGroups(groups, computePipeline, pass);
		pass.dispatchWorkgroups(workgroupCountX, workgroupCountY, workgroupCountZ);
		pass.end();

		const commandBuffer = encoder.finish();
		device.queue.submit([commandBuffer]);
	}

	#getBindGroupLayouts(groups: Map2<number, number, Binding>, compute: boolean): GPUBindGroupLayout[] {
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
					entry.buffer = { type: binding.bufferType ?? 'uniform' };
				}

				if (binding.texture) {
					entry.texture = {
						viewDimension: binding.texture.isCube ? 'cube' : '2d',
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

			bindGroupLayouts.push(device.createBindGroupLayout({
				label: `group ${groupId}`,
				entries: entries,
			}));
		}

		return bindGroupLayouts;
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
				} else {
					const uniformTextureArray = uniformBuffer.textureArray ?? uniformBuffer.storageTextureArray;
					if (uniformTextureArray) {
						entries.push({
							binding: bindingId,// corresponds to @binding
							resource: (uniformTextureArray[0]!.texture as GPUTexture).createView({
								dimension: '2d-array',
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

	#populateBindGroups(
		shaderModule: WgslModule,
		groups: Map2<number, number, Binding>,
		material: Material,
		object: Mesh | null,
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
			/*
			let additionalUsage: GPUFlagsConstant = 0;
			if (uniform.name == 'commonUniforms') {// TODO: improve that
				additionalUsage = GPUBufferUsage.STORAGE;
			}
			*/
			const uniformBuffer = device.createBuffer({// TODO: don't recreate buffers each time
				label: uniform.name,
				size: uniform.size,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST/* | additionalUsage*/,
			});

			groups.set(uniform.group, uniform.binding, { buffer: uniformBuffer });

			const members = uniform.members;
			if (members) {

				const materialUniform = material.uniforms[uniform.name] ?? object?.uniforms[uniform.name];
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
							errorOnce(`unknwon member: ${member.name} for uniform ${uniform.name} in ${material.getShaderSource() + '.wgsl'}`);
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
								bufferSource = (context?.renderContext.pick?.position ?? this.#identityVec2) as BufferSource;
								break;
							case 'boneMatrix':
								bufferSource = object?.uniforms[member.name];
								break;
							default:
								errorOnce(`unknwon member: ${member.name} for uniform ${uniform.name} in ${material.getShaderSource() + '.wgsl'}`);
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
					const arrayUniform = material.uniforms[uniform.name] ?? object?.uniforms[uniform.name];
					if (arrayUniform !== undefined) {
						device.queue.writeBuffer(
							uniformBuffer,
							0,
							arrayUniform,
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
					const materialUniform = material.uniforms[uniform.name] ?? object?.uniforms[uniform.name];
					if (materialUniform !== undefined) {
						switch (uniform.type.name) {
							case 'f32':
								device.queue.writeBuffer(
									uniformBuffer,
									0,
									new Float32Array([materialUniform as number]),
								);
								break;
							case 'mat3x3f':
								// In WGSL, mat3x3 actually are mat4x3
								const m = new Float32Array([
									materialUniform[0], materialUniform[1], materialUniform[2], 0,
									materialUniform[3], materialUniform[4], materialUniform[5], 0,
									materialUniform[6], materialUniform[7], materialUniform[8], 0,
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
								errorOnce(`unknwon uniform: ${uniform.name}, setting a default value. Group: ${uniform.group}, binding: ${uniform.binding} in ${material.getShaderSource() + '.wgsl'}`);
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
					const texture = (material.uniforms.colorMap as Texture | undefined);//?.texture as GPUTexture | undefined;
					if (texture) {
						groups.set(shaderTexture.group, shaderTexture.binding, { texture });
					}
					break;
				case 'color2Texture':
					{
						const texture = (material.uniforms.color2Map as Texture | undefined);//?.texture as GPUTexture | undefined;
						if (texture) {
							groups.set(shaderTexture.group, shaderTexture.binding, { texture });
						}
					}
					break;
				default:
					{
						const texture = (material.uniforms[shaderTexture.name] as Texture | undefined);//?.texture as GPUTexture | undefined;
						if (texture) {
							groups.set(shaderTexture.group, shaderTexture.binding, { texture });
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
					const sampler = (material.uniforms.colorMap as Texture | undefined)?.sampler;
					if (sampler) {
						groups.set(shaderSampler.group, shaderSampler.binding, { sampler });
					}
					break;
				case 'color2Sampler':
					{
						const sampler = (material.uniforms.color2Map as Texture | undefined)?.sampler;
						if (sampler) {
							groups.set(shaderSampler.group, shaderSampler.binding, { sampler });
						}
					}
					break;
				default:
					{
						const name = shaderSampler.name.replace(/Sampler$/, 'Texture');
						const sampler = (material.uniforms[name] as Texture | undefined)?.sampler;
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
					const storageTexture = (material.uniforms.colorMap as Texture | undefined);//?.texture as GPUTexture | undefined;
					if (storageTexture) {
						groups.set(storage.group, storage.binding, { storageTexture, access });
					}
					break;
				case 'pickedPrimitive':
					const buffer = this.#pickedPrimitive ?? device.createBuffer({// TODO: don't recreate buffers each time
						label: storage.name,
						size: storage.size,
						usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
					});

					if (!this.#pickedPrimitive) {
						this.#pickedPrimitive = buffer;
					}

					groups.set(storage.group, storage.binding, { buffer, bufferType, access, visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE });
					break;
				default:
					{
						const storageTexture = (material.uniforms[storage.name] as (Texture | undefined)[] | Texture | undefined);//?.texture as GPUTexture | undefined;
						if (storageTexture) {
							if (Array.isArray(storageTexture)) {

								let isCube = false;
								let visibility: GPUShaderStageFlags | undefined = undefined;
								let format: GPUTextureFormat = 'rgba8unorm';

								for (const texture of storageTexture) {
									// TODO: find a better way to do this
									if (texture) {
										isCube = texture.isCube;
										format = texture.gpuFormat;
										visibility = texture.gpuVisibility;
										break;
									}
								}

								groups.set(storage.group, storage.binding, { storageTextureArray: storageTexture, access, visibility, format, viewDimension: isCube ? 'cube-array' : '2d-array', });
							} else {
								groups.set(storage.group, storage.binding, { storageTexture, access, visibility: storageTexture.gpuVisibility });
							}
						} else {
							const storageBuffer = object?.getStorage(storage.name) ?? material?.getStorage(storage.name);
							if (storageBuffer) {
								//storageBuffer.buffer?.destroy();

								if (!storageBuffer.buffer) {
									storageBuffer.buffer = device.createBuffer({
										label: storage.name,
										size: storageBuffer.value.byteLength,
										usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
										//mappedAtCreation: true,
									});
								}


								device.queue.writeBuffer(storageBuffer.buffer, 0, storageBuffer.value as BufferSource, 0, storageBuffer.value.length);

								//new Float32Array(storageBuffer.buffer.getMappedRange()).set(storageBuffer.value);// TODO: determinate the buffer type
								//storageBuffer.buffer.unmap();


								//groups.set(storage.group, storage.binding, { storageTexture, access });
								groups.set(storage.group, storage.binding, { buffer: storageBuffer.buffer, bufferType, access, visibility });
							} else {
								errorOnce(`unknwon storage ${storage.name} in ${material.getShaderSource() + '.wgsl'}`);
							}
						}
					}
					break;
			}
		}
	}
}


export function getDefines(meshOrMaterial: Material | Mesh, defines: Map<string, string>): void {
	for (const [name, value] of Object.entries(meshOrMaterial.defines)) {
		defines.set(name, value as string);
	}
}
