import { mat4, vec3, vec4 } from 'gl-matrix';
import { once } from 'harmony-utils';
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
import { ShaderType } from '../webgl/shadersource';
import { Float32BufferAttribute, Uint16BufferAttribute } from '../geometry/bufferattribute';

// remove these when unused
const clearColorError = once(() => console.error('TODO clearColor'));
const clearError = once(() => console.error('TODO clear'));

const tempViewProjectionMatrix = mat4.create();

export class WebGPURenderer implements Renderer {
	#renderList = new RenderList();
	#shadowMap = new ShadowMap();
	#frame = 0;
	#materialsShaderModule = new Map<string, GPUShaderModule>();
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
		const uniformBuffer = device.createBuffer({
			size: uniformBufferSize,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
				mat4.mul(tempViewProjectionMatrix, camera.projectionMatrix, camera.cameraMatrix);//TODO: compute this in camera

/*
			program.setUniformValue('uModelMatrix', object.worldMatrix);
			program.setUniformValue('uModelViewMatrix', object._mvMatrix);
			program.setUniformValue('uViewMatrix', cameraMatrix);
			program.setUniformValue('uProjectionMatrix', projectionMatrix);
			program.setUniformValue('uProjectionLogDepth', 2.0 / (Math.log(camera.farPlane + 1.0) / Math.LN2));//TODO: perf: compute that once we set camera farplane
			program.setUniformValue('uViewProjectionMatrix', tempViewProjectionMatrix);
			program.setUniformValue('uNormalMatrix', object._normalMatrix);
			*/

			/*
				modelMatrix : mat4x4f,
	viewMatrix : mat4x4f,
	modelViewMatrix : mat4x4f,
	projectionMatrix : mat4x4f,
	viewProjectionMatrix : mat4x4f,
	normalMatrix : mat4x4f,
	*/


		device.queue.writeBuffer(
			uniformBuffer,
			0 * SIZE_UNIFORM_MATRIX,
			object.worldMatrix as BufferSource,
		);
		device.queue.writeBuffer(
			uniformBuffer,
			1 * SIZE_UNIFORM_MATRIX,
			camera.cameraMatrix as BufferSource,
		);
		device.queue.writeBuffer(
			uniformBuffer,
			2 * SIZE_UNIFORM_MATRIX,
			object._mvMatrix as BufferSource,
		);
		device.queue.writeBuffer(
			uniformBuffer,
			3 * SIZE_UNIFORM_MATRIX,
			camera.projectionMatrix as BufferSource,
		);
		device.queue.writeBuffer(
			uniformBuffer,
			4 * SIZE_UNIFORM_MATRIX,
			tempViewProjectionMatrix as BufferSource,
		);
		device.queue.writeBuffer(
			uniformBuffer,
			5 * SIZE_UNIFORM_MATRIX,
			object._normalMatrix as BufferSource,
		);


		const vertexBuffers: GPUVertexBufferLayout[] = [{
			attributes: [{
				shaderLocation: 0, // position
				offset: 0,
				format: 'float32x3'
			},/* {
				shaderLocation: 1, // color
				offset: 16,
				format: 'float32x4'
			},*/
			],
			arrayStride: 12,
			stepMode: 'vertex'
		}];

		const pipelineDescriptor: GPURenderPipelineDescriptor = {
			vertex: {
				module: shaderModule,
				entryPoint: 'vertex_main',
				buffers: vertexBuffers
			},
			fragment: {
				module: shaderModule,
				entryPoint: 'fragment_main',
				targets: [{
					format: WebGPUInternal.format,
				}]
			},
			primitive: {
				topology: 'triangle-list',
				cullMode: 'back',// TODO: setup material culling
			},
			layout: 'auto'
		};

		const renderPipeline = device.createRenderPipeline(pipelineDescriptor);



		const uniformBindGroup = device.createBindGroup({
			layout: renderPipeline.getBindGroupLayout(0),
			entries: [
				{
					binding: 0,
					resource: {
						buffer: uniformBuffer,
					},
				},
			],
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

		const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
		passEncoder.setPipeline(renderPipeline);
		passEncoder.setBindGroup(0, uniformBindGroup);
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

	/**
	 * Get a shader module for the material
	 * @param material The material
	 * @returns a shader module or null
	 */
	#getShaderModule(material: Material): GPUShaderModule | null {
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
		shaderModule = WebGPUInternal.device.createShaderModule({
			code: shaderSource.getCompileSource(),
			label: shaderName,
		});

		WebGPUInternal.device.popErrorScope().then(error => {
			if (error) {
				const m = 'Compile error in ' + shaderName + '. Reason : ' + error.message;
				console.warn(m, shaderSource.getCompileSourceLineNumber(''), m);

				shaderSource.setCompileError(error.message);
			}
		});

		// Schedule the execution to validate the shader
		WebGPUInternal.device.queue.submit([]);

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
