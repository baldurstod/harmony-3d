import { vec3 } from 'gl-matrix';
import { Camera } from '../cameras/camera';
import { GraphicsEvent, GraphicsEvents, GraphicTickEvent } from '../graphics/graphicsevents';
import { ShaderMaterial } from '../materials/shadermaterial';
import { Scene } from '../scenes/scene';
import { Graphics } from '../graphics/graphics2';
import { UniformValue } from '../webgl/uniform';
import { StorageBuffer } from '../webgpu/storage';
import { getCurrentTexture, Texture } from '../textures/texture';
import { createTexture } from '../textures/texturefactory';
import { TextureManager } from '../textures/texturemanager';
import { GL_LINEAR } from '../webgl/constants';

type RtCamera = {
	eye: vec3,
	horizontal: vec3,
	vertical: vec3,
	u: vec3,
	v: vec3,
	lensRadius: number,
	lowerLeftCorner: vec3,
}

const COMPUTE_WORKGROUP_SIZE_X = 16;
const COMPUTE_WORKGROUP_SIZE_Y = 16;

export class Raytracer {
	#frameId = 0;
	#running = false;
	#tick = (event: Event) => this.#raytrace(event as CustomEvent<GraphicTickEvent>);
	#width = 0;
	#height = 0;
	#material = new ShaderMaterial({
		shaderSource: 'raytracer',
		uniforms: {
			commonUniforms: {
				frameCounter: 0,
				flatShading: 0,
				maxBounces: 4,
				debugNormals: 0,
			},
			cameraUniforms: {
				// TODO: remove the fake uniforms from the shader
				pixel00Loc: vec3.create(),// Fake value
				pixelDeltaU: vec3.create(),// Fake value
				pixelDeltaV: vec3.create(),// Fake value
				center: vec3.create(),// Fake value
				defocusDiscU: vec3.create(),// Fake value
				defocusDiscV: vec3.create(),// Fake value
			},
		},
		gpuConstants: {
			WORKGROUP_SIZE_X: COMPUTE_WORKGROUP_SIZE_X,
			WORKGROUP_SIZE_Y: COMPUTE_WORKGROUP_SIZE_Y,
			//OBJECTS_COUNT_IN_SCENE: RayTracingScene.MODELS_COUNT,
			//MAX_BVs_COUNT_PER_MESH: RayTracingScene.MAX_NUM_BVs_PER_MESH,
			//MAX_FACES_COUNT_PER_MESH: RayTracingScene.MAX_NUM_FACES_PER_MESH,
		},
		workgroupSize: vec3.fromValues(COMPUTE_WORKGROUP_SIZE_X, COMPUTE_WORKGROUP_SIZE_Y, 1),
	});
	#outputTexture: Texture | null = null;

	constructor() {
		GraphicsEvents.addEventListener(GraphicsEvent.Tick, this.#tick);
		this.#material.setDefine('OUTPUT_FORMAT', 'rgba8unorm'/*WebGPUInternal.format*/);
	}

	configure(scene: Scene, width: number, height: number,
		materials: any[], faces: Uint8ClampedArray, aabbs: Uint8ClampedArray,
		MODELS_COUNT: number, MAX_NUM_BVs_PER_MESH: number, MAX_NUM_FACES_PER_MESH: number
	): boolean {
		const activeCamera = scene.activeCamera;
		if (!activeCamera) {
			return false;
		}

		this.#width = width;
		this.#height = height;
		this.#reset();

		this.#material.uniforms.camera = computeCamera(activeCamera, width, height);
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).viewportSize = new Uint32Array([width, height]);
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).imageWidth = width;
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).imageHeight = height;
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).aspectRatio = width / height;
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).vfov = activeCamera.getVerticalFov();
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).lookFrom = vec3.fromValues(0, 0, 2);
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).lookAt = vec3.create();
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).vup = vec3.fromValues(0, 1, 0);// TODO: set an actual value
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).defocusAngle = 0;// TODO: set an actual value
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).focusDist = 3.4;//activeCamera.focus;
		this.#material.setStorage('faces', {
			value: faces,
			raw: true,
		});
		this.#material.setStorage('AABBs', {
			value: aabbs,
			raw: true,
		});
		this.#material.setStorage('materials', materials);

		this.#material.gpuConstants!.OBJECTS_COUNT_IN_SCENE = MODELS_COUNT;
		this.#material.gpuConstants!.MAX_BVs_COUNT_PER_MESH = MAX_NUM_BVs_PER_MESH;
		this.#material.gpuConstants!.MAX_FACES_COUNT_PER_MESH = MAX_NUM_FACES_PER_MESH;


		if (this.#outputTexture) {
			if (this.#outputTexture.width !== width ||
				this.#outputTexture.height !== height) {
				// destroy the previous texture
				TextureManager.deleteTexture(this.#outputTexture);
			}
		}

		if (!this.#outputTexture) {
			this.#outputTexture = TextureManager.createTexture({
				webgpuDescriptor: {
					size: {
						width,
						height,
					},
					format: 'rgba8unorm',// TODO: set a variable ?
					visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
					usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
				},
				minFilter: GL_LINEAR,
			});
		}

		this.#material.uniforms['outTexture'] = this.#outputTexture;

		return true;
	}

	play(): void {
		this.#running = true;
	}

	pause(): void {
		this.#running = false;
	}

	#reset(): void {
		this.#frameId = 0;

		this.#material.setStorage('raytraceImageBuffer', this.#width * this.#height * 4 * 4);
		this.#material.setStorage('rngStateBuffer', this.#width * this.#height * 4);
	}

	#raytrace(event: CustomEvent<GraphicTickEvent>): void {
		if (!this.#running) {
			return;
		}

		(this.#material.uniforms['commonUniforms'] as Record<string, UniformValue>).frameCounter = this.#frameId++;
		//this.#material.uniforms['outTexture'] = getCurrentTexture();

		Graphics.compute(this.#material,
			{
				width: this.#width,
				height: this.#height,
			},
			Math.ceil(this.#width! / (this.#material.workgroupSize?.[0] ?? 1)),
			Math.ceil(this.#height! / (this.#material.workgroupSize?.[1] ?? 1))
		);
	}

	getOutputTexture(): Texture | null {
		return this.#outputTexture;
	}

	dispose(): void {
		GraphicsEvents.removeEventListener(GraphicsEvent.Tick, this.#tick);
	}
}

function computeCamera(perspectiveCamera: Camera, width: number, height: number): RtCamera {
	let lensRadius = 0.5 * perspectiveCamera.aperture;
	let aspect = width / height;
	let halfHeight = perspectiveCamera.focus * perspectiveCamera.getTanHalfVerticalFov();
	let halfWidth = aspect * halfHeight;

	const forwardVector = perspectiveCamera.getViewDirection();

	const w = vec3.normalize(forwardVector, forwardVector);
	const world_up = vec3.fromValues(0.0, 1.0, 0.0);

	const right = vec3.cross(vec3.create(), forwardVector, world_up);
	const upVector = vec3.cross(vec3.create(), right, forwardVector);

	const v = vec3.normalize(vec3.create(), upVector);
	const u = vec3.cross(vec3.create(), w, v);

	const lowerLeftCorner = perspectiveCamera.getWorldPosition();
	vec3.scaleAndAdd(lowerLeftCorner, lowerLeftCorner, w, perspectiveCamera.focus);
	vec3.scaleAndAdd(lowerLeftCorner, lowerLeftCorner, u, -halfWidth);
	vec3.scaleAndAdd(lowerLeftCorner, lowerLeftCorner, v, -halfHeight);

	const horizontal = vec3.scale(vec3.create(), u, 2 * halfWidth);
	const vertical = vec3.scale(vec3.create(), v, 2 * halfHeight);

	return {
		eye: perspectiveCamera.getPosition(),
		horizontal,
		vertical,
		u,
		v,
		lensRadius,
		lowerLeftCorner,
	};
}
