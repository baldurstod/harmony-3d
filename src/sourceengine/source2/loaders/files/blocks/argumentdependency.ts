import { BinaryReader } from 'harmony-binary-reader';
import { RediBlock } from './redi';

export class ArgumentDependency implements RediBlock {
	parameterName: string = '';
	parameterType: string = '';
	fingerprint: number = 0;
	fingerprintDefault: number = 0;

	getLength(): number {
		return 4 * 4;
	}

	fromReader(reader: BinaryReader): void {
		const parameterNameOffset = reader.tell() + reader.getUint32();
		const parameterTypeOffset = reader.tell() + reader.getUint32();
		this.fingerprint = reader.getUint32();
		this.fingerprintDefault = reader.getUint32();

		this.parameterName = reader.getNullString(parameterNameOffset);
		this.parameterType = reader.getNullString(parameterTypeOffset);
	}

	// TODO: add from kv3
}
