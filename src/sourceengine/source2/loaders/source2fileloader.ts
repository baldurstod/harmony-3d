import { BinaryReader } from 'harmony-binary-reader';
import { TESTING } from '../../../buildoptions';
import { SourceBinaryLoader } from '../../common/loaders/sourcebinaryloader';
import { Source2Texture, TextureCodec } from '../textures/source2texture';
import { Source2BlockLoader, Source2BlockLoaderContext } from './source2blockloader';
import { Source2File } from './source2file';
import { Source2FileBlock } from './source2fileblock';

export class Source2FileLoader extends SourceBinaryLoader {//TODOv3: make singleton ???
	vtex: boolean;

	constructor(vtex = false) {
		super();
		this.vtex = vtex;
	}

	async parse(repository: string, path: string, arrayBuffer: ArrayBuffer): Promise<Source2File | Source2Texture> {
		const reader = new BinaryReader(arrayBuffer);

		let file: Source2File | Source2Texture;
		if (this.vtex) {
			file = new Source2Texture(repository, path);
		} else {
			file = new Source2File(repository, path);
		}

		await this.#parseHeader(reader, file, this.vtex);

		if (this.vtex) {
			// TODO: improve detection
			const specialDependencies = file.getBlockStructAsElementArray('RED2', 'm_SpecialDependencies');
			console.error(specialDependencies);

			for (const specialDependency of specialDependencies) {

				if (specialDependency.getSubValueAsString('m_String') == 'Texture Compiler Version Image YCoCg Conversion') {
					(file as Source2Texture).setCodec(TextureCodec.YCoCg);
				}
			}
		}

		if (false && TESTING) {
			console.log(file);
		}
		return file;
	}

	async #parseHeader(reader: BinaryReader, file: Source2File, parseVtex: boolean): Promise<void> {
		//const startOffset = reader.tell();
		file.fileLength = reader.getUint32();
		file.versionMaj = reader.getUint16();
		file.versionMin = reader.getUint16();

		const headerOffset = reader.tell() + reader.getUint32();
		const resCount = reader.getUint32();

		let resType, resOffset, resLength, block;
		file.maxBlockOffset = 0;
		reader.seek(headerOffset);//Should already be at the right place, but just in case
		for (let i = 0; i < resCount; i++) {
			resType = reader.getString(4);
			resOffset = reader.tell() + reader.getUint32();
			resLength = reader.getUint32();

			file.maxBlockOffset = Math.max(file.maxBlockOffset, resOffset + resLength);

			block = new Source2FileBlock(file, i, resType, new BinaryReader(reader, resOffset, resLength), resOffset, resLength);
			file.addBlock(block);
		}
		const context: Source2BlockLoaderContext = { meshIndex: 0 };
		for (const block of file.blocksArray) {
			if (block.length > 0) {
				await Source2BlockLoader.parseBlock(reader, file, block, parseVtex, context);
			}
		}
		//return;
	}
}
