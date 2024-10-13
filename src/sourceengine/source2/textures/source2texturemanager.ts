import { Detex } from '../../../textures/detex';
import { Source2TextureLoader } from '../loaders/source2textureloader';
import { TEXTURE_FORMAT_UNCOMPRESSED, TEXTURE_FORMAT_COMPRESSED_S3TC, TEXTURE_FORMAT_COMPRESSED_BPTC, TEXTURE_FORMAT_COMPRESSED_RGTC, TEXTURE_FORMAT_COMPRESSED_RGBA_DXT1, TEXTURE_FORMAT_COMPRESSED_RGBA_DXT3, TEXTURE_FORMAT_COMPRESSED_RGBA_DXT5, TEXTURE_FORMAT_UNCOMPRESSED_BGRA8888 } from '../../../textures/textureconstants';
import { TEXTURE_FORMAT_UNCOMPRESSED_RGBA, TEXTURE_FORMAT_UNCOMPRESSED_R8 } from '../../../textures/textureconstants';
import { GL_TEXTURE_CUBE_MAP_POSITIVE_X, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, GL_TEXTURE_CUBE_MAP } from '../../../webgl/constants';
import { Graphics } from '../../../graphics/graphics';
import { AnimatedTexture } from '../../../textures/animatedtexture';
import { TextureManager } from '../../../textures/texturemanager';
import { GL_TEXTURE_2D, GL_UNSIGNED_BYTE, GL_UNPACK_FLIP_Y_WEBGL, GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_RGBA, GL_R8, GL_RED, GL_LINEAR } from '../../../webgl/constants';
import { DEBUG, ENABLE_S3TC, TESTING } from '../../../buildoptions';
import { TEXTURE_CLEANUP_DELAY } from '../../../constants';
import { Texture } from '../../../textures/texture';
import { Source2SpriteSheet } from './source2spritesheet';

class Source2TextureManagerClass extends EventTarget {//TODO: keep event target ?
	#texturesList = new Map<string, AnimatedTexture>();
	#loadingTexturesList = new Map<string, Promise<AnimatedTexture>>();
	#defaultTexture;
	WEBGL_compressed_texture_s3tc;
	EXT_texture_compression_bptc;
	EXT_texture_compression_rgtc;
	constructor() {
		super();

		Graphics.ready.then(() => {
			this.#defaultTexture = TextureManager.createCheckerTexture([127, 190, 255]);
			this.#defaultTexture.addUser(this);
			//this._missingTexture = TextureManager.createCheckerTexture();
			this.WEBGL_compressed_texture_s3tc = Graphics.getExtension('WEBGL_compressed_texture_s3tc');
			this.EXT_texture_compression_bptc = Graphics.getExtension('EXT_texture_compression_bptc');
			this.EXT_texture_compression_rgtc = Graphics.getExtension('EXT_texture_compression_rgtc');
		});

		setInterval(() => this.#cleanup(), TEXTURE_CLEANUP_DELAY);
	}

	async getTexture(repository, path, frame) {
		frame = Math.floor(frame);
		let texture = await this.#getTexture(repository, path);
		return texture ? texture.getFrame(frame) : this.#defaultTexture;//TODOv3
	}

	async getTextureSheet(repository: string, path: string): Promise<Source2SpriteSheet | undefined> {
		let texture = await this.#getTexture(repository, path);
		return texture?.properties.get('vtex')?.getBlockByType('DATA')?.spriteSheet;
	}

	async #getTexture(repository, path): Promise<AnimatedTexture> {
		path = path.replace(/.vtex_c$/, '').replace(/.vtex$/, '');
		path = path + '.vtex_c';
		let fullPath = repository + path;

		if (this.#loadingTexturesList.has(fullPath)) {
			await this.#loadingTexturesList.get(fullPath);
		}

		if (!this.#texturesList.has(fullPath)) {
			const animatedTexture = new AnimatedTexture();
			let promise = new Promise<AnimatedTexture>(async (resolve, reject) => {
				let vtex = await Source2TextureLoader.load(repository, path);
				animatedTexture.properties.set('vtex', vtex);
				let texture = TextureManager.createTexture();//TODOv3: add params
				this.#initTexture(texture.texture, vtex);
				animatedTexture.addFrame(0, texture);
				resolve(animatedTexture);
			});
			this.#loadingTexturesList.set(fullPath, promise);
			await promise;
			this.setTexture(fullPath, animatedTexture);
			this.#loadingTexturesList.delete(fullPath);

		}
		return this.#texturesList.get(fullPath);
	}

	setTexture(path, texture) {
		this.#texturesList.set(path, texture);
	}

	#initTexture(texture, vtexFile) {
		if (!texture) {
			return;
		}
		var imageData = vtexFile.blocks.DATA.imageData;
		let imageFormat = vtexFile.imageFormat;
		if (imageData) {
			if (vtexFile.isCubeTexture()) {
				this.#initCubeTexture(texture, imageFormat, vtexFile.getWidth(), vtexFile.getHeight(), imageData);
			} else {
				this.#initFlatTexture(texture, imageFormat, vtexFile.getWidth(), vtexFile.getHeight(), imageData);
				/*if (imageFormat & TEXTURE_FORMAT_COMPRESSED_S3TC) {
					this.fillTextureDxt(texture, vtexFile.getWidth(), vtexFile.getHeight(), vtexFile.getDxtLevel(), imageData[0]);
				} else {
					this.fillTexture(texture, vtexFile.getWidth(), vtexFile.getHeight(), imageData[0]);
				}*/
			}
			//Graphics.glContext.bindTexture(GL_TEXTURE_2D, null);
		}
	}

	#initCubeTexture(texture, imageFormat, width, height, imageData) {
		const glContext = Graphics.glContext;
		glContext.bindTexture(GL_TEXTURE_CUBE_MAP, texture);
		switch (true) {
			case (imageFormat & TEXTURE_FORMAT_UNCOMPRESSED) == TEXTURE_FORMAT_UNCOMPRESSED:
				this.fillTexture(texture, imageFormat, width, height, imageData[0], GL_TEXTURE_CUBE_MAP_POSITIVE_X);
				this.fillTexture(texture, imageFormat, width, height, imageData[1], GL_TEXTURE_CUBE_MAP_NEGATIVE_X);
				this.fillTexture(texture, imageFormat, width, height, imageData[2], GL_TEXTURE_CUBE_MAP_POSITIVE_Y);
				this.fillTexture(texture, imageFormat, width, height, imageData[3], GL_TEXTURE_CUBE_MAP_NEGATIVE_Y);
				this.fillTexture(texture, imageFormat, width, height, imageData[4], GL_TEXTURE_CUBE_MAP_POSITIVE_Z);
				this.fillTexture(texture, imageFormat, width, height, imageData[5], GL_TEXTURE_CUBE_MAP_NEGATIVE_Z);
				break;
			case (imageFormat & TEXTURE_FORMAT_COMPRESSED_S3TC) == TEXTURE_FORMAT_COMPRESSED_S3TC:
				this.fillTextureDxt(texture, imageFormat, width, height, imageData[0], GL_TEXTURE_CUBE_MAP_POSITIVE_X);
				this.fillTextureDxt(texture, imageFormat, width, height, imageData[1], GL_TEXTURE_CUBE_MAP_NEGATIVE_X);
				this.fillTextureDxt(texture, imageFormat, width, height, imageData[2], GL_TEXTURE_CUBE_MAP_POSITIVE_Y);
				this.fillTextureDxt(texture, imageFormat, width, height, imageData[3], GL_TEXTURE_CUBE_MAP_NEGATIVE_Y);
				this.fillTextureDxt(texture, imageFormat, width, height, imageData[4], GL_TEXTURE_CUBE_MAP_POSITIVE_Z);
				this.fillTextureDxt(texture, imageFormat, width, height, imageData[5], GL_TEXTURE_CUBE_MAP_NEGATIVE_Z);
				break;
			case (imageFormat & TEXTURE_FORMAT_COMPRESSED_BPTC) == TEXTURE_FORMAT_COMPRESSED_BPTC:
				throw 'TODO';
				this.#fillTextureBptc(texture, width, height, imageFormat, imageData[0]);
				break;
			case (imageFormat & TEXTURE_FORMAT_COMPRESSED_RGTC) == TEXTURE_FORMAT_COMPRESSED_RGTC:
				throw 'TODO';
				this.#fillTextureRgtc(texture, width, height, imageFormat, imageData[0]);
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

	#initFlatTexture(texture, imageFormat, width, height, imageData) {
		const glContext = Graphics.glContext;
		if (TESTING) {
			Graphics.cleanupGLError();
		}
		glContext.bindTexture(GL_TEXTURE_2D, texture);
		if (TESTING) {
			Graphics.getGLError('bindTexture in fill source2 fillTexture');
		}
		switch (true) {
			case (imageFormat & TEXTURE_FORMAT_UNCOMPRESSED) == TEXTURE_FORMAT_UNCOMPRESSED:
				this.fillTexture(texture, imageFormat, width, height, imageData[0], GL_TEXTURE_2D);
				break;
			case (imageFormat & TEXTURE_FORMAT_COMPRESSED_S3TC) == TEXTURE_FORMAT_COMPRESSED_S3TC:
				this.fillTextureDxt(texture, imageFormat, width, height, imageData[0], GL_TEXTURE_2D);
				break;
			case (imageFormat & TEXTURE_FORMAT_COMPRESSED_BPTC) == TEXTURE_FORMAT_COMPRESSED_BPTC:
				this.#fillTextureBptc(texture, width, height, imageFormat, imageData[0]);
				break;
			case (imageFormat & TEXTURE_FORMAT_COMPRESSED_RGTC) == TEXTURE_FORMAT_COMPRESSED_RGTC:
				this.#fillTextureRgtc(texture, width, height, imageFormat, imageData[0]);
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

	fillTexture(texture, imageFormat, width, height, datas, target) {
		const gl = Graphics.glContext;
		gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);

		switch (imageFormat) {
			case TEXTURE_FORMAT_UNCOMPRESSED_RGBA:
			case TEXTURE_FORMAT_UNCOMPRESSED_BGRA8888:
				gl.texImage2D(target, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, datas);//TODO: params
				break;
			case TEXTURE_FORMAT_UNCOMPRESSED_R8:
				gl.texImage2D(target, 0, GL_R8, width, height, 0, GL_RED, GL_UNSIGNED_BYTE, datas);//TODO: params
				break;
			default:
				if (DEBUG) {
					console.error('Unknown texture format ' + imageFormat);
				}
		}
		gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
	}

	fillTextureDxt(texture, imageFormat, width, height, datas, target) {
		var gl = Graphics.glContext;
		var s3tc = this.WEBGL_compressed_texture_s3tc;//gl.getExtension("WEBGL_compressed_texture_s3tc");//TODO: store it

		gl.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

		if (ENABLE_S3TC && s3tc) {
			gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, true);
			var dxtFormat = 0;
			switch (imageFormat) {
				case TEXTURE_FORMAT_COMPRESSED_RGBA_DXT1: dxtFormat = s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT; break;
				case TEXTURE_FORMAT_COMPRESSED_RGBA_DXT3: dxtFormat = s3tc.COMPRESSED_RGBA_S3TC_DXT3_EXT; break;
				case TEXTURE_FORMAT_COMPRESSED_RGBA_DXT5: dxtFormat = s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT; break;
			}

			gl.bindTexture(target, texture);
			gl.compressedTexImage2D(target, 0, dxtFormat, width, height, 0, datas);
		} else {
			/*gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
			var dxtflag = dxtLevel == 1 ? (1 << 0) : (1 << 2);
			var uncompressedData = decompress(datas, width, height, dxtflag);
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, uncompressedData);//TODO: params*/
			gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
			let uncompressedData = new Uint8Array(width * height * 4);

			let decompressFunc = null;
			switch (imageFormat) {
				case TEXTURE_FORMAT_COMPRESSED_RGBA_DXT1: decompressFunc = 'decodeBC1'; break;
				case TEXTURE_FORMAT_COMPRESSED_RGBA_DXT3: decompressFunc = 'decodeBC2'; break;
				case TEXTURE_FORMAT_COMPRESSED_RGBA_DXT5: decompressFunc = 'decodeBC3'; break;
			}
			if (decompressFunc) {
				Detex[decompressFunc](width, height, datas, uncompressedData).then(
					() => {
						gl.bindTexture(GL_TEXTURE_2D, texture);
						gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, uncompressedData);//TODO: params
						gl.bindTexture(GL_TEXTURE_2D, null);
					}
				);
			}
		}
		gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
	}
	#fillTextureBptc(texture, width, height, imageFormat, datas) {
		var gl = Graphics.glContext;
		var bptc = this.EXT_texture_compression_bptc;

		gl.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		gl.bindTexture(GL_TEXTURE_2D, texture);

		if (bptc) {
			gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, true);
			var bptcFormat = bptc.COMPRESSED_RGBA_BPTC_UNORM_EXT;//COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT;
			gl.compressedTexImage2D(GL_TEXTURE_2D, 0, bptcFormat, width, height, 0, datas);
		} else {
			gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
			let uncompressedData = new Uint8Array(width * height * 4);
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
	#fillTextureRgtc(texture, width, height, imageFormat, datas) {
		var gl = Graphics.glContext;
		var rgtc = this.EXT_texture_compression_rgtc;

		gl.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		gl.bindTexture(GL_TEXTURE_2D, texture);

		if (rgtc) {
			gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, true);
			var bptcFormat = rgtc.COMPRESSED_RED_RGTC1_EXT;//COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT;
			gl.compressedTexImage2D(GL_TEXTURE_2D, 0, bptcFormat, width, height, 0, datas);
		} else {
			gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
			let uncompressedData = new Uint8Array(width * height * 4);
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
