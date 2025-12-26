import { Color } from '../../core/color';
import { WebGPUInternal } from '../../graphics/webgpuinternal';
import { Texture } from '../../textures/texture';

export function fillCheckerTextureWebGPU(/*byteArray: Uint8Array, */texture: Texture, color: Color, width: number, height: number, needCubeMap: boolean): void {
	const byteArray = new Uint8Array(width * height * 4);
	let pixelIndex = 0;

	const r = color.r * 255;
	const g = color.g * 255;
	const b = color.b * 255;

	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height; j++) {
			if ((i + j) % 2 == 0) {
				byteArray[pixelIndex] = r;
				byteArray[pixelIndex + 1] = g;
				byteArray[pixelIndex + 2] = b;
				byteArray[pixelIndex + 3] = 255;
			}
			pixelIndex += 4;
		}
	}

	if (needCubeMap) {
		for (let i = 0; i < 6; i++) {
			WebGPUInternal.device.queue.writeTexture({
				texture: (texture.texture as GPUTexture),
				origin: { x: 0, y: 0, z: i },
			}, byteArray as BufferSource, { bytesPerRow: height * 4 }, { width, height, });
		}
	} else {
		WebGPUInternal.device.queue.writeTexture({ texture: (texture.texture as GPUTexture) }, byteArray as BufferSource, { bytesPerRow: height * 4 }, { width, height, });
	}
	WebGPUInternal.device.queue.submit([]);
}

export function fillFlatTextureWebGPU(texture: Texture, color: Color, needCubeMap: boolean): void {//TODOv3: mutualize with fillCheckerTextureWebGPU
	const width = texture.width;
	const height = texture.height;
	const byteArray = new Uint8Array(width * height * 4);
	let pixelIndex = 0;

	const r = color.r * 255;
	const g = color.g * 255;
	const b = color.b * 255;

	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height; j++) {
			byteArray[pixelIndex] = r;
			byteArray[pixelIndex + 1] = g;
			byteArray[pixelIndex + 2] = b;
			byteArray[pixelIndex + 3] = 255;
			pixelIndex += 4;
		}
	}

	if (needCubeMap) {
		for (let i = 0; i < 6; i++) {
			WebGPUInternal.device.queue.writeTexture({
				texture: (texture.texture as GPUTexture),
				origin: { x: 0, y: 0, z: i },
			}, byteArray as BufferSource, { bytesPerRow: height * 4 }, { width, height, });
		}
	} else {
		WebGPUInternal.device.queue.writeTexture({ texture: (texture.texture as GPUTexture) }, byteArray as BufferSource, { bytesPerRow: height * 4 }, { width, height, });
	}
	WebGPUInternal.device.queue.submit([]);
}
