import { Millisecond } from 'harmony-types';

export class WebGPUInternal {
	static gpuContext: GPUCanvasContext;
	static config: GPUCanvasConfiguration;
	static adapter: GPUAdapter;
	static device: GPUDevice;
	static format: GPUTextureFormat;
	static depthTexture: GPUTexture;
}

let buffers: Set<GPUBuffer>;

export function trackGPUBuffers(): Set<GPUBuffer> {
	if (buffers) {
		return buffers;
	}

	buffers = new Set<GPUBuffer>();

	const gpuDeviceOriginals = {
		GPUDevice_createBuffer: GPUDevice.prototype.createBuffer,
		GPUBuffer_destroy: GPUBuffer.prototype.destroy,
	};

	GPUDevice.prototype.createBuffer = function (descriptor: GPUBufferDescriptor): GPUBuffer {
		const buffer = gpuDeviceOriginals.GPUDevice_createBuffer.call(this, descriptor);
		buffers.add(buffer);
		return buffer;
	}

	GPUBuffer.prototype.destroy = function (): undefined {
		buffers.delete(this);
		gpuDeviceOriginals.GPUBuffer_destroy.call(this);
	}

	return buffers;
}

export function logGPUBuffers(delay: Millisecond): ReturnType<typeof setInterval> {
	return setInterval(() => {
		let totalSize = 0;
		buffers.forEach((buffer) => totalSize += buffer.size);

		console.log(`GPU buffers: ${buffers.size}, total size: ${totalSize}`, buffers);
	}, delay);
}
/*


const gpuDeviceOriginals = {
	GPUQueue_writeBuffer: GPUQueue.prototype.writeBuffer,
};

GPUQueue.prototype.writeBuffer = function (

	buffer: GPUBuffer,
	bufferOffset: GPUSize64,
	data: GPUAllowSharedBufferSource,
	dataOffset?: GPUSize64,
	size?: GPUSize64

): undefined {
	if (buffer.size > 50000) {
		console.info(`writing buffer ${buffer.size}`);
	}
	return gpuDeviceOriginals.GPUQueue_writeBuffer.call(this, buffer, bufferOffset, data, dataOffset, size,);
}
*/
