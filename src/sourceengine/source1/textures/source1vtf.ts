import { vec3 } from 'gl-matrix';
import { uint } from 'harmony-types';
import { ENABLE_S3TC } from '../../../buildoptions';
import { Graphics } from '../../../graphics/graphics2';
import { WebGPUInternal } from '../../../graphics/webgpuinternal';
import { Detex } from '../../../textures/detex';
import { ImageFormat, ImageFormatBptc, ImageFormatRgtc, ImageFormatS3tc } from '../../../textures/enums';
import { SpriteSheet } from '../../../textures/spritesheet';
import { Texture } from '../../../textures/texture';
import { WebGLAnyRenderingContext } from '../../../types';
import { errorOnce } from '../../../utils/console';
import { GL_CLAMP_TO_EDGE, GL_FLOAT, GL_LINEAR, GL_REPEAT, GL_RGB, GL_RGBA, GL_RGBA16F, GL_SRGB8, GL_SRGB8_ALPHA8, GL_TEXTURE_2D, GL_TEXTURE_CUBE_MAP, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, GL_TEXTURE_CUBE_MAP_POSITIVE_X, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_TEXTURE_WRAP_S, GL_TEXTURE_WRAP_T, GL_UNPACK_FLIP_Y_WEBGL, GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, GL_UNSIGNED_BYTE } from '../../../webgl/constants';
import { TEXTUREFLAGS_CLAMPS, TEXTUREFLAGS_CLAMPT, TEXTUREFLAGS_EIGHTBITALPHA, TEXTUREFLAGS_ENVMAP, TEXTUREFLAGS_ONEBITALPHA, TEXTUREFLAGS_SRGB } from './vtfconstants';

export interface VTFMipMap {
	height: number;
	width: number;
	frames: (Uint8Array | Float32Array)[][];
}

export interface VTFResourceEntry {
	type: number;
	resData: number;//TODO: rename property to dataOffset
	mipMaps?: VTFMipMap[];
}

export const VTF_ENTRY_IMAGE_DATAS = 48;

type CubeMapDatas = [Uint8Array | Float32Array, Uint8Array | Float32Array, Uint8Array | Float32Array, Uint8Array | Float32Array, Uint8Array | Float32Array, Uint8Array | Float32Array];

export class Source1Vtf {
	repository: string;
	fileName: string;
	versionMaj = 0;
	versionMin = 0;
	width = 0;
	height = 0;
	flags = 0;
	frames = 1;
	faceCount = 1;
	firstFrame = 0;
	reflectivity = vec3.create();
	bumpmapScale = 0;
	highResImageFormat = 0;/*TODO: create enume*/
	mipmapCount = 0;
	lowResImageFormat = 0;
	lowResImageWidth = 0;
	lowResImageHeight = 0;
	depth = 0;
	resEntries: VTFResourceEntry[] = [];
	currentFrame = 0;
	//filled = false;
	numResources = 0;
	headerSize = 0;
	sheet: SpriteSheet | null = null;//TODO: rename to spritesheet

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

	getFlag(flag: number): boolean {
		return (this.flags & flag) == flag;
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

	isCubeMap(): boolean {
		return (this.flags & TEXTUREFLAGS_ENVMAP) === TEXTUREFLAGS_ENVMAP;
	}

	/**
	 * TODO
	 */
	getResource(type: number): VTFResourceEntry | null {
		for (const entry of this.resEntries) {
			//const entry = this.resEntries[i];
			if (entry.type == type) {
				return entry;
			}
		}
		return null;
	}

	/*
	getImageDatas(mipmapLvl: number) {
		let entry = this.getResource(VTF_ENTRY_IMAGE_DATAS);
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

	getMipMapSize(level: uint): { width: uint, height: uint } | null {
		const res48 = this.getResource(VTF_ENTRY_IMAGE_DATAS);
		if (!res48) {
			return null;
		}

		const mipmap = res48.mipMaps![level];
		if (!mipmap) {
			return null;
		}

		return { width: mipmap.width, height: mipmap.height };
	}

	fillTexture(glContext: WebGLAnyRenderingContext, texture: Texture, mipmapLvl: number, frame1 = 0, srgb = true): void {
		if (this.isCubeMap()) {
			texture.isCube = true;
			this.#fillCubeMapTexture(glContext, texture, mipmapLvl, srgb);
		} else {
			this.#fillTexture(glContext, texture, mipmapLvl, frame1, srgb);
		}
	}

	#fillTexture(glContext: WebGLAnyRenderingContext, texture: Texture, mipmapLvl: number, frame1 = 0, srgb: boolean): void {
		/*
		if (this.filled && (this.frames == 1)) {
			return;
		}
		*/

		if (mipmapLvl == undefined) {
			mipmapLvl = this.mipmapCount - 1;
		} else {
			mipmapLvl = Math.min(mipmapLvl, this.mipmapCount - 1);
		}

		const face = 0;
		let frame = 0;

		this.currentFrame = frame1;
		frame = Math.round(frame1) % this.frames;
		this.currentFrame = frame;

		const res48 = this.getResource(VTF_ENTRY_IMAGE_DATAS);
		if (!res48) {
			//TODO: show error
			return;
		}

		const mipmap = res48.mipMaps![mipmapLvl];
		if (!mipmap) {
			//TODO: show error
			return;
		}
		//const webGLTexture = texture.texture;

		//glContext.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		//glContext.bindTexture(GL_TEXTURE_2D, webGLTexture);

		const clampS = this.#getClampS();//(this.flags & TEXTUREFLAGS_CLAMPS) == TEXTUREFLAGS_CLAMPS;
		const clampT = this.#getClampT();//(this.flags & TEXTUREFLAGS_CLAMPT) == TEXTUREFLAGS_CLAMPT;

		texture.width = mipmap.width;
		texture.height = mipmap.height;

		const data = mipmap.frames[frame]?.[face];
		if (data) {
			if (Graphics.isWebGPU) {
				this.#fillTextureWebGPU(texture, mipmap.width, mipmap.height, srgb, clampS, clampT, data);
			} else {
				this.#fillTextureWebGL(glContext, texture, mipmap.width, mipmap.height, srgb, clampS, clampT, data);
			}
		}
		/*
		if (data) {
			if (this.isDxtCompressed()) {
				fillTextureDxt(glContext, webGLTexture, GL_TEXTURE_2D, mipmap.width, mipmap.height, vtfToImageFormat(this.highResImageFormat) as ImageFormatS3tc, data, clampS, clampT, srgb && this.isSRGB());
			} else {
				glContext.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
				glContext.texImage2D(GL_TEXTURE_2D, 0, this.#getInternalFormat(srgb), mipmap.width, mipmap.height, 0, this.getFormat(), this.getType(), data);
			}
		}


		glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, clampS ? GL_CLAMP_TO_EDGE : GL_REPEAT);
		glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, clampT ? GL_CLAMP_TO_EDGE : GL_REPEAT);
		glContext.bindTexture(GL_TEXTURE_2D, null);
		glContext.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
		*/

		//this.filled = true;
	}

	#fillTextureWebGL(glContext: WebGLAnyRenderingContext, texture: Texture, width: number, height: number, srgb: boolean, clampS: boolean, clampT: boolean, data: Uint8Array | Float32Array): void {

		const webGLTexture = texture.texture;

		glContext.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		glContext.bindTexture(GL_TEXTURE_2D, webGLTexture);
		if (data) {
			if (this.isDxtCompressed()) {
				fillTextureDxt(glContext, webGLTexture, GL_TEXTURE_2D, width, height, vtfToImageFormat(this.highResImageFormat) as ImageFormatS3tc, data, clampS, clampT, srgb && this.isSRGB());
			} else {
				glContext.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
				glContext.texImage2D(GL_TEXTURE_2D, 0, this.#getInternalFormat(srgb), width, height, 0, this.getFormat(), this.getType(), data);
			}
		}

		glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, clampS ? GL_CLAMP_TO_EDGE : GL_REPEAT);
		glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, clampT ? GL_CLAMP_TO_EDGE : GL_REPEAT);
		glContext.bindTexture(GL_TEXTURE_2D, null);
		glContext.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
	}

	#fillTextureWebGPU(texture: Texture, width: number, height: number, srgb: boolean, clampS: boolean, clampT: boolean, data: Uint8Array | Float32Array): void {
		WebGPUInternal.device.queue.writeTexture(
			{ texture: texture.texture as GPUTexture },
			this.#getWebGPUData(data) as BufferSource,
			{ bytesPerRow: this.#getWebGPUBytesPerRow(width) },
			{ width: width, height: height },
		);
		WebGPUInternal.device.queue.submit([]);
	}

	#fillCubeMapTexture(glContext: WebGLAnyRenderingContext, texture: Texture, mipmapLvl: number, srgb: boolean): void {
		if (mipmapLvl == undefined) {
			mipmapLvl = this.mipmapCount - 1;
		} else {
			mipmapLvl = Math.min(mipmapLvl, this.mipmapCount - 1);
		}

		const frame = 0;
		//TODOv3: removeme
		/*if (delta!=undefined) {
			this.currentFrame += delta / 100.0;
			frame = Math.min(Math.round(this.currentFrame), this.frames-1);
			if (this.currentFrame>this.frames) { // TODO: loop
				this.currentFrame =0;
			}
		}*/

		const res48 = this.getResource(VTF_ENTRY_IMAGE_DATAS);
		if (!res48) {
			//TODO: show error
			return;
		}

		const mipmap = res48.mipMaps![mipmapLvl];
		if (!mipmap) {
			//TODO: show error
			return;
		}

		//glContext.bindTexture(GL_TEXTURE_CUBE_MAP, texture);
		//glContext.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

		const clampS = this.#getClampS();//(this.flags & TEXTUREFLAGS_CLAMPS) == TEXTUREFLAGS_CLAMPS;
		const clampT = this.#getClampT();//(this.flags & TEXTUREFLAGS_CLAMPT) == TEXTUREFLAGS_CLAMPT;


		const data0 = mipmap.frames[frame]?.[0];
		const data1 = mipmap.frames[frame]?.[1];
		const data2 = mipmap.frames[frame]?.[2];
		const data3 = mipmap.frames[frame]?.[3];
		const data4 = mipmap.frames[frame]?.[4];
		const data5 = mipmap.frames[frame]?.[5];

		if (data0 && data1 && data2 && data3 && data4 && data5) {
			if (Graphics.isWebGPU) {
				this.#fillCubeMapTextureWebGPU(texture, mipmap.width, mipmap.height, srgb, clampS, clampT, mipmap.frames[frame] as CubeMapDatas);
			} else {
				this.#fillCubeMapTextureWebGL(glContext, texture.texture, mipmap.width, mipmap.height, srgb, clampS, clampT, mipmap.frames[frame] as CubeMapDatas);
			}
			/*
			if (this.isDxtCompressed()) {
				const isSRGB = srgb && this.isSRGB();
				const st3cFormat = vtfToImageFormat(this.highResImageFormat) as ImageFormatS3tc;
				fillTextureDxt(glContext, texture, GL_TEXTURE_CUBE_MAP_POSITIVE_X, mipmap.width, mipmap.height, st3cFormat, data0, clampS, clampT, isSRGB);
				fillTextureDxt(glContext, texture, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, mipmap.width, mipmap.height, st3cFormat, data1, clampS, clampT, isSRGB);
				fillTextureDxt(glContext, texture, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, mipmap.width, mipmap.height, st3cFormat, data2, clampS, clampT, isSRGB);
				fillTextureDxt(glContext, texture, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, mipmap.width, mipmap.height, st3cFormat, data3, clampS, clampT, isSRGB);
				fillTextureDxt(glContext, texture, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, mipmap.width, mipmap.height, st3cFormat, data4, clampS, clampT, isSRGB);
				fillTextureDxt(glContext, texture, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, mipmap.width, mipmap.height, st3cFormat, data5, clampS, clampT, isSRGB);
			} else {
				glContext.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
				glContext.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, this.#getInternalFormat(srgb), mipmap.width, mipmap.height, 0, this.getFormat(), this.getType(), data0);
				glContext.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, this.#getInternalFormat(srgb), mipmap.width, mipmap.height, 0, this.getFormat(), this.getType(), data1);
				glContext.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, this.#getInternalFormat(srgb), mipmap.width, mipmap.height, 0, this.getFormat(), this.getType(), data2);
				glContext.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, this.#getInternalFormat(srgb), mipmap.width, mipmap.height, 0, this.getFormat(), this.getType(), data3);
				glContext.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, this.#getInternalFormat(srgb), mipmap.width, mipmap.height, 0, this.getFormat(), this.getType(), data4);
				glContext.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, this.#getInternalFormat(srgb), mipmap.width, mipmap.height, 0, this.getFormat(), this.getType(), data5);
			}
			*/
		}
		/*
		glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, clampS ? GL_CLAMP_TO_EDGE : GL_REPEAT);
		glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, clampT ? GL_CLAMP_TO_EDGE : GL_REPEAT);
		glContext.bindTexture(GL_TEXTURE_CUBE_MAP, null);
		*/

		//this.filled = true;
	}

	#fillCubeMapTextureWebGL(glContext: WebGLAnyRenderingContext, texture: WebGLTexture | null, width: number, height: number, srgb: boolean, clampS: boolean, clampT: boolean, data: CubeMapDatas): void {

		glContext.bindTexture(GL_TEXTURE_CUBE_MAP, texture);
		glContext.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

		if (this.isDxtCompressed()) {
			const isSRGB = srgb && this.isSRGB();
			const st3cFormat = vtfToImageFormat(this.highResImageFormat) as ImageFormatS3tc;
			fillTextureDxt(glContext, texture, GL_TEXTURE_CUBE_MAP_POSITIVE_X, width, height, st3cFormat, data[0], clampS, clampT, isSRGB);
			fillTextureDxt(glContext, texture, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, width, height, st3cFormat, data[1], clampS, clampT, isSRGB);
			fillTextureDxt(glContext, texture, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, width, height, st3cFormat, data[2], clampS, clampT, isSRGB);
			fillTextureDxt(glContext, texture, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, width, height, st3cFormat, data[3], clampS, clampT, isSRGB);
			fillTextureDxt(glContext, texture, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, width, height, st3cFormat, data[4], clampS, clampT, isSRGB);
			fillTextureDxt(glContext, texture, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, width, height, st3cFormat, data[5], clampS, clampT, isSRGB);
		} else {
			glContext.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
			glContext.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, this.#getInternalFormat(srgb), width, height, 0, this.getFormat(), this.getType(), data[0]);
			glContext.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, this.#getInternalFormat(srgb), width, height, 0, this.getFormat(), this.getType(), data[1]);
			glContext.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, this.#getInternalFormat(srgb), width, height, 0, this.getFormat(), this.getType(), data[2]);
			glContext.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, this.#getInternalFormat(srgb), width, height, 0, this.getFormat(), this.getType(), data[3]);
			glContext.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, this.#getInternalFormat(srgb), width, height, 0, this.getFormat(), this.getType(), data[4]);
			glContext.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, this.#getInternalFormat(srgb), width, height, 0, this.getFormat(), this.getType(), data[5]);
		}

		glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, clampS ? GL_CLAMP_TO_EDGE : GL_REPEAT);
		glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, clampT ? GL_CLAMP_TO_EDGE : GL_REPEAT);
		glContext.bindTexture(GL_TEXTURE_CUBE_MAP, null);

		//this.filled = true;
	}

	#fillCubeMapTextureWebGPU(texture: Texture, width: number, height: number, srgb: boolean, clampS: boolean, clampT: boolean, data: CubeMapDatas): void {
		//		#fillTextureWebGPU(glContext: WebGLAnyRenderingContext, texture: Texture, width: number, height: number, srgb: boolean, clampS: boolean, clampT: boolean, data: Uint8Array | Float32Array): void {
		for (let i = 0; i < 6; ++i) {
			WebGPUInternal.device.queue.writeTexture(
				{ texture: texture.texture as GPUTexture, origin: [0, 0, i] },
				this.#getWebGPUData(data[i]!) as BufferSource,
				{ bytesPerRow: this.#getWebGPUBytesPerRow(width) },
				{ width: width, height: height },
			);
		}
		WebGPUInternal.device.queue.submit([]);
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

	async getImageData(mipmap?: number, frame = 0, face = 0): Promise<ImageData | null> {
		frame = Math.round(frame) % this.frames;

		const highResDatas = this.getResource(VTF_ENTRY_IMAGE_DATAS);
		if (!highResDatas) {
			return null;
		}

		if (mipmap == undefined) {
			mipmap = this.mipmapCount - 1;
		} else {
			mipmap = Math.min(mipmap, this.mipmapCount - 1);
		}

		const mipmapDatas = highResDatas.mipMaps![mipmap];
		if (!mipmapDatas) {
			return null;
		}

		let datas: Uint8ClampedArray<ArrayBuffer>;
		const mipmapWidth = mipmapDatas.width;
		const mipmapHeight = mipmapDatas.height;
		const mipmapFaceDatas = mipmapDatas.frames[frame]?.[face];
		if (!mipmapFaceDatas) {
			return null;
		}
		if (this.isDxtCompressed()) {
			datas = await decompressDxt(vtfToImageFormat(this.highResImageFormat) as ImageFormatS3tc, mipmapWidth, mipmapHeight, mipmapFaceDatas);
		} else {
			datas = new Uint8ClampedArray(mipmapWidth * mipmapHeight * 4);
			datas.set(this.#getWebGPUData(mipmapFaceDatas));
		}

		return new ImageData(datas, mipmapWidth, mipmapHeight);
	}

	getWebGPUFormat(allowSrgb: boolean): GPUTextureFormat {
		// TODO: fix the format: add bc3 / bc5 , srgb, non rgba...

		const srgb = allowSrgb && this.isSRGB();

		if (this.isDxtCompressed()) {
			switch (this.highResImageFormat) {
				case IMAGE_FORMAT_DXT1:
					return srgb ? 'bc1-rgba-unorm-srgb' : 'bc1-rgba-unorm';
				case IMAGE_FORMAT_DXT3:
					return srgb ? 'bc2-rgba-unorm-srgb' : 'bc2-rgba-unorm';
				case IMAGE_FORMAT_DXT5:
					return srgb ? 'bc3-rgba-unorm-srgb' : 'bc3-rgba-unorm';
				default:
					errorOnce('WebGPU: unknown vtf format ' + this.highResImageFormat);
					return 'bc3-rgba-unorm';
			}
		} else {
			return srgb ? 'rgba8unorm-srgb' : 'rgba8unorm';
		}
	}

	#getWebGPUBytesPerRow(width: number): number {
		// TODO: fix the format: add bc3 / bc5 , srgb, non rgba...
		// TODO: set up a map to do that
		switch (this.highResImageFormat) {
			case IMAGE_FORMAT_RGBA16161616F:
			case IMAGE_FORMAT_RGBA16161616:
				return width * 8;
			case IMAGE_FORMAT_RGBA8888:
			case IMAGE_FORMAT_ABGR8888:
			case IMAGE_FORMAT_ARGB8888:
			case IMAGE_FORMAT_BGRA8888:
			case IMAGE_FORMAT_BGRX8888:
			case IMAGE_FORMAT_UVWQ8888:
			case IMAGE_FORMAT_UVLX8888:
			// The following case are remapped to rgba, rgb doesn't exist in webgpu
			case IMAGE_FORMAT_RGB888:
			case IMAGE_FORMAT_BGR888:
			case IMAGE_FORMAT_RGB888_BLUESCREEN:
			case IMAGE_FORMAT_BGR888_BLUESCREEN:
				return width * 4;
			case IMAGE_FORMAT_BGRX5551:
				return width * 3;
			case IMAGE_FORMAT_IA88:
			case IMAGE_FORMAT_RGB565:
			case IMAGE_FORMAT_BGR565:
			case IMAGE_FORMAT_BGRA4444:
			case IMAGE_FORMAT_BGRA5551:
			case IMAGE_FORMAT_UV88:
				return width * 2;
			case IMAGE_FORMAT_A8:
			case IMAGE_FORMAT_I8:
			case IMAGE_FORMAT_P8:
				return width;
			case IMAGE_FORMAT_DXT1:
			case IMAGE_FORMAT_DXT1_ONEBITALPHA:
				return width * 2;
			case IMAGE_FORMAT_DXT3:
				// TODO: check the result
				return width;
			case IMAGE_FORMAT_DXT5:
				// TODO: check the result
				return width * 4;
			default:
				errorOnce('WebGPU: unknown vtf format ' + this.highResImageFormat);
				return width * 4;
		}
	}

	#getWebGPUData(data: Uint8Array | Float32Array): Uint8Array | Float32Array {
		switch (this.highResImageFormat) {
			case IMAGE_FORMAT_RGB888:
			case IMAGE_FORMAT_BGR888:
			case IMAGE_FORMAT_RGB565:
			case IMAGE_FORMAT_RGB888_BLUESCREEN:
			case IMAGE_FORMAT_BGR888_BLUESCREEN:
				let rgba: Uint8Array | Float32Array;
				if (data instanceof Uint8Array) {
					rgba = new Uint8Array(data.length * 4 / 3);
				} else {
					rgba = new Float32Array(data.length * 4 / 3);
				}

				let j = 0;
				for (let i = 0; i < data.length;) {
					rgba[j++] = data[i++]!;
					rgba[j++] = data[i++]!;
					rgba[j++] = data[i++]!;
					rgba[j++] = 1.0;
				}
				return rgba;
			default:
				return data;
		}
	}

	#getClampS(): boolean {
		return (this.flags & TEXTUREFLAGS_CLAMPS) == TEXTUREFLAGS_CLAMPS;
	}

	#getClampT(): boolean {
		return (this.flags & TEXTUREFLAGS_CLAMPT) == TEXTUREFLAGS_CLAMPT;
	}

	getAddressModeU(): GPUAddressMode {
		return this.#getClampS() ? 'clamp-to-edge' : 'repeat';
	}

	getAddressModeV(): GPUAddressMode {
		return this.#getClampT() ? 'clamp-to-edge' : 'repeat';
	}
}


// TODO: remove thses consts
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


// TODO: move this function elsewhere
export async function decompressDxt(format: ImageFormatS3tc | ImageFormatRgtc | ImageFormatBptc, width: number, height: number, datas: Uint8Array | Float32Array): Promise<Uint8ClampedArray<ArrayBuffer>> {
	const uncompressedData = new Uint8ClampedArray(width * height * 4);

	await (Detex as any).decode(format, width, height, datas, uncompressedData);

	return uncompressedData;
}

function fillTextureDxt(glContext: WebGLAnyRenderingContext, texture: WebGLTexture | null, target: GLenum, width: number, height: number, dxtLevel: ImageFormatS3tc, datas: Uint8Array | Float32Array, clampS: boolean, clampT: boolean, srgb: boolean): void {//removeme
	const s3tc = Graphics.getExtension('WEBGL_compressed_texture_s3tc');
	const s3tcSRGB = Graphics.getExtension('WEBGL_compressed_texture_s3tc_srgb');

	glContext.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
	//glContext.bindTexture(target, texture);

	if (ENABLE_S3TC && s3tc) {
		let dxtFormat = 0;
		switch (dxtLevel) {
			case ImageFormat.Bc1: dxtFormat = srgb ? s3tcSRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT : s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT; break;
			case ImageFormat.Bc2: dxtFormat = srgb ? s3tcSRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT : s3tc.COMPRESSED_RGBA_S3TC_DXT3_EXT; break;
			case ImageFormat.Bc3: dxtFormat = srgb ? s3tcSRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT : s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT; break;
		}
		glContext.compressedTexImage2D(target, 0, dxtFormat, width, height, 0, datas);
	} else {
		glContext.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);

		(async () => {
			const uncompressedData = await decompressDxt(dxtLevel, width, height, datas);//new Uint8Array(width * height * 4);
			glContext.bindTexture(GL_TEXTURE_2D, texture);
			glContext.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, uncompressedData);//TODO: params
			glContext.bindTexture(GL_TEXTURE_2D, null);
		})()

		/*
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
		*/
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

function vtfToImageFormat(vtfImageFormat: number): ImageFormat {
	switch (vtfImageFormat) {
		case IMAGE_FORMAT_DXT1:
			return ImageFormat.Bc1;
		case IMAGE_FORMAT_DXT3:
			return ImageFormat.Bc2;
		case IMAGE_FORMAT_DXT5:
			return ImageFormat.Bc3;
		default:
			console.error('missing image format ' + vtfImageFormat)
		//TODO: populate
	}
	return ImageFormat.Unknown;
}
