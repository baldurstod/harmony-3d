import { vec3 } from 'gl-matrix';
import { Camera } from '../cameras/camera';
import { InstancedBufferGeometry } from '../geometry/instancedbuffergeometry';
import { Graphics } from '../graphics/graphics2';
import { GraphicsEvent, GraphicsEvents, GraphicTickEvent } from '../graphics/graphicsevents';
import { BlendingMode } from '../materials/constants';
import { ShaderMaterial } from '../materials/shadermaterial';
import { Mesh } from '../objects/mesh';
import { Scene } from '../scenes/scene';
import { Texture } from '../textures/texture';
import { TextureManager } from '../textures/texturemanager';
import { GL_LINEAR } from '../webgl/constants';
import { UniformValue } from '../webgl/uniform';
import { StorageValueArray } from '../webgpu/storage';
import { sceneToRtScene } from './raytracingscene';

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
				debugColor: 0,
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
	#prepassMaterial = new ShaderMaterial({
		shaderSource: 'bitangent_prepass',
		gpuConstants: {
			WORKGROUP_SIZE_X: 256,
		},
	});
	#debugBvhMaterial = new ShaderMaterial({
		shaderSource: 'debug_bvh',
		blendingMode: BlendingMode.Normal,
	});
	#debugBvhGeometry = new InstancedBufferGeometry({ count: 2 });
	#debugBvhMesh = new Mesh({
		geometry: this.#debugBvhGeometry,
		material: this.#debugBvhMaterial,
		topology: 'line-list',
		scale: 10,
	});
	//#debugBvhCamera?: Camera;
	#outputTexture: Texture | null = null;
	#prepassDone = false;
	#debugBvh = true;
	#facesCount = 0;

	constructor() {
		GraphicsEvents.addEventListener(GraphicsEvent.Tick, this.#tick);
		this.#material.setDefine('OUTPUT_FORMAT', 'rgba8unorm'/*WebGPUInternal.format*/);
	}

	async configure(scene: Scene, width: number, height: number,
		//materials: any[], faces: Uint8ClampedArray, aabbs: Uint8ClampedArray,
		//MODELS_COUNT: number, MAX_NUM_BVs_PER_MESH: number, MAX_NUM_FACES_PER_MESH: number
	): Promise<boolean> {
		const activeCamera = scene.activeCamera;
		if (!activeCamera) {
			return false;
		}

		//this.#debugBvhCamera = activeCamera;

		this.#width = width;
		this.#height = height;
		this.#prepassDone = false;

		const { materials, textures, faces, aabbs, MODELS_COUNT, MAX_NUM_BVs_PER_MESH, MAX_NUM_FACES_PER_MESH, facesCount, aabbsCount } = await sceneToRtScene(scene);
		this.#facesCount = facesCount;
		this.#reset();

		this.#debugBvhGeometry.instanceCount = aabbsCount * 12;

		/*
				const indices = //[0, 2, 1];
					[0, 2, 1, 2, 3, 1, 4, 6, 5, 6, 7, 5, 8, 10, 9, 10, 11, 9, 12, 14, 13, 14, 15, 13, 16, 18, 17, 18, 19, 17, 20, 22, 21, 22, 23, 21];
				const vertices = //[0, 0, 0, 0, 1, 0, 1, 0, 0];
					[0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5];
				const normals = //[0, 0, 0, 0, 1, 0, 1, 0, 0];
					[1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]
				*/


		//const geometry = this.#debugBvhGeometry;
		//geometry.setIndex(new Uint16BufferAttribute(indices, 1, 'index'));
		//geometry.setAttribute('aVertexPosition', new Float32BufferAttribute(vertices, 3, 'position'));
		//geometry.setAttribute('aVertexNormal', new Float32BufferAttribute(normals, 3, 'normal'));
		//geometry.setAttribute('aTextureCoord', new Float32BufferAttribute(vertices, 3, 'texCoord'));
		//geometry.count = 2;


		const lookFrom = activeCamera.getWorldPosition();

		const cameraQuat = activeCamera.getWorldQuaternion();

		const lookAt = vec3.fromValues(0, 0, -1);
		vec3.transformQuat(lookAt, lookAt, cameraQuat);
		vec3.add(lookAt, lookFrom, lookAt);

		const vup = vec3.fromValues(0, 1, 0);
		vec3.transformQuat(vup, vup, cameraQuat);
		vec3.add(vup, vup, vup);

		this.#material.uniforms.camera = computeCamera(activeCamera, width, height);
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).viewportSize = new Uint32Array([width, height]);
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).imageWidth = width;
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).imageHeight = height;
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).aspectRatio = width / height;
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).vfov = activeCamera.getVerticalFov();
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).lookFrom = lookFrom;
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).lookAt = lookAt;
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).vup = vup;
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).defocusAngle = 0;// TODO: set an actual value
		(this.#material.uniforms.cameraUniforms as Record<string, UniformValue>).focusDist = 3.4;//activeCamera.focus;
		this.#material.setStorage('faces', {
			value: faces,
			raw: true,
		});
		this.#prepassMaterial.setStorage('faces', {
			value: faces,
			raw: true,
		});
		this.#material.setStorage('AABBs', {
			value: aabbs,
			raw: true,
		});


		this.#material.setStorage('materials', materials as StorageValueArray);
		this.#material.setStorage('textures', textures);

		this.#material.gpuConstants!.OBJECTS_COUNT_IN_SCENE = MODELS_COUNT;
		this.#material.gpuConstants!.MAX_BVs_COUNT_PER_MESH = MAX_NUM_BVs_PER_MESH;
		this.#material.gpuConstants!.MAX_FACES_COUNT_PER_MESH = MAX_NUM_FACES_PER_MESH;


		this.#debugBvhMaterial.setStorage('AABBs', {
			value: aabbs,
			raw: true,
		});
		//this.#debugBvhMaterial.uniforms.viewProjectionMatrix = activeCamera.getViewProjectionMatrix();

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

		const rtCanvas = Graphics.getCanvas('rt_canvas')!;
		rtCanvas.getLayout('default')?.views.get('all')?.scene?.addChild(this.#debugBvhMesh);
		/*
		rtCanvas.getLayout('default')?.views.get('all')?.scene?.addChild(
			new Box({ width: 100 })
		);
		*/

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

		if (!this.#prepassDone) {
			Graphics.compute(this.#prepassMaterial,
				{
					width: this.#facesCount,
					height: 1,
					// TODO: fix that: we can hit the limit of 65536 workgroup * 256 workgroup size
					// if we have more than 16M triangles
					workgroupCountX: Math.ceil(this.#facesCount! / 256),
				}
			);
			this.#prepassDone = true;

			this.#material.getStorage('faces')!.buffer = this.#prepassMaterial.getStorage('faces')!.buffer;
		}


		//this.#debugBvhMaterial.uniforms.viewProjectionMatrix = this.#debugBvhCamera?.getViewProjectionMatrix();

		/*
		Graphics.compute(this.#material,
			{
				width: this.#width,
				height: this.#height,
				workgroupCountX: Math.ceil(this.#width! / COMPUTE_WORKGROUP_SIZE_X),
				workgroupCountY: Math.ceil(this.#height! / COMPUTE_WORKGROUP_SIZE_Y),
			}
		);
		*/
	}

	getOutputTexture(): Texture | null {
		return this.#outputTexture;
	}

	getMaterial(): ShaderMaterial {
		return this.#material;
	}

	debugBvh(debug: false): void {
		this.#debugBvh = debug;
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
