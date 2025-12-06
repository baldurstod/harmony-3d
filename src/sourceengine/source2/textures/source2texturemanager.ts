import { Map2 } from 'harmony-utils';
import { DEBUG, ENABLE_S3TC, TESTING } from '../../../buildoptions';
import { TEXTURE_CLEANUP_DELAY } from '../../../constants';
import { Color } from '../../../core/color';
import { Graphics } from '../../../graphics/graphics2';
import { AnimatedTexture } from '../../../textures/animatedtexture';
import { Detex } from '../../../textures/detex';
import { formatCompression, ImageFormat, TextureCompressionMethod } from '../../../textures/enums';
import { SpriteSheet } from '../../../textures/spritesheet';
import { Texture } from '../../../textures/texture';
import { TextureManager } from '../../../textures/texturemanager';
import { GL_LINEAR, GL_R8, GL_RED, GL_RGBA, GL_TEXTURE_2D, GL_TEXTURE_CUBE_MAP, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, GL_TEXTURE_CUBE_MAP_POSITIVE_X, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_UNPACK_FLIP_Y_WEBGL, GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, GL_UNSIGNED_BYTE } from '../../../webgl/constants';
import { Source2VtexBlock } from '../loaders/source2fileblock';
import { Source2TextureLoader } from '../loaders/source2textureloader';
import { Source2Texture } from './source2texture';

class Source2TextureManagerClass {
	#vtexList = new Map2<string, string, Source2Texture>();
	#texturesList = new Map<string, AnimatedTexture>();
	#loadingTexturesList = new Map<string, Promise<AnimatedTexture>>();
	#defaultTexture!: Texture;
	WEBGL_compressed_texture_s3tc: any;
	EXT_texture_compression_bptc: any;
	EXT_texture_compression_rgtc: any;

	constructor() {
		Graphics.ready.then(() => {
			this.#defaultTexture = TextureManager.createCheckerTexture({
				webgpuDescriptor: {
					format: 'rgba8unorm',
					usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
				},
				color: new Color(0.5, 0.75, 1),
			});


			this.#defaultTexture.addUser(this);
			//this._missingTexture = TextureManager.createCheckerTexture();
			this.WEBGL_compressed_texture_s3tc = Graphics.getExtension('WEBGL_compressed_texture_s3tc');
			this.EXT_texture_compression_bptc = Graphics.getExtension('EXT_texture_compression_bptc');
			this.EXT_texture_compression_rgtc = Graphics.getExtension('EXT_texture_compression_rgtc');
		});

		setInterval(() => this.#cleanup(), TEXTURE_CLEANUP_DELAY);
	}

	async getTexture(repository: string, path: string, frame: number): Promise<Texture | null> {
		frame = Math.floor(frame);
		const texture = await this.#getTexture(repository, path);
		return texture ? texture.getFrame(frame) ?? null : this.#defaultTexture;//TODOv3
	}

	async getVtex(repository: string, path: string): Promise<Source2Texture | null> {
		// TODO: fix that concurent calls of the same texture will load it multiple times
		let vtex: Source2Texture | null | undefined = this.#vtexList.get(repository, path);
		if (vtex !== undefined) {
			return vtex;
		}

		vtex = await Source2TextureLoader.load(repository, path);
		if (vtex) {
			this.#vtexList.set(repository, path, vtex);
		}
		return vtex;
	}

	async getTextureSheet(repository: string, path: string): Promise<SpriteSheet | null> {
		const texture = await this.#getTexture(repository, path);
		return texture.properties.get('sprite_sheet') ?? null;
	}

	async #getTexture(repository: string, path: string): Promise<AnimatedTexture> {
		path = path.replace(/\.vtex_c$/, '').replace(/\.vtex$/, '');
		path = path + '.vtex_c';
		const fullPath = repository + path;

		if (this.#loadingTexturesList.has(fullPath)) {
			await this.#loadingTexturesList.get(fullPath);
		}

		if (!this.#texturesList.has(fullPath)) {
			const animatedTexture = new AnimatedTexture();
			const promise = new Promise<AnimatedTexture>(async resolve => {
				const vtex = await this.getVtex(repository, path);
				animatedTexture.properties.set('vtex', vtex);
				//const texture = TextureManager.createTexture();//TODOv3: add params
				const texture = TextureManager.createTexture({
					webgpuDescriptor: {
						size: {
							width: vtex?.getWidth()  ?? 1,
							height: vtex?.getHeight()  ?? 1,
						},
						format: 'rgba8unorm',
						usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
					}
				});//TODOv3: add params

				if (vtex) {
					this.#initTexture(texture, vtex);
					if (vtex.spriteSheet) {
						animatedTexture.properties.set('sprite_sheet', vtex.spriteSheet);
					}
				}
				animatedTexture.addFrame(0, texture);
				resolve(animatedTexture);
			});
			this.#loadingTexturesList.set(fullPath, promise);
			await promise;
			this.setTexture(fullPath, animatedTexture);
			this.#loadingTexturesList.delete(fullPath);

		}
		return this.#texturesList.get(fullPath)!;
	}

	setTexture(path: string, texture: AnimatedTexture) {
		this.#texturesList.set(path, texture);
	}

	#initTexture(texture: Texture, vtexFile: Source2Texture) {
		const imageData = (vtexFile.blocks.DATA as Source2VtexBlock).imageData;
		const imageFormat = vtexFile.getImageFormat();
		if (imageData) {
			if (vtexFile.isCubeTexture()) {
				this.#initCubeTexture(texture.texture!, imageFormat, vtexFile.getWidth(), vtexFile.getHeight(), imageData);
			} else {
				this.#initFlatTexture(texture.texture!, imageFormat, vtexFile.getWidth(), vtexFile.getHeight(), imageData);
				/*if (imageFormat & TEXTURE_FORMAT_COMPRESSED_S3TC) {
					this.fillTextureDxt(texture, vtexFile.getWidth(), vtexFile.getHeight(), vtexFile.getDxtLevel(), imageData[0]);
				} else {
					this.fillTexture(texture, vtexFile.getWidth(), vtexFile.getHeight(), imageData[0]);
				}*/
			}
			//Graphics.glContext.bindTexture(GL_TEXTURE_2D, null);
		}

		if (vtexFile.decodeNormalizeNormals()) {
			texture.defines.set('NORMALIZE_NORMALS', 'NORMALIZE_NORMALS');
		}
	}

	#initCubeTexture(texture: WebGLTexture, imageFormat: ImageFormat, width: number, height: number, imageData: [Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array]) {
		const glContext = Graphics.glContext;
		glContext.bindTexture(GL_TEXTURE_CUBE_MAP, texture);
		switch (formatCompression(imageFormat)) {
			case TextureCompressionMethod.Uncompressed:
				this.fillTexture(imageFormat, width, height, imageData[0], GL_TEXTURE_CUBE_MAP_POSITIVE_X);
				this.fillTexture(imageFormat, width, height, imageData[1], GL_TEXTURE_CUBE_MAP_NEGATIVE_X);
				this.fillTexture(imageFormat, width, height, imageData[2], GL_TEXTURE_CUBE_MAP_POSITIVE_Y);
				this.fillTexture(imageFormat, width, height, imageData[3], GL_TEXTURE_CUBE_MAP_NEGATIVE_Y);
				this.fillTexture(imageFormat, width, height, imageData[4], GL_TEXTURE_CUBE_MAP_POSITIVE_Z);
				this.fillTexture(imageFormat, width, height, imageData[5], GL_TEXTURE_CUBE_MAP_NEGATIVE_Z);
				break;
			case TextureCompressionMethod.St3c:
				this.fillTextureDxt(texture, imageFormat, width, height, imageData[0], GL_TEXTURE_CUBE_MAP_POSITIVE_X);
				this.fillTextureDxt(texture, imageFormat, width, height, imageData[1], GL_TEXTURE_CUBE_MAP_NEGATIVE_X);
				this.fillTextureDxt(texture, imageFormat, width, height, imageData[2], GL_TEXTURE_CUBE_MAP_POSITIVE_Y);
				this.fillTextureDxt(texture, imageFormat, width, height, imageData[3], GL_TEXTURE_CUBE_MAP_NEGATIVE_Y);
				this.fillTextureDxt(texture, imageFormat, width, height, imageData[4], GL_TEXTURE_CUBE_MAP_POSITIVE_Z);
				this.fillTextureDxt(texture, imageFormat, width, height, imageData[5], GL_TEXTURE_CUBE_MAP_NEGATIVE_Z);
				break;
			case TextureCompressionMethod.Bptc:
				throw 'TODO';
				this.#fillTextureBptc(texture, width, height, imageData[0]);
				break;
			case TextureCompressionMethod.Rgtc:
				throw 'TODO';
				this.#fillTextureRgtc(texture, width, height, imageData[0]);
				break;
			default:
				if (DEBUG) {
					console.error('Unknown texture format ' + imageFormat);
				}
		}
		glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		//glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, clampS ? GL_CLAMP_TO_EDGE : GL_REPEAT);
		//glContext.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, clampT ? GL_CLAMP_TO_EDGE : GL_REPEAT);
		glContext.bindTexture(GL_TEXTURE_CUBE_MAP, null);
	}

	#initFlatTexture(texture: WebGLTexture, imageFormat: ImageFormat, width: number, height: number, imageData: [Uint8Array]): void {
		const glContext = Graphics.glContext;
		if (TESTING) {
			Graphics.cleanupGLError();
		}
		glContext.bindTexture(GL_TEXTURE_2D, texture);
		if (TESTING) {
			Graphics.getGLError('bindTexture in fill source2 fillTexture');
		}
		switch (formatCompression(imageFormat)) {
			case TextureCompressionMethod.Uncompressed:
				this.fillTexture(imageFormat, width, height, imageData[0], GL_TEXTURE_2D);
				break;
			case TextureCompressionMethod.St3c:
				this.fillTextureDxt(texture, imageFormat, width, height, imageData[0], GL_TEXTURE_2D);
				break;
			case TextureCompressionMethod.Bptc:
				this.#fillTextureBptc(texture, width, height, imageData[0]);
				break;
			case TextureCompressionMethod.Rgtc:
				this.#fillTextureRgtc(texture, width, height, imageData[0]);
				break;
			default:
				if (DEBUG) {
					console.error('Unknown texture format ' + imageFormat);
				}
		}
		//glContext.bindTexture(GL_TEXTURE_2D, texture);
		glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glContext.bindTexture(GL_TEXTURE_2D, null);
	}

	fillTexture(imageFormat: ImageFormat, width: number, height: number, datas: ArrayBufferView | null, target: GLenum) {
		const gl = Graphics.glContext;
		gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);

		switch (imageFormat) {
			case ImageFormat.RGBA:
			case ImageFormat.BGRA8888:
				gl.texImage2D(target, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, datas);//TODO: params
				break;
			case ImageFormat.R8:
				gl.texImage2D(target, 0, GL_R8, width, height, 0, GL_RED, GL_UNSIGNED_BYTE, datas);//TODO: params
				break;
			default:
				if (DEBUG) {
					console.error('Unknown texture format ' + imageFormat);
				}
		}
		gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
	}

	fillTextureDxt(texture: WebGLTexture, imageFormat: ImageFormat, width: number, height: number, datas: Uint8Array, target: GLenum) {
		const gl = Graphics.glContext;
		const s3tc = this.WEBGL_compressed_texture_s3tc;//gl.getExtension("WEBGL_compressed_texture_s3tc");//TODO: store it

		gl.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

		if (ENABLE_S3TC && s3tc) {
			gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, true);
			let dxtFormat = 0;
			switch (imageFormat) {
				case ImageFormat.Bc1:
					dxtFormat = s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT;
					break;
				case ImageFormat.Bc2:
					dxtFormat = s3tc.COMPRESSED_RGBA_S3TC_DXT3_EXT;
					break;
				case ImageFormat.Bc3:
					dxtFormat = s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT;
					break;
			}

			//gl.bindTexture(target, texture);
			gl.compressedTexImage2D(target, 0, dxtFormat, width, height, 0, datas);
		} else {
			/*gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
			var dxtflag = dxtLevel == 1 ? (1 << 0) : (1 << 2);
			var uncompressedData = decompress(datas, width, height, dxtflag);
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, uncompressedData);//TODO: params*/
			gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
			const uncompressedData = new Uint8Array(width * height * 4);

			Detex.decode(imageFormat, width, height, datas, uncompressedData).then(
				() => {
					// TODO: fix target in the 3 lines below
					gl.bindTexture(GL_TEXTURE_2D, texture);
					gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, uncompressedData);//TODO: params
					gl.bindTexture(GL_TEXTURE_2D, null);
				}
			);
		}
		gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
	}

	#fillTextureBptc(texture: WebGLTexture, width: number, height: number, datas: Uint8Array) {
		const gl = Graphics.glContext;
		const bptc = this.EXT_texture_compression_bptc;

		gl.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		gl.bindTexture(GL_TEXTURE_2D, texture);

		if (bptc) {
			gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, true);
			const bptcFormat = bptc.COMPRESSED_RGBA_BPTC_UNORM_EXT;//COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT;
			gl.compressedTexImage2D(GL_TEXTURE_2D, 0, bptcFormat, width, height, 0, datas);
		} else {
			gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
			const uncompressedData = new Uint8Array(width * height * 4);
			Detex.decodeBC7(width, height, datas, uncompressedData).then(
				() => {
					gl.bindTexture(GL_TEXTURE_2D, texture);
					gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, uncompressedData);//TODO: params
					gl.bindTexture(GL_TEXTURE_2D, null);
				}
			);
		}

		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		Graphics.getGLError('texParameteri');
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		Graphics.getGLError('texParameteri');
		//gl.texParameteri(GL_TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		//gl.texParameteri(GL_TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		//gl.bindTexture(GL_TEXTURE_2D, null);
		gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
	}

	#fillTextureRgtc(texture: WebGLTexture, width: number, height: number, datas: Uint8Array) {
		const gl = Graphics.glContext;
		const rgtc = this.EXT_texture_compression_rgtc;

		gl.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		gl.bindTexture(GL_TEXTURE_2D, texture);

		if (rgtc) {
			gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, true);
			const bptcFormat = rgtc.COMPRESSED_RED_RGTC1_EXT;//COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT;
			gl.compressedTexImage2D(GL_TEXTURE_2D, 0, bptcFormat, width, height, 0, datas);
		} else {
			gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
			const uncompressedData = new Uint8Array(width * height * 4);
			Detex.decodeBC4(width, height, datas, uncompressedData).then(
				() => {
					gl.bindTexture(GL_TEXTURE_2D, texture);
					gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, uncompressedData);//TODO: params
					gl.bindTexture(GL_TEXTURE_2D, null);
				}
			);
		}

		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		//gl.texParameteri(GL_TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		//gl.texParameteri(GL_TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
	}

	#cleanup() {
		for (const [texturePath, texture] of this.#texturesList) {
			if (texture.hasOnlyUser(this)) {
				texture.removeUser(this);
				this.#texturesList.delete(texturePath);
			}
		}
	}
}

export const Source2TextureManager = new Source2TextureManagerClass();
