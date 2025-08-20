import { BinaryReader } from 'harmony-binary-reader';

export interface RediBlock {
	getLength: () => number;
	fromReader: (reader: BinaryReader) => void;
}

export interface RediBlockConstructor {
	new(): RediBlock;
}
