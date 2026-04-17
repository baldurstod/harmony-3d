import { quat, vec3 } from 'gl-matrix';
import { FpsCounter } from 'harmony-utils';
import { Camera } from '../cameras/camera';
import { InstancedBufferGeometry } from '../geometry/instancedbuffergeometry';
import { Graphics } from '../graphics/graphics2';
import { GraphicsEvent, GraphicsEvents, GraphicTickEvent } from '../graphics/graphicsevents';
import { WebGPUInternal } from '../graphics/webgpuinternal';
import { BlendingMode } from '../materials/constants';
import { ShaderMaterial } from '../materials/shadermaterial';
import { Mesh } from '../objects/mesh';
import { Scene } from '../scenes/scene';
import { Texture } from '../textures/texture';
import { TextureManager } from '../textures/texturemanager';
import { GL_LINEAR } from '../webgl/constants';
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

const COUNTERS = 10;
const UINT_COUNTERS = 6;
const COUNTERS_SIZE = COUNTERS * 4;

export class Raytracer {
	#frameId = 0;
	#running = false;
	#tick = (event: Event) => this.#raytrace(event as CustomEvent<GraphicTickEvent>);
	#width = 0;
	#height = 0;
	#material = new ShaderMaterial({
		shaderSource: 'raytracer_v2',
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
	#mesh = new Mesh({ material: this.#material });
	#prepassMaterial = new ShaderMaterial({
		shaderSource: 'bitangent_prepass',
		gpuConstants: {
			WORKGROUP_SIZE_X: 256,
		},
	});
	#prepassMesh = new Mesh({ material: this.#prepassMaterial });
	#debugBvhMaterial = new ShaderMaterial({
		shaderSource: 'debug_bvh',
		blendingMode: BlendingMode.Normal,
		gpuConstants: {
			highlight: 0,
			highlightIndex: 0,
		},
	});
	#debugBvhGeometry = new InstancedBufferGeometry({ count: 2, user: this });
	#debugBvhMesh = new Mesh({
		geometry: this.#debugBvhGeometry,
		material: this.#debugBvhMaterial,
		topology: 'line-list',
		scale: 10,
		visible: false,
	});
	#outputTexture: Texture | null = null;
	#prepassDone = false;
	#facesCount = 0;
	#zeroUint32 = new Uint32Array(COUNTERS);
	#rpsCounter = new FpsCounter();
	//#counters: number[] = new Array(COUNTERS);
	#countersUint32?: Uint32Array;
	#countersFloat32?: Float32Array;
	#oldInstanceCount = 0;
	#newInstanceCount = 0;
	#newMethod = true;

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

		this.#width = width;
		this.#height = height;
		this.#prepassDone = false;

		const { materials, textures, faces, aabbs, MODELS_COUNT, MAX_NUM_BVs_PER_MESH, MAX_NUM_FACES_PER_MESH, facesCount, aabbsCount, v2_indices, v2_tris, v2_nodes, v2_lights, nodesUsed } = await sceneToRtScene(scene);
		this.#facesCount = facesCount;
		this.#reset();

		this.#oldInstanceCount = aabbsCount * 12;
		this.#newInstanceCount = nodesUsed * 12;
		this.#setInstanceCount();

		const lookFrom = activeCamera.getWorldPosition();

		const cameraQuat = activeCamera.getWorldQuaternion();

		const lookAt = vec3.fromValues(0, 0, -1);
		vec3.transformQuat(lookAt, lookAt, cameraQuat);
		vec3.add(lookAt, lookFrom, lookAt);

		const vup = vec3.fromValues(0, 1, 0);
		vec3.transformQuat(vup, vup, cameraQuat);
		vec3.add(vup, vup, vup);

		this.#material.setUniformValue('camera', computeCamera(activeCamera, width, height));
		/*
		(this.#material.#uniforms.cameraUniforms as Record<string, UniformValue>).viewportSize = new Uint32Array([width, height]);
		(this.#material.#uniforms.cameraUniforms as Record<string, UniformValue>).imageWidth = width;
		(this.#material.#uniforms.cameraUniforms as Record<string, UniformValue>).imageHeight = height;
		(this.#material.#uniforms.cameraUniforms as Record<string, UniformValue>).aspectRatio = width / height;
		(this.#material.#uniforms.cameraUniforms as Record<string, UniformValue>).vfov = activeCamera.getVerticalFov();
		(this.#material.#uniforms.cameraUniforms as Record<string, UniformValue>).lookFrom = lookFrom;
		(this.#material.#uniforms.cameraUniforms as Record<string, UniformValue>).lookAt = lookAt;
		(this.#material.#uniforms.cameraUniforms as Record<string, UniformValue>).vup = vup;
		(this.#material.#uniforms.cameraUniforms as Record<string, UniformValue>).defocusAngle = 0;// TODO: set an actual value
		(this.#material.#uniforms.cameraUniforms as Record<string, UniformValue>).focusDist = 3.4;//activeCamera.focus;
		*/
		this.#material.setUniformValue('cameraUniforms', {
			viewportSize: new Uint32Array([width, height]),
			imageWidth: width,
			imageHeight: height,
			aspectRatio: width / height,
			vfov: activeCamera.getVerticalFov(),
			lookFrom: lookFrom,
			lookAt: lookAt,
			vup: vup,
			defocusAngle: 0,// TODO: set an actual value
			focusDist: 3.4,//activeCamera.focus;
		});


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
		this.#material.setStorage('indices', { value: v2_indices, raw: true, });
		this.#material.setStorage('tris', { value: v2_tris, raw: true, });
		this.#material.setStorage('bvhNodes', { value: v2_nodes, raw: true, });


		this.#material.setStorage('materials', materials as StorageValueArray);
		this.#material.setStorage('textures', textures);

		this.#material.gpuConstants!.OBJECTS_COUNT_IN_SCENE = MODELS_COUNT;
		this.#material.gpuConstants!.MAX_BVs_COUNT_PER_MESH = MAX_NUM_BVs_PER_MESH;
		this.#material.gpuConstants!.MAX_FACES_COUNT_PER_MESH = MAX_NUM_FACES_PER_MESH;


		this.#debugBvhMaterial.setStorage('AABBs', {
			value: aabbs,
			raw: true,
		});
		this.#debugBvhMaterial.setStorage('bvhNodes', {
			value: v2_nodes,
			raw: true,
		});
		this.#material.setStorage('lights', { value: v2_lights, raw: true, });

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

		//this.#material.#uniforms['outTexture'] = this.#outputTexture;
		this.#material.setUniformValue('outTexture', this.#outputTexture);

		const rtCanvas = Graphics.getCanvas('rt_canvas')!;
		rtCanvas.getLayout('default')?.views.get('all')?.scene?.addChild(this.#debugBvhMesh);

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
		this.#material.setStorage('counters', {
			usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
		});
	}

	#raytrace(event: CustomEvent<GraphicTickEvent>): void {
		if (!this.#running) {
			return;
		}

		//(this.#material.#uniforms['commonUniforms'] as Record<string, UniformValue>).frameCounter = this.#frameId++;
		this.#material.setSubUniformValue('commonUniforms.frameCounter', this.#frameId++);

		if (!this.#prepassDone) {
			Graphics.compute(this.#prepassMesh,
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

		const rayCountCopyBuffer = WebGPUInternal.device.createBuffer({
			size: COUNTERS_SIZE,
			usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
		});

		const rayCountBuffer = this.#material.getStorage('counters')?.buffer;
		if (rayCountBuffer) {
			WebGPUInternal.device.queue.writeBuffer(
				rayCountBuffer,
				0,
				this.#zeroUint32,
			);
		}

		Graphics.compute(this.#mesh,
			{
				width: this.#width,
				height: this.#height,
				workgroupCountX: Math.ceil(this.#width! / COMPUTE_WORKGROUP_SIZE_X),
				workgroupCountY: Math.ceil(this.#height! / COMPUTE_WORKGROUP_SIZE_Y),
			},
			(commandEncoder: GPUCommandEncoder) => {
				const outputBuffer = this.#material.getStorage('counters')?.buffer;

				if (outputBuffer) {
					commandEncoder.copyBufferToBuffer(
						outputBuffer,
						rayCountCopyBuffer,
					);
				}
			},
		);

		(async (): Promise<void> => {
			await rayCountCopyBuffer.mapAsync(
				GPUMapMode.READ,
				0, // Offset
				COUNTERS_SIZE // Length
			);

			const copyArrayBuffer = rayCountCopyBuffer.getMappedRange(0, COUNTERS_SIZE);
			this.#countersUint32 = new Uint32Array(copyArrayBuffer.slice());
			this.#countersFloat32 = new Float32Array(copyArrayBuffer.slice());
			const rays = this.#countersUint32[1]!;
			const high = this.#countersUint32[9]!;

			if (high != 0) {
				this.#debugBvhMaterial.gpuConstants!.highlight = 1;
				this.#debugBvhMaterial.gpuConstants!.highlightIndex = high;
			} else {
				this.#debugBvhMaterial.gpuConstants!.highlight = 0;

			}

			this.#rpsCounter.addQuantity(rays);
		})();
	}

	getRps(): number {
		return this.#rpsCounter.getSpeed();
	}

	getInvocations(): number {
		return this.#countersUint32?.[0] ?? 0;
	}

	getUint32Counter(index: number): number | undefined {
		return this.#countersUint32?.[index + 2];
	}

	getFloat32Counter(index: number): number | undefined {
		return this.#countersFloat32?.[index + 2];
	}

	getOutputTexture(): Texture | null {
		return this.#outputTexture;
	}

	getMaterial(): ShaderMaterial {
		return this.#material;
	}

	debugBvh(debug: boolean): void {
		this.#debugBvhMesh.setVisible(debug);
	}

	#setInstanceCount(): void {
		if (this.#newMethod) {
			this.#debugBvhGeometry.instanceCount = this.#newInstanceCount;
			this.#debugBvhMesh.setDefine('NEW_METHOD');
		} else {
			this.#debugBvhGeometry.instanceCount = this.#oldInstanceCount;
			this.#debugBvhMesh.removeDefine('NEW_METHOD');
		}

	}

	useNewBvh(newBvh: boolean): void {
		this.#newMethod = newBvh;
		this.#setInstanceCount();
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
