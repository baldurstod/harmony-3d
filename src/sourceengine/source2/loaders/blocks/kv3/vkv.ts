import { BinaryReader } from 'harmony-binary-reader';
import { decodeLz4 } from '../../../../../utils/lz4';
import { BinaryKv3Loader } from '../../binarykv3loader';
import { Source2FileBlock } from '../../source2fileblock';
import { decodeBlockCompressed } from './blockcompressed';

export function loadDataVkv(reader: BinaryReader, block: Source2FileBlock): void {
	const KV3_ENCODING_BLOCK_COMPRESSED = '\x46\x1A\x79\x95\xBC\x95\x6C\x4F\xA7\x0B\x05\xBC\xA1\xB7\xDF\xD2';
	const KV3_ENCODING_BLOCK_COMPRESSED_LZ4 = '\x8A\x34\x47\x68\xA1\x63\x5C\x4F\xA1\x97\x53\x80\x6F\xD9\xB1\x19';
	//const KV3_ENCODING_BLOCK_COMPRESSED_UNKNOWN = '\x7C\x16\x12\x74\xE9\x06\x98\x46\xAF\xF2\xE6\x3E\xB5\x90\x37\xE7';

	reader.seek(block.offset);
	reader.skip(4);//TODO: improve detection
	const encoding = reader.getString(16);
	const format = reader.getString(16);

	let decodeLength, sa;
	decodeLength = reader.getUint32();


	if ((decodeLength >>> 24) == 0x80) {
		sa = reader.getBytes(decodeLength & 0xFF);
		//sa = reader.getBytes(undefined, 0);
	} else {
		sa = new Uint8Array(new ArrayBuffer(decodeLength));

		switch (encoding) {
			case KV3_ENCODING_BLOCK_COMPRESSED:
				/*if ((decodeLength >>> 24) == 0x80) {

				} else {*/
				decodeBlockCompressed(reader, sa, decodeLength);
				//}
				break;
			case KV3_ENCODING_BLOCK_COMPRESSED_LZ4:
				decodeLz4(reader, sa, block.length, decodeLength);
				break;
			default:
				console.error('Unknown kv3 encoding ', encoding.split(''));
				break;
		}
	}
	block.keyValue = BinaryKv3Loader.getBinaryVkv3(ab2str(sa));// TODO: pass uint8 array ?
}

function ab2str(arrayBuf: Uint8Array): string {
	let s = '';
	for (let i = 0; i < arrayBuf.length; i++) {
		s += String.fromCharCode(arrayBuf[i]!);
	}
	return s;
}
