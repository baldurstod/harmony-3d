import { BinaryReader } from 'harmony-binary-reader';

export function decodeBlockCompressed(reader: BinaryReader, sa: Uint8Array, decodeLength: number) {
	let mask = null;

	let outputIndex = 0;
	let decodedeBytes = 0;

	decodeLoop:
	for (let i = 0; ; i++) {
		mask = reader.getUint16();
		if (mask == 0) {
			/* TODO: copy 16 bytes at once */
			for (let j = 0; j < 16; j++) {
				sa[outputIndex++] = reader.getBytes(1)[0]!;
				++decodedeBytes;
				if (decodedeBytes >= decodeLength) {
					break decodeLoop;
				}
			}
		} else {
			for (let j = 0; j < 16; j++) {
				const decode = mask & (1 << j);
				if (decode) {
					const decodeMask = reader.getUint16();// offset 12 bits, len 4 bits
					const decodeOffset = (decodeMask & 0xFFF0) >> 4;
					const decodeLen = (decodeMask & 0xF) + 3; // Min len is 3
					for (let k = 0; k < decodeLen; k++) {
						sa[outputIndex] = sa[outputIndex - decodeOffset - 1]!;
						++decodedeBytes;
						if (decodedeBytes >= decodeLength) {
							break decodeLoop;
						}
						++outputIndex;
					}

				} else { // Single byte
					sa[outputIndex++] = reader.getBytes(1)[0]!;
					++decodedeBytes;
					if (decodedeBytes >= decodeLength) {
						break decodeLoop;
					}
				}
			}
		}
	}
}
