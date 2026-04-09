import { vec2, vec3 } from 'gl-matrix';
import { Graphics } from '../graphics/graphics2';
import { WebGPUInternal } from '../graphics/webgpuinternal';
import { ShaderMaterial } from '../materials/shadermaterial';
import { Mesh } from '../objects/mesh';
import { Texture } from './texture';

const COMPUTE_WORKGROUP_SIZE_X = 16;
const COMPUTE_WORKGROUP_SIZE_Y = 16;

/**
 * [WebGPU only] Get the texture pixel data.
 * @param texture The texture to retrieve the pixels from.
 * @returns A Float32Array containing th epixel data.
 */
export async function getTextureData(texture: Texture): Promise<Float32Array> {// TODO: also output Uint8Array / Uint8ClampedArray
	if (texture.isCube) {
		return getTextureCubeData(texture);
	} else {
		return getTexture2dData(texture);
	}
}

async function getTexture2dData(texture: Texture): Promise<Float32Array> {// TODO: also output Uint8Array / Uint8ClampedArray
	if (Graphics.isWebGLAny) {
		throw new Error('This method is only available in WebGPU mode');
	}
	const bufferSize = texture.width * texture.height * texture.elementsPerTexel * 4;
	const material = new ShaderMaterial({
		shaderSource: 'texturedatas',
		uniforms: {
			input: texture,
			size: vec2.fromValues(texture.width, texture.height),
			elements: texture.elementsPerTexel,
		},
		storages: {
			output: {
				size: bufferSize,
				usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
			},
		},
		gpuConstants: {
			WORKGROUP_SIZE_X: COMPUTE_WORKGROUP_SIZE_X,
			WORKGROUP_SIZE_Y: COMPUTE_WORKGROUP_SIZE_Y,
		},
		workgroupSize: vec3.fromValues(COMPUTE_WORKGROUP_SIZE_X, COMPUTE_WORKGROUP_SIZE_Y, 1),
	});

	const mesh = new Mesh({ material });

	const stagingBuffer = WebGPUInternal.device.createBuffer({
		size: bufferSize,
		usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
	});

	Graphics.compute(mesh,
		{
			workgroupCountX: Math.ceil(texture.width / (material.workgroupSize?.[0] ?? 1)),
			workgroupCountY: Math.ceil(texture.height / (material.workgroupSize?.[1] ?? 1)),
		},
		(commandEncoder: GPUCommandEncoder) => {
			const outputBuffer = material.getStorage('output')!.buffer!;

			commandEncoder.copyBufferToBuffer(
				outputBuffer,
				0, // Source offset
				stagingBuffer,
				0, // Destination offset
				bufferSize
			);
		}
	);

	await stagingBuffer.mapAsync(
		GPUMapMode.READ,
		0, // Offset
		bufferSize // Length
	);

	const copyArrayBuffer = stagingBuffer.getMappedRange(0, bufferSize);
	const data = new Float32Array(copyArrayBuffer.slice());

	mesh.dispose();

	return data;
}

async function getTextureCubeData(texture: Texture): Promise<Float32Array> {// TODO: also output Uint8Array / Uint8ClampedArray
	if (Graphics.isWebGLAny) {
		throw new Error('This method is only available in WebGPU mode');
	}
	const bufferSize = texture.width * texture.height * texture.elementsPerTexel * 4;
	const destBufferSize = bufferSize * 6;// 6 faces

	const material = new ShaderMaterial({
		shaderSource: 'texture_cube_datas',
		uniforms: {
			input: texture,
			size: vec2.fromValues(texture.width, texture.height),
			elements: texture.elementsPerTexel,
		},
		storages: {
			output: {
				size: bufferSize,
				usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
			},
		},
		gpuConstants: {
			WORKGROUP_SIZE_X: COMPUTE_WORKGROUP_SIZE_X,
			WORKGROUP_SIZE_Y: COMPUTE_WORKGROUP_SIZE_Y,
		},
		workgroupSize: vec3.fromValues(COMPUTE_WORKGROUP_SIZE_X, COMPUTE_WORKGROUP_SIZE_Y, 1),
	});

	const mesh = new Mesh({ material });

	const destinationBuffer = WebGPUInternal.device.createBuffer({
		size: destBufferSize,
		usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
	});

	for (let i = 0; i < 6; ++i) {
		material.gpuConstants!.layer = i;
		Graphics.compute(mesh,
			{
				workgroupCountX: Math.ceil(texture.width / (material.workgroupSize?.[0] ?? 1)),
				workgroupCountY: Math.ceil(texture.height / (material.workgroupSize?.[1] ?? 1)),
			},
			(commandEncoder: GPUCommandEncoder) => {
				const outputBuffer = material.getStorage('output')!.buffer!;

				commandEncoder.copyBufferToBuffer(
					outputBuffer,
					0, // Source offset
					destinationBuffer,
					bufferSize * i, // Destination offset
					bufferSize
				);
			}
		);
	}

	await destinationBuffer.mapAsync(
		GPUMapMode.READ,
		0, // Offset
		destBufferSize // Length
	);

	const copyArrayBuffer = destinationBuffer.getMappedRange(0, destBufferSize);
	const data = new Float32Array(copyArrayBuffer.slice());
	console.info(data);
	destinationBuffer.unmap();

	material.dispose();

	return data;
}
