import { BinaryReader } from 'harmony-binary-reader';
import { RediBlock } from './redi';

export class SpecialDependency implements RediBlock {
	string: string = '';
	compilerIdentifier: string = '';
	fingerprint: number = 0;
	userData: number = 0;

	getLength(): number {
		return 4 * 4;
	}

	fromReader(reader: BinaryReader): void {
		const stringOffset = reader.tell() + reader.getUint32();
		const compilerIdentifierOffset = reader.tell() + reader.getUint32();
		this.fingerprint = reader.getUint32();
		this.userData = reader.getUint32();

		this.string = reader.getNullString(stringOffset);
		this.compilerIdentifier = reader.getNullString(compilerIdentifierOffset);
	}

	// TODO: add from kv3
}
