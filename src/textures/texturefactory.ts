import { vec3 } from 'gl-matrix';
import { Color } from '../core/color';
import { WebGLAnyRenderingContext } from '../types';
import { GL_NEAREST, GL_RGB, GL_RGBA, GL_TEXTURE_2D, GL_TEXTURE_CUBE_MAP, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, GL_TEXTURE_CUBE_MAP_POSITIVE_X, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_UNPACK_FLIP_Y_WEBGL, GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, GL_UNSIGNED_BYTE } from '../webgl/constants';
import { Texture } from './texture';

const textures = new Set<WebGLTexture>();
let context: WebGLAnyRenderingContext;

export const TextureFactoryEventTarget = new EventTarget();

export function setTextureFactoryContext(c: WebGLAnyRenderingContext) {
	context = c;
}

export function createTexture(): WebGLTexture | null {
	const texture = context.createTexture();
	textures.add(texture);
	TextureFactoryEventTarget.dispatchEvent(new CustomEvent('textureCreated', { detail: { texture: texture, count: textures.size } }));
	return texture;
}

export function deleteTexture(texture: WebGLTexture | null) {
	if (texture) {
		context.deleteTexture(texture);
		textures.delete(texture);
		TextureFactoryEventTarget.dispatchEvent(new CustomEvent('textureDeleted', { detail: { texture: texture, count: textures.size } }));
	}
}

export function fillFlatTexture(texture: Texture, color: Color, needCubeMap: boolean) {//TODOv3: mutualize with fillCheckerTexture
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
	return texture;
}

export function fillCheckerTexture(texture: Texture, color: Color, width = 64, height = 64, needCubeMap: boolean) {
	if (texture) {
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
	return texture;
}

export function fillNoiseTexture(texture: Texture, width = 64, height = 64, needCubeMap = false) {//TODO: do a proper noise
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
	return texture;
}

export function fillTextureWithImage(texture: Texture, image: HTMLImageElement) {
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
