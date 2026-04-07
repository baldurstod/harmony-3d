import { errorOnce } from 'harmony-utils';
import { ImageFormat } from './enums';

export function getWebGPUData(imageFormat: ImageFormat, data: Uint8Array | Float32Array): Uint8Array | Float32Array {
	let rIndex: 0 | 1 | 2 = 0;
	const gIndex: 0 | 1 | 2 = 1;
	let bIndex: 0 | 1 | 2 = 2;
	switch (imageFormat) {
		case ImageFormat.RGB888:
		case ImageFormat.RGB888_BLUESCREEN:
			break;
		case ImageFormat.BGR888:
		case ImageFormat.BGR888_BLUESCREEN:
			rIndex = 2;
			bIndex = 0;
			break;
		case ImageFormat.RGB565:
			// TODO: handle this case. No test data yet
			errorOnce('Code getWebGPUData for IMAGE_FORMAT_RGB565');
			break;
		case ImageFormat.Bc1:
		case ImageFormat.Bc2:
		case ImageFormat.Bc3:
		case ImageFormat.BGRA8888:// Not to sure about this one
			// Do nothing, return the data as is
			return data;
		default:
			errorOnce(`unsupported image format in getWebGPUData: ${imageFormat}`);
			return data;
	}

	let rgba: Uint8Array | Float32Array;
	let alphaValue: number;
	if (data instanceof Uint8Array) {
		rgba = new Uint8Array(data.length * 4 / 3);
		alphaValue = 255;
	} else {
		rgba = new Float32Array(data.length * 4 / 3);
		alphaValue = 1;
	}

	let j = 0;
	for (let i = 0; i < data.length; i += 3) {
		rgba[j++] = data[i + rIndex]!;
		rgba[j++] = data[i + gIndex]!;
		rgba[j++] = data[i + bIndex]!;
		rgba[j++] = alphaValue;
	}
	return rgba;
}

export function getWebGPUFormat(imageFormat: ImageFormat, srgb: boolean): GPUTextureFormat {
	// TODO: add other formats
	switch (imageFormat) {
		case ImageFormat.Bc1:
			return srgb ? 'bc1-rgba-unorm-srgb' : 'bc1-rgba-unorm';
		case ImageFormat.Bc2:
			return srgb ? 'bc2-rgba-unorm-srgb' : 'bc2-rgba-unorm';
		case ImageFormat.Bc3:
			return srgb ? 'bc3-rgba-unorm-srgb' : 'bc3-rgba-unorm';
		default:
			errorOnce(`getWebGPUFormat: unknown format: ${imageFormat}`);
			break;
	}
	return 'rgba8unorm';
}

export function getWebGPUBytesPerRow(imageFormat: ImageFormat, width: number): number {
	// TODO: fix the format: add bc3 / bc5 , srgb, non rgba...
	// TODO: set up a map to do that
	switch (imageFormat) {
		case ImageFormat.RGBA16161616F:
		case ImageFormat.RGBA16161616:
			return width * 8;
		case ImageFormat.RGBA8888:
		case ImageFormat.ABGR8888:
		case ImageFormat.ARGB8888:
		case ImageFormat.BGRA8888:
		case ImageFormat.UVWQ8888:
		case ImageFormat.UVLX8888:
		// The following case are remapped to rgba, rgb doesn't exist in webgpu
		case ImageFormat.RGB888:
		case ImageFormat.BGR888:
		case ImageFormat.RGB888_BLUESCREEN:
		case ImageFormat.BGR888_BLUESCREEN:
			return width * 4;
		case ImageFormat.BGRA5551:
			return width * 3;
		case ImageFormat.IA88:
		case ImageFormat.RGB565:
		case ImageFormat.BGR565:
		case ImageFormat.BGRA4444:
		case ImageFormat.BGRA5551:
		case ImageFormat.UV88:
			return width * 2;
		case ImageFormat.A8:
		case ImageFormat.I8:
		case ImageFormat.P8:
			return width;
		case ImageFormat.Bc1:
			return width * 2;
		case ImageFormat.Bc2:
			// TODO: check the result
			return width;
		case ImageFormat.Bc3:
			// TODO: check the result
			return width * 4;
		default:
			errorOnce(`WebGPU: unknown vtf format: ${imageFormat}`);
			return width * 4;
	}
}
