import { ENABLE_S3TC } from '../../../buildoptions';
import { Graphics } from '../../../graphics/graphics';
import { Detex } from '../../../textures/detex';
import { Texture } from '../../../textures/texture';
import { WebGLAnyRenderingContext } from '../../../types';
import { GL_CLAMP_TO_EDGE, GL_FLOAT, GL_LINEAR, GL_REPEAT, GL_RGB, GL_RGBA, GL_RGBA16F, GL_SRGB8, GL_SRGB8_ALPHA8, GL_TEXTURE_2D, GL_TEXTURE_CUBE_MAP, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, GL_TEXTURE_CUBE_MAP_POSITIVE_X, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_TEXTURE_WRAP_S, GL_TEXTURE_WRAP_T, GL_UNPACK_FLIP_Y_WEBGL, GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, GL_UNSIGNED_BYTE } from '../../../webgl/constants';
import { TEXTUREFLAGS_CLAMPS, TEXTUREFLAGS_CLAMPT, TEXTUREFLAGS_EIGHTBITALPHA, TEXTUREFLAGS_ENVMAP, TEXTUREFLAGS_ONEBITALPHA, TEXTUREFLAGS_SRGB } from './vtfconstants';

export type VTFMipMap = {
	height: number;
	width: number;
	frames: Array<Array<Uint8Array>>;
}

export type VTFResourceEntry = {
	type: number;
	resData: number;//TODO: rename property to dataOffset
	mipMaps?: Array<VTFMipMap>;
}

export class SourceEngineVTF {
	repository: string;
	fileName: string;
	versionMaj: number = 0;
	versionMin: number = 0;
	width = null;
	height = null;
	flags: number = 0;
	frames = 1;
	faceCount = 1;
	firstFrame = null;
	reflectivity = null;
	bumpmapScale = null;
	highResImageFormat = 0;
	mipmapCount = 0;
	lowResImageFormat = null;
	lowResImageWidth = null;
	lowResImageHeight = null;
	depth = null;
	resEntries: Array<VTFResourceEntry> = [];
	currentFrame = 0;
	filled = false;
	numResources: number = 0;
	headerSize: number = 0;

	constructor(repository: string, fileName: string) {
		this.repository = repository;
		this.fileName = fileName;
	}

	setVerionMin(value: number): void {
		this.versionMin = value;
	}

	/**
	 * TODO
	 */
	setFlags(flags: number): void {
		this.flags = flags;
		if (flags & TEXTUREFLAGS_ENVMAP) {
			if (this.isHigherThan74()) {
				this.faceCount = 6;
			} else {
				this.faceCount = 7;// WTF ?
			}
		}
	}

	getAlphaBits(): number {
		if ((this.flags & TEXTUREFLAGS_ONEBITALPHA) == TEXTUREFLAGS_ONEBITALPHA) {
			return 1;
		}
		if ((this.flags & TEXTUREFLAGS_EIGHTBITALPHA) == TEXTUREFLAGS_EIGHTBITALPHA) {
			return 8;
		}
		return 0;
	}

	/**
	 * TODO
	 */
	setVerionMaj(value: number): void {
		this.versionMaj = value;
	}

	/**
	 * TODO
	 */
	isHigherThan71(): boolean {
		if (this.versionMaj >= 7 && this.versionMin > 1) {
			return true;
		}
		return false;
	}

	/**
	 * TODO
	 */
	isHigherThan72(): boolean {
		if (this.versionMaj >= 7 && this.versionMin > 2) {
			return true;
		}
		return false;
	}

	/**
	 * TODO
	 */
	isHigherThan73(): boolean {
		if (this.versionMaj >= 7 && this.versionMin > 3) {
			return true;
		}
		return false;
	}

	/**
	 * TODO
	 */
	isHigherThan74(): boolean {
		if (this.versionMaj >= 7 && this.versionMin > 4) {
			return true;
		}
		return false;
	}

	/**
	 * TODO
	 */
	getResource(type: number): VTFResourceEntry | null {
		for (let i = 0; i < this.resEntries.length; ++i) {
			let entry = this.resEntries[i];
			if (entry.type == type) {
				return entry;
			}
		}
		return null;
	}

	/*
	getImageDatas(mipmapLvl: number) {
		let entry = this.getResource(48);
		if (!entry) {
			entry = this.getResource(1);
			if (entry) {
				return entry.imageData;
			} else {
				return null;
			}
		}
		return entry.mipMaps[mipmapLvl];
	}
	*/

	fillTexture(graphics: Graphics, glContext: WebGLAnyRenderingContext, texture: Texture, mipmapLvl: number, frame1 = 0, srgb = true): void {
		if (this.flags & TEXTUREFLAGS_ENVMAP) {
			this.#fillCubeMapTexture(graphics, glContext, texture.texture, mipmapLvl, srgb);
		} else {
			this.#fillTexture(graphics, glContext, texture, mipmapLvl, frame1, srgb);
		}
	}

	#fillTexture(graphics: Graphics, glContext: WebGLAnyRenderingContext, texture: Texture, mipmapLvl: number, frame1 = 0, srgb: boolean): void {
		if (this.filled && (this.frames == 1)) {
			return;
		}
		if (this.filled) {
			//return;
		}

		if (mipmapLvl == undefined) {
			mipmapLvl = this.mipmapCount - 1;
		} else {
			mipmapLvl = Math.min(mipmapLvl, this.mipmapCount - 1);
		}

		const face = 0;
		let frame = 0;
		if (isNaN(frame1)) {
			//TODOv3: removeme
			/*
			if (delta != undefined) {
				this.currentFrame += delta / 100.0;
				frame = Math.min(Math.round(this.currentFrame), this.frames - 1);
				if (this.currentFrame > this.frames) { // TODO: loop
					this.currentFrame = 0;
				}
			}
				*/
		} else {
			this.currentFrame = frame1;
			frame = Math.round(frame1) % this.frames;
			this.currentFrame = frame;
		}

		const res48 = this.getResource(48);
		if (!res48) {
			//TODO: show error
			return;
		}

		const mipmap = res48.mipMaps![mipmapLvl];
		if (!mipmap) {
			//TODO: show error
			return;
		}
		let webGLTexture = texture.texture;

		glContext.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		glContext.bindTexture(GL_TEXTURE_2D, webGLTexture);

		const clampS = (this.flags & TEXTUREFLAGS_CLAMPS) == TEXTUREFLAGS_CLAMPS;
		const clampT = (this.flags & TEXTUREFLAGS_CLAMPT) == TEXTUREFLAGS_CLAMPT;

		texture.width = mipmap.width;
		texture.height = mipmap.height;

		if (this.isDxtCompressed()) {
			fillTextureDxt(graphics, glContext, webGLTexture, GL_TEXTURE_2D, mipmap.width, mipmap.height, this.highResImageFormat - 12, mipmap.frames[frame][face], clampS, clampT, srgb && this.isSRGB());
		} else {
			glContext.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
			glContext.texImage2D(GL_TEXTURE_2D, 0, this.#getInternalFormat(srgb), mipmap.width, mipmap.height, 0, this.getFormat(), this.getType(), mipmap.frames[frame][face]);
		}


		glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, clampS ? GL_CLAMP_TO_EDGE : GL_REPEAT);
		glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, clampT ? GL_CLAMP_TO_EDGE : GL_REPEAT);
		glContext.bindTexture(GL_TEXTURE_2D, null);
		glContext.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);

		this.filled = true;
	}

	/**
	 * TODO
	 */
	#fillCubeMapTexture(graphics: Graphics, glContext: WebGLAnyRenderingContext, texture: WebGLTexture | null, mipmapLvl: number, srgb: boolean): void {
		if (mipmapLvl == undefined) {
			mipmapLvl = this.mipmapCount - 1;
		} else {
			mipmapLvl = Math.min(mipmapLvl, this.mipmapCount - 1);
		}

		let frame = 0;
		//TODOv3: removeme
		/*if (delta!=undefined) {
			this.currentFrame += delta / 100.0;
			frame = Math.min(Math.round(this.currentFrame), this.frames-1);
			if (this.currentFrame>this.frames) { // TODO: loop
				this.currentFrame =0;
			}
		}*/

		const res48 = this.getResource(48);
		if (!res48) {
			//TODO: show error
			return;
		}

		const mipmap = res48.mipMaps![mipmapLvl];
		if (!mipmap) {
			//TODO: show error
			return;
		}

		glContext.bindTexture(GL_TEXTURE_CUBE_MAP, texture);
		glContext.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

		const clampS = (this.flags & TEXTUREFLAGS_CLAMPS) == TEXTUREFLAGS_CLAMPS;
		const clampT = (this.flags & TEXTUREFLAGS_CLAMPT) == TEXTUREFLAGS_CLAMPT;

		if (this.isDxtCompressed()) {
			let isSRGB = srgb && this.isSRGB();
			fillTextureDxt(graphics, glContext, texture, GL_TEXTURE_CUBE_MAP_POSITIVE_X, mipmap.width, mipmap.height, this.highResImageFormat - 12, mipmap.frames[frame][0], clampS, clampT, isSRGB);
			fillTextureDxt(graphics, glContext, texture, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, mipmap.width, mipmap.height, this.highResImageFormat - 12, mipmap.frames[frame][1], clampS, clampT, isSRGB);
			fillTextureDxt(graphics, glContext, texture, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, mipmap.width, mipmap.height, this.highResImageFormat - 12, mipmap.frames[frame][2], clampS, clampT, isSRGB);
			fillTextureDxt(graphics, glContext, texture, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, mipmap.width, mipmap.height, this.highResImageFormat - 12, mipmap.frames[frame][3], clampS, clampT, isSRGB);
			fillTextureDxt(graphics, glContext, texture, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, mipmap.width, mipmap.height, this.highResImageFormat - 12, mipmap.frames[frame][4], clampS, clampT, isSRGB);
			fillTextureDxt(graphics, glContext, texture, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, mipmap.width, mipmap.height, this.highResImageFormat - 12, mipmap.frames[frame][5], clampS, clampT, isSRGB);
		} else {
			glContext.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
			glContext.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, this.#getInternalFormat(srgb), mipmap.width, mipmap.height, 0, this.getFormat(), this.getType(), mipmap.frames[frame][0]);
			glContext.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, this.#getInternalFormat(srgb), mipmap.width, mipmap.height, 0, this.getFormat(), this.getType(), mipmap.frames[frame][1]);
			glContext.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, this.#getInternalFormat(srgb), mipmap.width, mipmap.height, 0, this.getFormat(), this.getType(), mipmap.frames[frame][2]);
			glContext.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, this.#getInternalFormat(srgb), mipmap.width, mipmap.height, 0, this.getFormat(), this.getType(), mipmap.frames[frame][3]);
			glContext.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, this.#getInternalFormat(srgb), mipmap.width, mipmap.height, 0, this.getFormat(), this.getType(), mipmap.frames[frame][4]);
			glContext.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, this.#getInternalFormat(srgb), mipmap.width, mipmap.height, 0, this.getFormat(), this.getType(), mipmap.frames[frame][5]);
		}

		glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, clampS ? GL_CLAMP_TO_EDGE : GL_REPEAT);
		glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, clampT ? GL_CLAMP_TO_EDGE : GL_REPEAT);
		glContext.bindTexture(GL_TEXTURE_CUBE_MAP, null);

		this.filled = true;
	}

	/*
	getDxtFormat(s3tc) {
		switch (this.highResImageFormat) {
			case IMAGE_FORMAT_DXT1:
				return s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT;
			case IMAGE_FORMAT_DXT3:
				return s3tc.COMPRESSED_RGBA_S3TC_DXT3_EXT;
			case IMAGE_FORMAT_DXT5:
				return s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT;
			/* TODO: check format */
	/*case IMAGE_FORMAT_DXT1_ONEBITALPHA:
		return s3tc.COMPRESSED_RGB_S3TC_DXT1_EXT;* /
}
return 0;
}
*/

	/**
	 * TODO
	 */
	getFormat(): number {
		switch (this.highResImageFormat) {
			case IMAGE_FORMAT_RGB888:
			case IMAGE_FORMAT_BGR888:// Note: format has been inverted at load time
				return GL_RGB;
			case IMAGE_FORMAT_RGBA8888:
			case IMAGE_FORMAT_BGRA8888:// Note: format has been inverted at load time
			case IMAGE_FORMAT_ABGR8888:// Note: format has been inverted at load time
			case IMAGE_FORMAT_RGBA16161616F:// Note: format has been inverted at load time
				return GL_RGBA;
		}
		return 0;

	}

	/**
	 * TODO
	 */
	#getInternalFormat(allowSrgb = true): number {
		switch (this.highResImageFormat) {
			case IMAGE_FORMAT_RGB888:
			case IMAGE_FORMAT_BGR888:
				return this.isSRGB() && allowSrgb ? GL_SRGB8 : GL_RGB;
			case IMAGE_FORMAT_RGBA8888:
			case IMAGE_FORMAT_BGRA8888:
			case IMAGE_FORMAT_ABGR8888:
				return this.isSRGB() && allowSrgb ? GL_SRGB8_ALPHA8 : GL_RGBA;
			case IMAGE_FORMAT_RGBA16161616F:// Note: format has been inverted at load time
				return GL_RGBA16F;
		}
		return 0;
	}


	/**
	 * TODO
	 */
	getType(): number {
		switch (this.highResImageFormat) {
			case IMAGE_FORMAT_RGBA16161616F:
				return GL_FLOAT;
			default:
				return GL_UNSIGNED_BYTE;
		}
	}

	/**
	 * Return whether the texture is compressed or not
	 * @return {bool} true if texture is dxt compressed
	 */
	isDxtCompressed(): boolean {
		switch (this.highResImageFormat) {
			case IMAGE_FORMAT_DXT1:
			case IMAGE_FORMAT_DXT3:
			case IMAGE_FORMAT_DXT5:
				return true;
		}
		return false;
	}

	isSRGB(): boolean {
		return ((this.flags & TEXTUREFLAGS_SRGB) == TEXTUREFLAGS_SRGB);
	}
}



export const IMAGE_FORMAT_NONE = -1;
export const IMAGE_FORMAT_RGBA8888 = 0;
export const IMAGE_FORMAT_ABGR8888 = 1;
export const IMAGE_FORMAT_RGB888 = 2;
export const IMAGE_FORMAT_BGR888 = 3;
export const IMAGE_FORMAT_RGB565 = 4;
export const IMAGE_FORMAT_I8 = 5;
export const IMAGE_FORMAT_IA88 = 6;
export const IMAGE_FORMAT_P8 = 7;
export const IMAGE_FORMAT_A8 = 8;
export const IMAGE_FORMAT_RGB888_BLUESCREEN = 9;
export const IMAGE_FORMAT_BGR888_BLUESCREEN = 10;
export const IMAGE_FORMAT_ARGB8888 = 11;
export const IMAGE_FORMAT_BGRA8888 = 12;
export const IMAGE_FORMAT_DXT1 = 13;
export const IMAGE_FORMAT_DXT3 = 14;
export const IMAGE_FORMAT_DXT5 = 15;
export const IMAGE_FORMAT_BGRX8888 = 16;
export const IMAGE_FORMAT_BGR565 = 17;
export const IMAGE_FORMAT_BGRX5551 = 18;
export const IMAGE_FORMAT_BGRA4444 = 19;
export const IMAGE_FORMAT_DXT1_ONEBITALPHA = 20;
export const IMAGE_FORMAT_BGRA5551 = 21;
export const IMAGE_FORMAT_UV88 = 22;
export const IMAGE_FORMAT_UVWQ8888 = 23;
export const IMAGE_FORMAT_RGBA16161616F = 24;
export const IMAGE_FORMAT_RGBA16161616 = 25;
export const IMAGE_FORMAT_UVLX8888 = 26;


function fillTextureDxt(graphics: Graphics, glContext: WebGLAnyRenderingContext, texture: WebGLTexture | null, target: GLenum, width: number, height: number, dxtLevel: number, datas: Uint8Array, clampS: boolean, clampT: boolean, srgb: boolean): void {//removeme
	const s3tc = graphics.getExtension('WEBGL_compressed_texture_s3tc');
	const s3tcSRGB = graphics.getExtension('WEBGL_compressed_texture_s3tc_srgb');

	glContext.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
	//glContext.bindTexture(target, texture);

	if (ENABLE_S3TC && s3tc) {
		let dxtFormat = 0;
		switch (dxtLevel) {
			case 1: dxtFormat = srgb ? s3tcSRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT : s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT; break;
			case 2: dxtFormat = srgb ? s3tcSRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT : s3tc.COMPRESSED_RGBA_S3TC_DXT3_EXT; break;
			case 3: dxtFormat = srgb ? s3tcSRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT : s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT; break;
		}
		glContext.compressedTexImage2D(target, 0, dxtFormat, width, height, 0, datas);
	} else {
		glContext.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
		let uncompressedData = new Uint8Array(width * height * 4);

		let decompressFunc = null;
		switch (dxtLevel) {
			case 1: decompressFunc = 'decodeBC1'; break;
			case 2: decompressFunc = 'decodeBC2'; break;
			case 3: decompressFunc = 'decodeBC3'; break;
		}
		if (decompressFunc) {
			(Detex as any)[decompressFunc](width, height, datas, uncompressedData).then(
				() => {
					glContext.bindTexture(GL_TEXTURE_2D, texture);
					glContext.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, uncompressedData);//TODO: params
					glContext.bindTexture(GL_TEXTURE_2D, null);
				}
			);
		}
		/*const dxtflag = dxtLevel == 1 ? (1 << 0) : (1 << 2);
		let uncompressedData;
		if (datas.uncompressedData) {
			uncompressedData = datas.uncompressedData;
		} else {
			uncompressedData = decompress(datas, width, height, dxtflag);
			datas.uncompressedData = uncompressedData;
		}
		glContext.texImage2D(target, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, uncompressedData);//TODO: params*/
	}

	//glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MAG_FILTER, glContext.LINEAR);
	//glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.LINEAR);

	//glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, clampS ? glContext.CLAMP_TO_EDGE : glContext.REPEAT);
	//glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, clampT ? glContext.CLAMP_TO_EDGE : glContext.REPEAT);
	//glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE);
	//glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);

	//glContext.bindTexture(glContext.TEXTURE_2D, null);
	glContext.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
};
