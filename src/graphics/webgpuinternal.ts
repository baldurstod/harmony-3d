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
