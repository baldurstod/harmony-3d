import { TESTING } from '../buildoptions';
import { Graphics } from '../graphics/graphics2';
import { WebGPUInternal } from '../graphics/webgpuinternal';
import { WebGLAnyRenderingContext } from '../types';
import { errorOnce } from '../utils/console';
import { GL_LINEAR, GL_NEAREST_MIPMAP_LINEAR, GL_REPEAT, GL_RGBA, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_TEXTURE_WRAP_S, GL_TEXTURE_WRAP_T, GL_UNPACK_FLIP_Y_WEBGL, GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL } from '../webgl/constants';
import { ColorSpace, TextureFormat, TextureMapping, TextureTarget, TextureType } from './constants';
import { deleteTexture } from './texturefactory';

export type TextureParams = {
	[key: string]: unknown;
	//webgpuDescriptor: GPUTextureDescriptor;
	image?: HTMLImageElement;
	flipY?: boolean;
	premultiplyAlpha?: boolean;
	colorSpace?: ColorSpace;
	gpuFormat: GPUTextureFormat;
};

export class Texture {
	mapping = TextureMapping.UvMapping;
	#users = new Set<any>();
	#alphaBits = 0;
	image?: HTMLImageElement;
	internalFormat: any;
	format: any;
	type: any;
	magFilter: any;
	minFilter: any;
	wrapS: any;
	wrapT: any;
	anisotropy: number;
	generateMipmaps = true;
	flipY = false;
	premultiplyAlpha = false;
	dirty = true;
	texture: WebGLTexture | GPUTexture | null = null;
	// WebGPU sampler
	sampler: GPUSampler | null = null;
	width = 0;
	height = 0;
	isTexture = true;
	name = '';
	#colorSpace: ColorSpace;
	isRenderTargetTexture = false;
	properties = new Map<string, any>();
	readonly defines = new Map<string, string>();
	isCube = false;// TODO: remove. Cube maps should be using CubeTexture
	gpuFormat: GPUTextureFormat;
	//readonly webgpuDescriptor: HarmonyGPUTextureDescriptor;

	constructor(textureParams: TextureParams = { gpuFormat: 'rgba8unorm' }) {
		//this.target = GL_TEXTURE_2D;//TODOv3 target bound to texture ?
		this.image = textureParams.image;

		this.internalFormat = textureParams.internalFormat || GL_RGBA;

		this.magFilter = textureParams.magFilter || GL_LINEAR;
		this.minFilter = textureParams.minFilter || GL_NEAREST_MIPMAP_LINEAR;

		this.wrapS = textureParams.wrapS || GL_REPEAT;
		this.wrapT = textureParams.wrapT || GL_REPEAT;

		//this.width = textureParams.width || 0;TODOv3
		//this.height = textureParams.height || 0;

		this.anisotropy = 0;

		this.flipY = textureParams.flipY ?? false;
		this.premultiplyAlpha = textureParams.premultiplyAlpha ?? false;
		this.#colorSpace = textureParams.colorSpace ?? ColorSpace.None;

		this.gpuFormat = textureParams.gpuFormat;

		this.dirty = true;//removeme ?

		//this.texture = TextureManager.createTexture();
		//this.setParameters();

		/*gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, byteArray);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);*/

		/*gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);*/
	}

	setParameters(glContext: WebGLAnyRenderingContext, target: GLenum): void {
		if (Graphics.isWebGLAny) {
			glContext.bindTexture(target, this.texture);
			glContext.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, this.flipY);
			glContext.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);
			glContext.texParameteri(target, GL_TEXTURE_MAG_FILTER, this.magFilter);
			glContext.texParameteri(target, GL_TEXTURE_MIN_FILTER, this.minFilter);
			glContext.texParameteri(target, GL_TEXTURE_WRAP_S, this.wrapS);
			glContext.texParameteri(target, GL_TEXTURE_WRAP_T, this.wrapT);
			glContext.bindTexture(target, null);
		} else {
			errorOnce('TODO: Code setParameters for webgpu');
		}
	}

	/**
	 * Change the pixel content of the texture.
	 * @param glContext WebGL context, if relevant.
	 * @param target Texture target, in WebGL context.
	 * @param width Texture width.
	 * @param height Texture height.
	 * @param format Texture format for WebGL context.
	 * @param type Texture type for WebGL context.
	 * @param pixels Texture content.
	 * @param level Texture lod
	 */
	texImage2D(glContext: WebGLAnyRenderingContext, target: TextureTarget, width: number, height: number, format: TextureFormat, type: TextureType, pixels: ArrayBufferView | null = null, level = 0): void {
		if (Graphics.isWebGLAny) {
			glContext.bindTexture(target, this.texture);
			glContext.texImage2D(target, level, this.internalFormat, width, height, 0, format, type, pixels);
			glContext.bindTexture(target, null);
			this.width = width;
			this.height = height;
		} else {
			throw new Error('This function can\'t be used in a WebGPU context');
		}
	}

	generateMipmap(glContext: WebGLAnyRenderingContext, target: GLenum): void {
		if (Graphics.isWebGLAny) {
			glContext.bindTexture(target, this.texture);
			glContext.generateMipmap(target);
			glContext.bindTexture(target, null);
		} else {
			errorOnce('TODO: Code generateMipmap for webgpu');
		}
	}

	clone(): void {
		return new Texture().copy(this);
	}

	copy(other: Texture): void {
		this.image = other.image;

		this.#alphaBits = other.#alphaBits;
		this.internalFormat = other.internalFormat;

		this.magFilter = other.magFilter;
		this.minFilter = other.minFilter;

		this.wrapS = other.wrapS;
		this.wrapT = other.wrapT;

		this.anisotropy = other.anisotropy;

		this.generateMipmaps = other.generateMipmaps;
		this.flipY = other.flipY;
		this.premultiplyAlpha = other.premultiplyAlpha;

		this.gpuFormat = other.gpuFormat;

		this.dirty = true;//removeme ?
	}

	setAlphaBits(bits: number): void {
		this.#alphaBits = bits;
	}

	getAlphaBits(): number {
		return this.#alphaBits;
	}

	hasAlphaChannel(): boolean {
		return this.#alphaBits > 0;
	}

	getWidth(): number {
		return this.width;
	}

	getHeight(): number {
		return this.height;
	}

	is(type: string): boolean {
		return type === 'Texture';
	}

	addUser(user: any): void {
		this.#users.add(user);
	}

	removeUser(user: any): void {
		this.#users.delete(user);
		this.dispose();
	}

	hasNoUser(): boolean {
		return this.#users.size == 0;
	}

	hasOnlyUser(user: any): boolean {
		return (this.#users.size == 1) && (this.#users.has(user));
	}

	dispose():void {
		if (this.hasNoUser()) {
			if (TESTING) {
				console.info('Texture has no more users, deleting', this);
			}
			deleteTexture(this.texture);
		}
	}
}

export function getCurrentTexture(): Texture {
	const texture = new Texture({ gpuFormat: WebGPUInternal.format });
	texture.texture = WebGPUInternal.gpuContext.getCurrentTexture();
	return texture;
}
