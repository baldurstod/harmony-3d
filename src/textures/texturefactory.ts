import { vec3 } from 'gl-matrix';
import { Color } from '../core/color';
import { RequiredBy } from '../graphics/graphics';
import { Graphics } from '../graphics/graphics2';
import { WebGPUInternal } from '../graphics/webgpuinternal';
import { WebGLAnyRenderingContext } from '../types';
import { GL_NEAREST, GL_RGB, GL_RGBA, GL_TEXTURE_2D, GL_TEXTURE_CUBE_MAP, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, GL_TEXTURE_CUBE_MAP_POSITIVE_X, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_UNPACK_FLIP_Y_WEBGL, GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, GL_UNSIGNED_BYTE } from '../webgl/constants';
import { fillCheckerTextureWebGPU, fillFlatTextureWebGPU } from '../webgpu/textures/texturefactorywebgpu';
import { Texture } from './texture';

const textures = new Set<WebGLTexture | GPUTexture>();
let context: WebGLAnyRenderingContext;

export const TextureFactoryEventTarget = new EventTarget();

export function setTextureFactoryContext(c: WebGLAnyRenderingContext): void {
	context = c;
}

export type TextureEvent = {
	texture: WebGLTexture;
	count: number;
}

export type CreateTextureParams = {
	dimension?: GPUTextureDimension;
}

//export type HarmonyGPUTextureDescriptorOptionalSize = GPUTextureDescriptor;
export type HarmonyGPUTextureDescriptorOptionalSize = Omit<GPUTextureDescriptor, 'size'> & {
	size?: RequiredBy<GPUExtent3DDict, 'height'>;
	visibility?: number;
}

export type HarmonyGPUTextureDescriptor = Omit<GPUTextureDescriptor, 'size'> & {
	size: RequiredBy<GPUExtent3DDict, 'height'>;
	visibility?: number;
}

export function createTexture(descriptor: HarmonyGPUTextureDescriptor): WebGLTexture | GPUTexture | null {
	let texture: WebGLTexture | GPUTexture;
	if (Graphics.isWebGPU) {
		texture = WebGPUInternal.device.createTexture(descriptor);
	} else {
		texture = context.createTexture();
	}
	textures.add(texture);
	TextureFactoryEventTarget.dispatchEvent(new CustomEvent<TextureEvent>('textureCreated', { detail: { texture: texture, count: textures.size } }));
	return texture;
}

export function deleteTexture(texture: WebGLTexture | GPUTexture | null): void {
	if (!texture) {
		return;
	}

	if (Graphics.isWebGLAny) {
		// WebGL
		context.deleteTexture(texture);
		textures.delete(texture);
		TextureFactoryEventTarget.dispatchEvent(new CustomEvent<TextureEvent>('textureDeleted', { detail: { texture: texture, count: textures.size } }));
	} else {
		// WebGPU
		(texture as GPUTexture).destroy();
	}
}

export function fillFlatTexture(texture: Texture, color: Color, needCubeMap: boolean): void {//TODOv3: mutualize with fillCheckerTexture
	if (Graphics.isWebGPU) {
		return fillFlatTextureWebGPU(texture, color, needCubeMap);
	} else {
		return fillFlatTextureWebGL(texture, color, needCubeMap);
	}
}

export function fillFlatTextureWebGL(texture: Texture, color: Color, needCubeMap: boolean): void {//TODOv3: mutualize with fillCheckerTextureWebGL
	const width = 64;
	const height = 64;
	if (texture) {
		const byteArray = new Uint8Array(width * height * 3);
		let pixelIndex = 0;

		const r = color.r * 255;
		const g = color.g * 255;
		const b = color.b * 255;

		for (let i = 0; i < width; i++) {
			for (let j = 0; j < height; j++) {
				//if ((i + j) % 2 == 0) {
				byteArray[pixelIndex] = r;
				byteArray[pixelIndex + 1] = g;
				byteArray[pixelIndex + 2] = b;
				//}
				pixelIndex += 3;
			}
		}
		if (needCubeMap) {
			context.bindTexture(GL_TEXTURE_CUBE_MAP, texture.texture);
			context.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
			context.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
			context.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
			context.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
			context.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
			context.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
			context.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
			context.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
			context.generateMipmap(GL_TEXTURE_CUBE_MAP);
			context.bindTexture(GL_TEXTURE_CUBE_MAP, null);
		} else {
			context.bindTexture(GL_TEXTURE_2D, texture.texture);//TODOv3: pass param to createTexture and remove this
			context.texImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
			context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
			context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
			context.generateMipmap(GL_TEXTURE_2D);
			context.bindTexture(GL_TEXTURE_2D, null);
		}
	}
}

/*
export function fillCheckerTexture(texture: Texture, color: Color, width: number, height: number, needCubeMap: boolean) {
	if (Graphics.isWebGPU) {
		return fillCheckerTextureWebGPU(texture, color, width, height, needCubeMap);
	} else {
		return fillCheckerTextureWebGL(texture, color, width, height, needCubeMap);
	}
}
*/

export function fillCheckerTexture(texture: Texture, color: Color, width: number, height: number, needCubeMap: boolean): void {
	/*
	const byteArray = new Uint8Array(width * height * 3);
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
			}
			pixelIndex += 3;
		}
	}
	*/
	if (Graphics.isWebGPU) {
		return fillCheckerTextureWebGPU(/*byteArray, */texture, color, width, height, needCubeMap);
	} else {
		return fillCheckerTextureWebGL(/*byteArray, */texture, color, width, height, needCubeMap);
	}
}

function fillCheckerTextureWebGL(/*byteArray: Uint8Array, */texture: Texture, color: Color, width: number, height: number, needCubeMap: boolean): void {
	const byteArray = new Uint8Array(width * height * 3);
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
			}
			pixelIndex += 3;
		}
	}
	if (needCubeMap) {
		context.bindTexture(GL_TEXTURE_CUBE_MAP, texture.texture);
		context.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
		context.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
		context.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
		context.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
		context.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
		context.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
		context.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		context.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		context.generateMipmap(GL_TEXTURE_CUBE_MAP);
		context.bindTexture(GL_TEXTURE_CUBE_MAP, null);
	} else {
		context.bindTexture(GL_TEXTURE_2D, texture.texture);//TODOv3: pass param to createTexture and remove this
		context.texImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
		context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		context.generateMipmap(GL_TEXTURE_2D);
		context.bindTexture(GL_TEXTURE_2D, null);
	}
}

export function fillNoiseTexture(texture: Texture, width = 64, height = 64, needCubeMap = false): void {//TODO: do a proper noise
	if (texture) {
		const byteArray = new Uint8Array(width * height * 3);
		let pixelIndex = 0;
		const randomVec3 = vec3.create();
		for (let i = 0; i < width; i++) {
			for (let j = 0; j < height; j++) {
				vec3.random(randomVec3, 255.0);
				byteArray[pixelIndex] = randomVec3[0];
				byteArray[pixelIndex + 1] = randomVec3[1];
				byteArray[pixelIndex + 2] = randomVec3[2];
				pixelIndex += 3;
			}
		}
		if (needCubeMap) {
			context.bindTexture(GL_TEXTURE_CUBE_MAP, texture.texture);
			context.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
			context.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
			context.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
			context.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
			context.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
			context.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
			context.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
			context.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
			context.generateMipmap(GL_TEXTURE_CUBE_MAP);
			context.bindTexture(GL_TEXTURE_CUBE_MAP, null);
		} else {
			context.bindTexture(GL_TEXTURE_2D, texture.texture);//TODOv3: pass param to createTexture and remove this
			context.texImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
			context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
			context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
			context.generateMipmap(GL_TEXTURE_2D);
			context.bindTexture(GL_TEXTURE_2D, null);
		}
	}
}

export async function fillTextureWithImage(texture: Texture, image: HTMLImageElement): Promise<void> {
	if (Graphics.isWebGPU) {
		await fillTextureWithImageWebGPU(texture, image);
	} else {
		fillTextureWithImageWebGL(texture, image);
	}
}

function fillTextureWithImageWebGL(texture: Texture, image: HTMLImageElement): void {
	context.bindTexture(GL_TEXTURE_2D, texture.texture);
	context.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
	context.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, texture.flipY);
	context.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, GL_RGBA, GL_UNSIGNED_BYTE, image);
	context.generateMipmap(GL_TEXTURE_2D);
	context.bindTexture(GL_TEXTURE_2D, null);
	texture.width = image.width;
	texture.height = image.height;
	context.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
}

async function fillTextureWithImageWebGPU(texture: Texture, image: HTMLImageElement): Promise<void> {
	const source = await createImageBitmap(image, { colorSpaceConversion: 'none' });

	WebGPUInternal.device.queue.copyExternalImageToTexture(
		{ source, flipY: true },
		{ texture: texture.texture as GPUTexture },
		{ width: source.width, height: source.height },
	);
	WebGPUInternal.device.queue.submit([]);
}
