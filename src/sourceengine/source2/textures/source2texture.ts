import { DEBUG } from '../../../buildoptions';
import { TEXTURE_FORMAT_UNKNOWN } from '../../../textures/textureconstants';
import { VTEX_FLAG_CUBE_TEXTURE } from '../constants';
import { Source2File, VTEX_TO_INTERNAL_IMAGE_FORMAT } from '../loaders/source2file';
import { Source2VtexBlock } from '../loaders/source2fileblock';

export class Source2Texture extends Source2File {

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

		switch (block.imageFormat) {
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

		return block.imageFormat <= 2;//DXT1 or DXT5
	}

	isCubeTexture(): boolean {
		const block = this.blocks.DATA as Source2VtexBlock;
		if (!block) {
			return false;
		}

		return (block.flags & VTEX_FLAG_CUBE_TEXTURE) == VTEX_FLAG_CUBE_TEXTURE;
	}



	get imageFormat(): number {//TODOv3 improve this
		const block = this.blocks.DATA as Source2VtexBlock;
		if (!block) {
			return TEXTURE_FORMAT_UNKNOWN;
		}
		const imageFormat = block.imageFormat;
		if (DEBUG) {
			const internalFormat = VTEX_TO_INTERNAL_IMAGE_FORMAT[imageFormat];
			if (internalFormat === undefined) {
				throw 'Unknown vtex format : ' + imageFormat;
			} else {
				return internalFormat;
			}
		} else {
			return VTEX_TO_INTERNAL_IMAGE_FORMAT[imageFormat];
		}
	}
/*
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

		let datas: Uint8ClampedArray;
		const mipmapWidth = mipmapDatas.width;
		const mipmapHeight = mipmapDatas.height;
		const mipmapFaceDatas = mipmapDatas.frames[frame][face];
		if (this.isDxtCompressed()) {
			datas = await decompressDxt(this.highResImageFormat - 12, mipmapWidth, mipmapHeight, mipmapFaceDatas);
		} else {
			datas = new Uint8ClampedArray(mipmapWidth * mipmapHeight * 4);
			datas.set(mipmapFaceDatas);
		}

		return new ImageData(datas, mipmapWidth, mipmapHeight);
	}
		*/

}
