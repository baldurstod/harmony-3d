import { BinaryReader } from 'harmony-binary-reader';
import { RediBlock } from './redi';

export class InputDependency implements RediBlock {
	relativeFilename: string = '';
	searchPath: string = '';
	fileCrc: number = 0;
	optional: boolean = false;
	exists: boolean = false;
	isGameFile: boolean = false;

	getLength(): number {
		return 4 * 4;
	}

	fromReader(reader: BinaryReader): void {
		const relativeFilenameOffset = reader.tell() + reader.getUint32();
		const searchPathOffset = reader.tell() + reader.getUint32();
		this.fileCrc = reader.getUint32();
		const flags = reader.getUint32();

		this.relativeFilename = reader.getNullString(relativeFilenameOffset);
		this.searchPath = reader.getNullString(searchPathOffset);

		this.optional = (flags & 1) != 0;
		this.exists = (flags & 2) != 0;
		this.isGameFile = (flags & 4) != 0;
	}

	// TODO: add from kv3
}
