import { vec2, vec3 } from 'gl-matrix';
import { Graphics } from '../graphics/graphics2';
import { WebGPUInternal } from '../graphics/webgpuinternal';
import { ShaderMaterial } from '../materials/shadermaterial';
import { Texture } from './texture';

const COMPUTE_WORKGROUP_SIZE_X = 16;
const COMPUTE_WORKGROUP_SIZE_Y = 16;

/**
 * [WebGPU only] Get the texture pixel data.
 * @param texture The texture to retrieve the pixels from.
 * @returns A Float32Array containing th epixel data.
 */
export async function getTextureData(texture: Texture): Promise<Float32Array> {// TODO: also output Uint8Array / Uint8ClampedArray
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
			isSrgb: texture.isSrgb ? 1 : 0,
		},
		workgroupSize: vec3.fromValues(COMPUTE_WORKGROUP_SIZE_X, COMPUTE_WORKGROUP_SIZE_Y, 1),
	});

	const stagingBuffer = WebGPUInternal.device.createBuffer({
		size: bufferSize,
		usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
	});

	Graphics.compute(material,
		{
			workgroupCountX: Math.ceil(texture.width / (material.workgroupSize?.[0] ?? 1)),
			workgroupCountY: Math.ceil(texture.height! / (material.workgroupSize?.[1] ?? 1)),
		},
		(commandEncoder: GPUCommandEncoder) => {
			const outputBuffer = material.getStorage('output')?.buffer!;

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

	material.dispose();


	return data;
}
