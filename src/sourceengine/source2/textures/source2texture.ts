import { DEBUG } from '../../../buildoptions';
import { formatCompression, ImageFormat, ImageFormatS3tc, TextureCompressionMethod } from '../../../textures/enums';
import { TEXTURE_FORMAT_UNKNOWN } from '../../../textures/textureconstants';
import { decompressDxt } from '../../source1/textures/sourceenginevtf';
import { VTEX_FLAG_CUBE_TEXTURE } from '../constants';
import { Source2File, VTEX_TO_INTERNAL_IMAGE_FORMAT } from '../loaders/source2file';
import { Source2VtexBlock } from '../loaders/source2fileblock';

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

export class Source2Texture extends Source2File {
	#vtexImageFormat: VtexImageFormat = VtexImageFormat.Unknown;// original image format
	#compressionMethod = TextureCompressionMethod.Uncompressed;// TODO: remove
	#imageFormat = ImageFormat.Unknown;

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

	setImageFormat(imageFormat: number): void {
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
			default:
				console.error(`Unknown vtex format ${imageFormat}`);
				break;
		}
	}

	getVtexImageFormat(): number {
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
				datas = new Uint8ClampedArray(imageWidth * imageHeight * 4);
				datas.set(imageData);
				break;
			case TextureCompressionMethod.St3c:
				datas = await decompressDxt(this.#imageFormat as ImageFormatS3tc, imageWidth, imageHeight, imageData);
				break;
			default:
				console.error(this.#imageFormat);
				datas = new Uint8ClampedArray(imageWidth * imageHeight * 4);
		}

		return new ImageData(datas, imageWidth, imageHeight);
	}
}
