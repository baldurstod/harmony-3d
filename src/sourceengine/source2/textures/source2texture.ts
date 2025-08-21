import { decode } from 'fast-png';
import { vec2 } from 'gl-matrix';
import { formatCompression, ImageFormat, ImageFormatS3tc, TextureCompressionMethod } from '../../../textures/enums';
import { decompressDxt } from '../../source1/textures/sourceenginevtf';
import { VTEX_FLAG_CUBE_TEXTURE } from '../constants';
import { Source2File } from '../loaders/source2file';
import { Source2VtexBlock } from '../loaders/source2fileblock';

const TEXTURE_COMPILER = 'CompileTexture';
const TEXTURE_YCOCG = 'Texture Compiler Version Image YCoCg Conversion';
const TEXTURE_NORMALIZED_NORMALS = 'Texture Compiler Version Image NormalizeNormals';

export enum VtexImageFormat {
	Unknown = 0,
	Dxt1 = 1,
	Dxt5 = 2,
	R8 = 3,
	R8G8B8A8Uint = 4,
	PngR8G8B8A8Uint = 16,
	PngDXT5 = 18,
	Bc7 = 20,
	Bc5 = 21,
	Bc4 = 27,
	BGRA8888 = 28,
}

export enum TextureCodec {
	YCoCg = 1,
	NormalizeNormals = 2,
}

export class Source2Texture extends Source2File {
	#vtexImageFormat: VtexImageFormat = VtexImageFormat.Unknown;// original image format
	#compressionMethod = TextureCompressionMethod.Uncompressed;// TODO: remove
	#imageFormat = ImageFormat.Unknown;
	#codecs: number = 0;

	constructor(repository: string, path: string) {
		super(repository, path);
	}

	getAlphaBits(): number {
		return 8;//TODO: fix that
	}

	getWidth(): number {
		const block = this.blocks.DATA as Source2VtexBlock;
		if (!block) {
			return 0;
		}
		return block.width;
	}

	getHeight(): number {
		const block = this.blocks.DATA as Source2VtexBlock;
		if (!block) {
			return 0;
		}
		return block.height;
	}

	getDxtLevel(): number {
		const block = this.blocks.DATA as Source2VtexBlock;
		if (!block) {
			return 0;
		}

		switch (this.#vtexImageFormat) {
			case 1://TODO DXT1
				return 1;
			case 2://TODO DXT5
				return 5;
		}
		return 0;
	}

	isCompressed(): boolean {
		const block = this.blocks.DATA as Source2VtexBlock;
		if (!block) {
			return false;
		}

		return this.#vtexImageFormat <= 2;//DXT1 or DXT5
	}

	isCubeTexture(): boolean {
		const block = this.blocks.DATA as Source2VtexBlock;
		if (!block) {
			return false;
		}

		return (block.flags & VTEX_FLAG_CUBE_TEXTURE) == VTEX_FLAG_CUBE_TEXTURE;
	}

	setImageFormat(imageFormat: VtexImageFormat): void {
		this.#vtexImageFormat = imageFormat;

		// TODO: improve code
		switch (imageFormat) {
			case VtexImageFormat.Dxt1:
				this.#compressionMethod = TextureCompressionMethod.St3c;
				this.#imageFormat = ImageFormat.Bc1;
				break;
			case VtexImageFormat.Dxt5:
				this.#compressionMethod = TextureCompressionMethod.St3c;
				this.#imageFormat = ImageFormat.Bc3;
				break;
			case VtexImageFormat.R8:
				this.#compressionMethod = TextureCompressionMethod.Uncompressed;
				this.#imageFormat = ImageFormat.R8;
				break;
			case VtexImageFormat.Bc4:
				this.#compressionMethod = TextureCompressionMethod.Bptc;
				this.#imageFormat = ImageFormat.Bc4;
				break;
			case VtexImageFormat.Bc5:
				this.#compressionMethod = TextureCompressionMethod.Bptc;
				this.#imageFormat = ImageFormat.Bc5;
				break;
			case VtexImageFormat.Bc7:
				this.#compressionMethod = TextureCompressionMethod.Bptc;
				this.#imageFormat = ImageFormat.Bc7;
				break;
			case VtexImageFormat.R8G8B8A8Uint:
				this.#compressionMethod = TextureCompressionMethod.Uncompressed;
				this.#imageFormat = ImageFormat.R8G8B8A8Uint;
				break;
			case VtexImageFormat.BGRA8888:
				this.#compressionMethod = TextureCompressionMethod.Uncompressed;
				this.#imageFormat = ImageFormat.BGRA8888;
				break;
			case VtexImageFormat.PngR8G8B8A8Uint:
				this.#compressionMethod = TextureCompressionMethod.Uncompressed;
				this.#imageFormat = ImageFormat.PngR8G8B8A8Uint;
				break;
			case VtexImageFormat.PngDXT5:
				this.#compressionMethod = TextureCompressionMethod.Uncompressed;
				this.#imageFormat = ImageFormat.PngDXT5;
				break;
			default:
				console.error(`Unknown vtex format ${imageFormat}`);
				break;
		}
	}

	getVtexImageFormat(): VtexImageFormat {
		return this.#vtexImageFormat;
	}

	getImageFormat(): ImageFormat {
		return this.#imageFormat;
	}

	async getImageData(mipmap?: number, frame = 0, face = 0): Promise<ImageData | null> {
		const imageData = (this.blocks.DATA as Source2VtexBlock).imageData[0];
		const imageWidth = (this.blocks.DATA as Source2VtexBlock).width;
		const imageHeight = (this.blocks.DATA as Source2VtexBlock).height;
		let datas: Uint8ClampedArray;

		switch (formatCompression(this.#imageFormat)) {
			case TextureCompressionMethod.Uncompressed:
				switch (this.#imageFormat) {
					case ImageFormat.PngR8G8B8A8Uint:
					case ImageFormat.PngDXT5:
						datas = new Uint8ClampedArray(imageWidth * imageHeight * 4);
						const png = decode(imageData);
						if (png) {
							datas.set(png.data);
						}
						break;
					default:
						datas = new Uint8ClampedArray(imageWidth * imageHeight * 4);
						datas.set(imageData);
						break;
				}
				break;
			case TextureCompressionMethod.St3c:
			case TextureCompressionMethod.Rgtc:
			case TextureCompressionMethod.Bptc:
				datas = await decompressDxt(this.#imageFormat as ImageFormatS3tc, imageWidth, imageHeight, imageData);
				break;
			default:
				console.error(this.#imageFormat);
				datas = new Uint8ClampedArray(imageWidth * imageHeight * 4);
		}

		if (this.decodeYCoCg()) {
			decodeYCoCg(datas);
		}
		if (this.decodeNormalizeNormals()) {
			decodeNormals(datas);
		}

		return new ImageData(datas, imageWidth, imageHeight);
	}

	setCodec(codec: TextureCodec): void {
		this.#codecs |= codec;
	}

	decodeYCoCg():boolean {
		return (this.#codecs & TextureCodec.YCoCg) == TextureCodec.YCoCg;
	}

	decodeNormalizeNormals():boolean {
		return (this.#codecs & TextureCodec.NormalizeNormals) == TextureCodec.NormalizeNormals;
	}

	setSpecialDependency(compilerIdentifier: string, string: string): void {
		if (compilerIdentifier == TEXTURE_COMPILER) {
			//const s =  specialDependency.getSubValueAsString('m_String');
			switch (string) {
				case TEXTURE_YCOCG:
					this.setCodec(TextureCodec.YCoCg);
					break;
				case TEXTURE_NORMALIZED_NORMALS:
					this.setCodec(TextureCodec.NormalizeNormals);
					break;
			}
		}
	}
}

function decodeYCoCg(datas: Uint8ClampedArray): void {
	for (let i = 0; i < datas.length; i += 4) {
		const scale = 1 / ((datas[i + 2]! >> 3) + 1);
		const co = (datas[i + 0]! - 128) * scale;
		const cg = (datas[i + 1]! - 128) * scale;
		const y = datas[i + 3]!;

		const tmp = y - cg;
		datas[i] = tmp + co;
		datas[i + 1] = y + cg;
		datas[i + 2] = tmp - co;
		datas[i + 3] = 255;

	}
}

function decodeNormals(datas: Uint8ClampedArray): void {
	const v = vec2.create();
	for (let i = 0; i < datas.length; i += 4) {
		// map alpha, green to red, green. Blue is computed
		v[0] = datas[i + 3]! * 2 - 255;
		v[1] = -(datas[i + 1]! * 2 - 255);

		datas[i + 0] = v[0] * 0.5 + 128;
		datas[i + 1] = v[1] * 0.5 + 128;
		datas[i + 2] = Math.sqrt(255 * 255 - vec2.dot(v, v)) * 0.5 + 128;
	}
}
