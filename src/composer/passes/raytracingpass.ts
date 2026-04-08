import { vec3 } from 'gl-matrix';
import { errorOnce } from 'harmony-utils';
import { Camera } from '../../cameras/camera';
import { Graphics } from '../../graphics/graphics2';
import { WebGPUInternal } from '../../graphics/webgpuinternal';
import { RenderContext } from '../../interfaces/rendercontext';
import { ShaderMaterial } from '../../materials/shadermaterial';
import { Scene } from '../../scenes/scene';
import { RenderTarget } from '../../textures/rendertarget';
import { getCurrentTexture } from '../../textures/texture';
import { Pass } from '../pass';

const WIDTH = 400;
const HEIGHT = 300;

export class RayTracingPass extends Pass {
	#frameId = 0;
	aabbs?: Uint8ClampedArray;

	#accumulatedSamplesPerPixel = 0;

	material?: ShaderMaterial;
	/*
	 = new ShaderMaterial({
		shaderSource: 'raytracer',
		uniforms: {
			samplingParams: {
				numSamplesPerPixel: 1,// TODO: param
				accumulatedSamplesPerPixel: 0,// TODO: param
				numBounces: 5,// TODO: param
				clearAccumulatedSamples: 0,
			},
			//camera: computeCamera(perspectiveCamera),
			//frameData: [mainCanvas.width!, mainCanvas.height!, 1, 0],
			commonUniforms: {
				seed: new Uint32Array([Math.random() * 0xffffff, Math.random() * 0xffffff, Math.random() * 0xffffff,]),
				frameCounter: 0,
				maxBounces: 4,
				flatShading: 0,
				debugNormals: 0,
			},
			cameraUniforms: {
				viewportSize: new Uint32Array([WIDTH, HEIGHT]),
				imageWidth: WIDTH,
				imageHeight: HEIGHT,
				pixel00Loc: vec3.create(),// Fake value
				pixelDeltaU: vec3.create(),// Fake value
				pixelDeltaV: vec3.create(),// Fake value
				aspectRatio: WIDTH / HEIGHT,
				center: vec3.create(),// Fake value
				vfov: 60,
				lookFrom: vec3.fromValues(0, 0, 2),
				lookAt: vec3.create(),
				vup: vec3.create(),
				defocusAngle: 0,
				focusDist: 3.4,
				defocusDiscU: vec3.create(),
				defocusDiscV: vec3.create(),
			},
		},
		storages: {
			raytraceImageBuffer: WIDTH * HEIGHT * 4 * 4,// 4 elements * 4 bytes per element
			rngStateBuffer: WIDTH * HEIGHT * 4,// 4 bytes per element
			skyState: {
				// TODO: do a proper Hosek-Wilkie computation
				params: new Float32Array([-1.146293, -0.19404611, 0.6892759, 0.9089986, -2.0779164, 0.68428886, 0.21258523, 1.7967614, 0.6864839, -1.1500875, -0.22125047, 0.3443094, 0.37174478, -0.9696021, 0.64278126, 0.11194256, 2.956004, 0.6878244, -1.2532278, -0.4073885, -1.0929729, 1.48517, -0.056945086, 0.46961704, 0.019326262, 2.5557024, 0.6794679]),
				radiances: new Float32Array([5.8619566, 5.681205, 4.7109914]),
				sunDirection: new Float32Array([0.9961947, 0.087155804, 0.0, 0.0]),
			},
			//spheres,
			//materials,
			/*
			faces: {
				value: faces,
				raw: true,
			},
			AABBs: {
				value: aabbs,
				raw: true,
			},
			* /
			//textures,
			lights: new Uint32Array([1, 2, 3, 9]),
		},
		/*
		gpuConstants: {
			WORKGROUP_SIZE_X: COMPUTE_WORKGROUP_SIZE_X,
			WORKGROUP_SIZE_Y: COMPUTE_WORKGROUP_SIZE_Y,
			OBJECTS_COUNT_IN_SCENE: RayTracingScene.MODELS_COUNT,
			MAX_BVs_COUNT_PER_MESH: RayTracingScene.MAX_NUM_BVs_PER_MESH,
			MAX_FACES_COUNT_PER_MESH: RayTracingScene.MAX_NUM_FACES_PER_MESH,
		}
		* /
	});
	*/

	constructor(scene: Scene, camera: Camera) {
		super();
		this.swapBuffers = false;
		this.scene = scene;
		this.camera = camera;
	}

	render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext) {
		if (Graphics.isWebGLAny) {
			errorOnce('RayTracingPass is unavailable for webgl');
		} else {
			if (this.material) {
				this.material.setUniformValue('outTexture', renderToScreen ? getCurrentTexture() : writeBuffer.getTexture());
				this.material.setDefine('OUTPUT_FORMAT', renderToScreen ? WebGPUInternal.format : 'rgba8unorm');
				Graphics.compute(this.quad!, {
					...context,
					workgroupCountX: Math.ceil(context.width! / (this.material.workgroupSize?.[0] ?? 1)),
					workgroupCountY: Math.ceil(context.height! / (this.material.workgroupSize?.[1] ?? 1)),
				});
			}
		}
	}
}


function computeCamera(perspectiveCamera: Camera) {
	const mainCanvas = Graphics.getCanvas('main_canvas')!;

	let lensRadius = 0.5 * perspectiveCamera.aperture;
	let aspect = mainCanvas.width! / mainCanvas.height!;
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
