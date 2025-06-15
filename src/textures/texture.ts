import { deleteTexture } from './texturefactory';
import { GL_TEXTURE_WRAP_S, GL_TEXTURE_WRAP_T, GL_UNPACK_FLIP_Y_WEBGL, GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, GL_LINEAR, GL_NEAREST_MIPMAP_LINEAR, GL_REPEAT, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_RGBA, GL_UNSIGNED_BYTE } from '../webgl/constants';
import { TESTING } from '../buildoptions';
import { ColorSpace, TextureFormat, TextureMapping, TextureTarget, TextureType } from './constants';
import { WebGLAnyRenderingContext } from '../types';


export type TextureParams = any/*TODO:create a proper type*/;

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
	texture: WebGLTexture | null = null;
	width = 0;
	height = 0;
	isTexture = true;
	name = '';
	#colorSpace: ColorSpace;
	isRenderTargetTexture = false;
	properties = new Map<string, any>();

	constructor(textureParams: TextureParams = {}) {
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

		this.dirty = true;//removeme ?

		//this.texture = TextureManager.createTexture();
		//this.setParameters();

		/*gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, byteArray);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);*/

		/*gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);*/
	}

	setParameters(glContext: WebGLAnyRenderingContext, target: GLenum) {
		glContext.bindTexture(target, this.texture);
		glContext.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, this.flipY);
		glContext.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);
		glContext.texParameteri(target, GL_TEXTURE_MAG_FILTER, this.magFilter);
		glContext.texParameteri(target, GL_TEXTURE_MIN_FILTER, this.minFilter);
		glContext.texParameteri(target, GL_TEXTURE_WRAP_S, this.wrapS);
		glContext.texParameteri(target, GL_TEXTURE_WRAP_T, this.wrapT);
		glContext.bindTexture(target, null);
	}

	texImage2D(glContext: WebGLAnyRenderingContext, target: TextureTarget, width: number, height: number, format: TextureFormat, type: TextureType, pixels: ArrayBufferView | null = null, level = 0) {
		glContext.bindTexture(target, this.texture);
		glContext.texImage2D(target, level, this.internalFormat, width, height, 0, format, type, pixels);
		glContext.bindTexture(target, null);
		this.width = width;
		this.height = height;
	}

	generateMipmap(glContext: WebGLAnyRenderingContext, target: GLenum) {
		glContext.bindTexture(target, this.texture);
		glContext.generateMipmap(target);
		glContext.bindTexture(target, null);
	}

	clone() {
		return new Texture().copy(this);
	}

	copy(other: Texture) {
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

		this.dirty = true;//removeme ?
	}

	setAlphaBits(bits: number) {
		this.#alphaBits = bits;
	}

	getAlphaBits() {
		return this.#alphaBits;
	}

	hasAlphaChannel() {
		return this.#alphaBits > 0;
	}

	getWidth() {
		return this.width;
	}

	getHeight() {
		return this.height;
	}

	is(type: string): boolean {
		return type === 'Texture';
	}

	addUser(user: any) {
		this.#users.add(user);
	}

	removeUser(user: any) {
		this.#users.delete(user);
		this.dispose();
	}

	hasNoUser() {
		return this.#users.size == 0;
	}

	hasOnlyUser(user: any) {
		return (this.#users.size == 1) && (this.#users.has(user));
	}

	dispose() {
		if (this.hasNoUser()) {
			if (TESTING) {
				console.info('Texture has no more users, deleting', this);
			}
			deleteTexture(this.texture);
		}
	}
}
