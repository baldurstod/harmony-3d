import { mat4, vec3, vec4 } from 'gl-matrix';
import { Map2, once } from 'harmony-utils';
import { WgslReflect } from 'wgsl_reflect';
import { USE_STATS } from '../buildoptions';
import { Camera } from '../cameras/camera';
import { EngineEntityAttributes, Entity } from '../entities/entity';
import { SceneNode } from '../entities/scenenode';
import { BufferGeometry } from '../geometry/buffergeometry';
import { InstancedBufferGeometry } from '../geometry/instancedbuffergeometry';
import { Graphics } from '../graphics/graphics2';
import { WebGPUInternal } from '../graphics/webgpuinternal';
import { InternalRenderContext } from '../interfaces/rendercontext';
import { ShaderManager } from '../managers/shadermanager';
import { Material } from '../materials/material';
import { Mesh } from '../objects/mesh';
import { Renderer } from '../renderers/renderer';
import { RenderList } from '../renderers/renderlist';
import { Scene } from '../scenes/scene';
import { ToneMapping } from '../textures/constants';
import { ShadowMap } from '../textures/shadowmap';
import { WebGLStats } from '../utils/webglstats';
import { ShaderType } from '../webgl/types';

// remove these when unused
const clearColorError = once(() => console.error('TODO clearColor'));
const clearError = once(() => console.error('TODO clear'));

const tempViewProjectionMatrix = mat4.create();

type WgslModule = {
	module: GPUShaderModule;
	reflection?: WgslReflect;
}


const lightDirection = vec3.create();

export class WebGPURenderer implements Renderer {
	#renderList = new RenderList();
	#shadowMap = new ShadowMap();
	#frame = 0;
	#materialsShaderModule = new Map<string, WgslModule>();
	#toneMapping = ToneMapping.None;
	#toneMappingExposure = 1.;

	render(scene: Scene, camera: Camera, delta: number, context: InternalRenderContext): void {
		const renderList = this.#renderList;
		renderList.reset();
		camera.dirty();//Force matrices to recompute
		this.#prepareRenderList(renderList, scene, camera, delta, context);

		//this.#shadowMap.render(this, renderList, camera, context);
		if (scene.background) {
			scene.background.render(this, camera, context);
		}

		this.#renderRenderList(renderList, camera, true, context);
		++this.#frame;
	}

	renderShadowMap(renderList: RenderList, camera: Camera, renderLights: boolean, context: InternalRenderContext, lightPos?: vec3): void {
		this.#renderRenderList(renderList, camera, renderLights, context, lightPos);
	}

	invalidateShaders(): void {
		this.#materialsShaderModule.clear();
	}

	clear(color: boolean, depth: boolean, stencil: boolean): void {
		clearError();
	}

	clearColor(clearColor: vec4): void {
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

	#prepareRenderList(renderList: RenderList, scene: Scene, camera: Camera, delta: number, context: InternalRenderContext): void {
		renderList.reset();
		let currentObject: Entity | undefined = scene;
		const objectStack = [];
		//scene.pointLights = scene.getChildList(PointLight);
		//scene.ambientLights = scene.getChildList(AmbientLight);

		while (currentObject) {
			if (currentObject.getAttribute(EngineEntityAttributes.IsTool, false) && context.renderContext.DisableToolRendering) {
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
		renderList.finish();
	}

	#renderRenderList(renderList: RenderList, camera: Camera, renderLights: boolean, context: InternalRenderContext, lightPos?: vec3): void {
		for (const child of renderList.opaqueList) {
			this.#renderObject(context, renderList, child, camera, child.getGeometry(), child.getMaterial(), renderLights, lightPos);
		}

		if (renderLights) {
			for (const child of renderList.transparentList) {
				this.#renderObject(context, renderList, child, camera, child.getGeometry(), child.getMaterial(), renderLights, lightPos);
			}
		}
	}

	#renderObject(context: InternalRenderContext, renderList: RenderList, object: Mesh, camera: Camera, geometry: BufferGeometry | InstancedBufferGeometry, material: Material, renderLights = true, lightPos?: vec3): void {
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

		const shaderModule = this.#getShaderModule(material);
		if (!shaderModule) {
			return;
		}

		const device = WebGPUInternal.device;


		const geometryAttributes = geometry.attributes;
		const indexAttribute = geometryAttributes.get('index');
		const positionAttribute = geometryAttributes.get('aVertexPosition');
		if (!indexAttribute || !positionAttribute) {
			return;
		}

		const indices = indexAttribute._array;
		const indexBuffer = device.createBuffer({
			label: 'index',
			//size: sphereMesh.indices.byteLength,
			size: indices.length * 2/* index is uint16*/,
			usage: GPUBufferUsage.INDEX,
			mappedAtCreation: true,
		});

		new Uint16Array(indexBuffer.getMappedRange()).set(indices);
		indexBuffer.unmap();
		/*
		const vertices = new Float32Array([
			0.0, 0.6, 0, 1, 1, 0, 0, 1,
			-0.5, -0.6, 0, 1, 0, 1, 0, 1,
			0.5, -0.6, 0, 1, 0, 0, 1, 1
		]);
		*/
		const vertices = positionAttribute._array;

		const vertexBuffer = device.createBuffer({
			label: 'position',
			//size: vertices.byteLength, // make it big enough to store vertices in
			size: vertices.length * 4/* position is float32*/,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			//mappedAtCreation: true,
		});

		device.queue.writeBuffer(vertexBuffer, 0, vertices, 0, vertices.length);

		const SIZE_UNIFORM_MATRIX = 4 * 16;
		const uniformBufferSize = SIZE_UNIFORM_MATRIX * 6; // 4x4 matrix
		/*
		const uniformBuffer = device.createBuffer({
			size: uniformBufferSize,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		*/
		mat4.mul(tempViewProjectionMatrix, camera.projectionMatrix, camera.cameraMatrix);//TODO: compute this in camera

		const vertexBuffers: GPUVertexBufferLayout[] = [{
			attributes: [{
				shaderLocation: 0, // position
				offset: 0,
				format: 'float32x3'
			},
			],
			arrayStride: 12,
			stepMode: 'vertex'
		}];

		const groups = new Map2<number, number, GPUBuffer>();

		if (renderLights) {
			material.beforeRender(camera);
		}

		let uniforms = new Map<string, BufferSource>();
		if (renderLights) {
			this.#setupLights(renderList, camera, camera.cameraMatrix, uniforms);
		}

		if (shaderModule.reflection) {
			for (const uniform of shaderModule.reflection.uniforms) {
				const uniformBuffer = device.createBuffer({
					label: uniform.name,
					size: uniform.size,
					usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
				});

				groups.set(uniform.group, uniform.binding, uniformBuffer);

				const members = uniform.members;
				if (members) {
					for (const member of members) {
						let bufferSource: BufferSource | null = null;
						uniformBuffer.label = uniform.name + '.' + member.name;

						switch (member.name) {
							case 'modelMatrix':
								bufferSource = object.worldMatrix as BufferSource;
								break;
							case 'viewMatrix':
								bufferSource = camera.cameraMatrix as BufferSource;
								break;
							case 'modelViewMatrix':
								bufferSource = object._mvMatrix as BufferSource;
								break;
							case 'projectionMatrix':
								bufferSource = camera.projectionMatrix as BufferSource;
								break;
							case 'viewProjectionMatrix':
								bufferSource = tempViewProjectionMatrix as BufferSource;
								break;
							case 'normalMatrix':
								bufferSource = object._normalMatrix as BufferSource;
								break;
							default:
								//console.error('unknwon uniform', uniform.name, member.name);
							//	bufferSource = new Float32Array(member.size) as BufferSource;

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
					//console.error('unknwon uniform', uniform.name);
					const bufferSource = uniforms.get(uniform.name);
					if (bufferSource) {
						device.queue.writeBuffer(
							uniformBuffer,
							0,
							bufferSource,
						);

					}
					/*
					const bufferSource = new Uint8Array(uniform.size) as BufferSource;
					device.queue.writeBuffer(
						uniformBuffer,
						0,
						bufferSource,
					);
					*/
				}
			}
		}


		const bindGroupLayouts: GPUBindGroupLayout[] = [];
		for (const [groupId, group] of groups.getMap()) {
			const entries: GPUBindGroupLayoutEntry[] = [];
			for (const [bindingId, uniformBuffer] of group) {
				entries.push({
					binding: bindingId,// corresponds to @binding
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,// TODO: set appropriate visibility
					buffer: {},// TODO: set appropriate buffer, sampler, texture, storageTexture, texelBuffer, or externalTexture
				});
			}

			bindGroupLayouts.push(device.createBindGroupLayout({
				entries: entries,
			}))
		}


		const pipelineLayout = device.createPipelineLayout({
			bindGroupLayouts: bindGroupLayouts,
		});

		const commandEncoder = device.createCommandEncoder();

		const renderPassDescriptor: GPURenderPassDescriptor = {
			colorAttachments: [{
				//clearValue: clearColor,//TODO
				loadOp: 'clear',
				storeOp: 'store',
				view: WebGPUInternal.gpuContext.getCurrentTexture().createView()
			}]
		};

		const pipelineDescriptor: GPURenderPipelineDescriptor = {
			vertex: {
				module: shaderModule.module,
				entryPoint: 'vertex_main',
				buffers: vertexBuffers
			},
			fragment: {
				module: shaderModule.module,
				entryPoint: 'fragment_main',
				targets: [{
					format: WebGPUInternal.format,
				}]
			},
			primitive: {
				topology: 'triangle-list',
				cullMode: 'back',// TODO: setup material culling
			},
			layout: pipelineLayout,
		};

		const renderPipeline = device.createRenderPipeline(pipelineDescriptor);

		const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
		passEncoder.setPipeline(renderPipeline);

		for (const [groupId, group] of groups.getMap()) {
			const entries: GPUBindGroupEntry[] = [];
			for (const [bindingId, uniformBuffer] of group) {
				entries.push({
					binding: bindingId,// corresponds to @binding
					resource: {
						buffer: uniformBuffer,
					},
				});


			}

			const uniformBindGroup = device.createBindGroup({
				label: String(groupId),
				layout: renderPipeline.getBindGroupLayout(groupId),// corresponds to @group
				entries: entries,
			});
			passEncoder.setBindGroup(groupId, uniformBindGroup);
		}

		passEncoder.setIndexBuffer(indexBuffer, 'uint16');
		passEncoder.setVertexBuffer(0, vertexBuffer);
		passEncoder.drawIndexed(geometry.count);
		//passEncoder.draw(3);

		// End the render pass
		passEncoder.end();

		// 10: End frame by passing array of command buffers to command queue for execution
		device.queue.submit([commandEncoder.finish()]);

		if (USE_STATS) {
			WebGLStats.drawElements(object.renderMode, geometry.count);
		}
	}

	#setupLights(renderList: RenderList, camera: Camera, viewMatrix: mat4, uniforms: Map<string, BufferSource>): void {
		//const uniforms = new Map<string, any>();
		const lightPositionCameraSpace = vec3.create();//TODO: do not create a vec3
		const lightPositionWorldSpace = vec3.create();//TODO: do not create a vec3
		const colorIntensity = vec3.create();//TODO: do not create a vec3
		const pointLights = renderList.pointLights;//scene.getChildList(PointLight);
		const spotLights = renderList.spotLights;

		let shadow;
		let pointLightId = 0;
		const pointShadowMap = [];
		const pointShadowMatrix = [];
		/*
		for (const pointLight of pointLights) {
			if (pointLight.isVisible()) {
				pointLight.getWorldPosition(lightPositionWorldSpace);;
				vec3.transformMat4(lightPositionCameraSpace, lightPositionWorldSpace, viewMatrix);
				program.setUniformValue('uPointLights[' + pointLightId + '].position', lightPositionCameraSpace);
				program.setUniformValue('uPointLights[' + pointLightId + '].color', vec3.scale(colorIntensity, pointLight.color, pointLight.intensity));
				program.setUniformValue('uPointLights[' + pointLightId + '].range', pointLight.range);
				//program.setUniformValue('uPointLightsuPointLights[' + pointLightId + '].direction', pointLight.getDirection(tempVec3));
				//program.setUniformValue('uPointLights[' + pointLightId + '].direction', [0, 0, -1]);
				program.setUniformValue('uPbrLights[' + pointLightId + '].position', lightPositionWorldSpace);
				program.setUniformValue('uPbrLights[' + pointLightId + '].radiance', vec3.scale(colorIntensity, pointLight.color, pointLight.intensity));

				shadow = pointLight.shadow;
				if (shadow && pointLight.castShadow) {
					pointShadowMap.push(shadow.renderTarget.getTexture());
					pointShadowMatrix.push(shadow.shadowMatrix);
					program.setUniformValue('uPointLightShadows[' + pointLightId + '].mapSize', shadow.textureSize);
					program.setUniformValue('uPointLightShadows[' + pointLightId + '].near', shadow.camera.nearPlane);
					program.setUniformValue('uPointLightShadows[' + pointLightId + '].far', shadow.camera.farPlane);
					program.setUniformValue('uPointLightShadows[' + pointLightId + '].enabled', true);
				}
				++pointLightId;
			}
		}
		*/
		//program.setUniformValue('uPointShadowMap[0]', pointShadowMap);
		//program.setUniformValue('uPointShadowMatrix[0]', pointShadowMatrix);


		let spotLightId = 0;
		const spotShadowMap = [];
		const spotShadowMatrix = [];
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
	#getShaderModule(material: Material): WgslModule | null {
		const shaderName = material.getShaderSource() + '.wgsl';

		let shaderModule = this.#materialsShaderModule.get(shaderName);
		if (shaderModule) {
			return shaderModule;
		}

		const shaderSource = ShaderManager.getShaderSource(ShaderType.Wgsl, shaderName);
		if (!shaderSource) {
			return null;
		}

		WebGPUInternal.device.pushErrorScope('validation');
		const source = shaderSource.getCompileSource();
		const module = WebGPUInternal.device.createShaderModule({
			code: source,
			label: shaderName,
		});

		WebGPUInternal.device.popErrorScope().then(error => {
			if (error) {
				const m = 'Compile error in ' + shaderName + '. Reason : ' + error.message;
				console.warn(m, shaderSource.getCompileSourceLineNumber(''), m);
			}
		});

		module.getCompilationInfo().then(shaderInfo => shaderSource.setCompilationInfo(shaderInfo));

		// Schedule the execution to validate the shader
		WebGPUInternal.device.queue.submit([]);

		let reflection
		try {
			reflection = new WgslReflect(source);
		} catch (e) { }

		shaderModule = { module, reflection };
		this.#materialsShaderModule.set(shaderName, shaderModule);

		return shaderModule;
	}

	#setLights(pointLights: number, spotLights: number, pointLightShadows: number, spotLightShadows: number): void {
		Graphics.setIncludeCode('USE_SHADOW_MAPPING', '#define USE_SHADOW_MAPPING');
		Graphics.setIncludeCode('NUM_POINT_LIGHTS', '#define NUM_POINT_LIGHTS ' + pointLights);
		Graphics.setIncludeCode('NUM_PBR_LIGHTS', '#define NUM_PBR_LIGHTS ' + pointLights);
		Graphics.setIncludeCode('NUM_SPOT_LIGHTS', '#define NUM_SPOT_LIGHTS ' + spotLights);
		Graphics.setIncludeCode('NUM_POINT_LIGHT_SHADOWS', '#define NUM_POINT_LIGHT_SHADOWS ' + pointLightShadows);
		Graphics.setIncludeCode('NUM_SPOT_LIGHT_SHADOWS', '#define NUM_SPOT_LIGHT_SHADOWS ' + spotLightShadows);
		//TODO: other lights of disable lighting all together
	}

	#unsetLights(): void {
		Graphics.setIncludeCode('USE_SHADOW_MAPPING', '#undef USE_SHADOW_MAPPING');
		Graphics.setIncludeCode('NUM_POINT_LIGHTS', '#define NUM_POINT_LIGHTS 0');
		Graphics.setIncludeCode('NUM_SPOT_LIGHTS', '#define NUM_SPOT_LIGHTS 0');
		Graphics.setIncludeCode('NUM_POINT_LIGHT_SHADOWS', '#define NUM_POINT_LIGHTS 0');
		Graphics.setIncludeCode('NUM_SPOT_LIGHT_SHADOWS', '#define NUM_SPOT_LIGHTS 0');
		//TODO: other lights of disable lighting all together
	}
}
