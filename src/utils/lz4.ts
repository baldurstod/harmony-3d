import { BinaryReader } from 'harmony-binary-reader';

export function decodeLz4(reader: BinaryReader, decompressBlobArray: Uint8Array, compressedSize: number, uncompressedSize: number, outputIndex = 0) {
	const mask = null;
	const lastOffset = reader.tell() + compressedSize;

	//let outputIndex = 0;
	let decodedeBytes = 0;

	const decodeMask = reader.getUint8();
	let readBytes = (decodeMask & 0xF0) >> 4;
	if (readBytes == 0xF) {
		let a = 0;
		do {
			a = reader.getUint8();
			readBytes += a;
		} while (a == 0xFF)
	}
	let decodeLen = decodeMask & 0xF;

	//let buffer = new Uint8Array(reader.buffer);
	decodeLoop:
	while (true) {
		//console.error(readBytes);
		let offset = reader.tell();
		if (offset >= lastOffset) {
			//break decodeLoop;
		}
		while (readBytes--) {
			decompressBlobArray[outputIndex++] = reader.getUint8(offset++);//buffer[offset++];offset++
			++decodedeBytes;
		}
		if (decodedeBytes >= uncompressedSize) {
			break decodeLoop;
		}

		const decodeOffset = reader.getUint16(offset);

		if (decodeLen == 0xF) {
			let a = 0;
			do {
				a = reader.getUint8();
				decodeLen += a;
			} while (a == 0xFF)
		}

		const decodeMask = reader.getUint8();
		const nextLen = decodeMask & 0xF;

		readBytes = (decodeMask & 0xF0) >> 4;
		if (readBytes == 0xF) {
			let a = 0;
			do {
				a = reader.getUint8();
				readBytes += a;
			} while (a == 0xFF)
		}
		for (let k = 0; k < decodeLen + 4; k++) {
			decompressBlobArray[outputIndex] = decompressBlobArray[outputIndex - decodeOffset];
			++decodedeBytes;
			if (decodedeBytes >= uncompressedSize) {
				break decodeLoop;
			}
			++outputIndex;
		}
		decodeLen = nextLen;
	}
	return decodedeBytes;
}
