import { BinaryReader } from 'harmony-binary-reader';
import { SourceBinaryLoader } from '../../common/loaders/sourcebinaryloader';
import { Source2File } from './source2file';
import { Source2FileBlock } from './source2fileblock';
import { Source2BlockLoader } from './source2blockloader';
import { DEBUG, TESTING } from '../../../buildoptions';

export class Source2FileLoader extends SourceBinaryLoader {//TODOv3: make singleton ???
	vtex;
	constructor(vtex?) {
		super();
		this.vtex = vtex;
	}

	async parse(repository, fileName, arrayBuffer): Promise<Source2File> {
		let reader = new BinaryReader(arrayBuffer);

		let file = new Source2File(repository, fileName);

		await this.#parseHeader(reader, file, this.vtex);
		if (false && TESTING) {
			console.log(file);
		}
		return file;
	}

	async #parseHeader(reader, file, parseVtex) {
		let startOffset = reader.tell();
		file.fileLength = reader.getUint32();
		file.versionMaj = reader.getUint16();
		file.versionMin = reader.getUint16();

		let headerOffset = reader.tell() + reader.getUint32();
		let resCount = reader.getUint32();

		let resType, resOffset, resLength, block;
		file.maxBlockOffset = 0;
		reader.seek(headerOffset);//Should already be at the right place, but just in case
		for (let i = 0; i < resCount; i++) {
			resType = reader.getString(4);
			resOffset = reader.tell() + reader.getUint32();
			resLength = reader.getUint32();

			file.maxBlockOffset = Math.max(file.maxBlockOffset, resOffset + resLength);

			block = new Source2FileBlock(file, resType, resOffset, resLength);
			file.addBlock(block);
		}
		for (let block of file.blocksArray) {
			if (block.length > 0) {
				await Source2BlockLoader.parseBlock(reader, file, block, parseVtex);
			}
		}
		return;
	}
}