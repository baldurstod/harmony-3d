import { BinaryReader } from 'harmony-binary-reader';
import { TESTING } from '../../../../../buildoptions';
import { decodeLz4 } from '../../../../../utils/lz4';
import { Zstd } from '../../../../../utils/zstd';
import { Kv3File } from '../../../../common/keyvalue/kv3file';
import { BinaryKv3Loader } from '../../binarykv3loader';
import { Source2FileBlock } from '../../source2fileblock';
/*
Struct of a kv3 block
In a single lz4 compressed block:
uint32 string count
byte array
four bytes array
eight bytes array
array of null terminated strings
type array (1 byte)
V2 only : uint32 * blobCount array
0xFFDDEE00 // don't ask why this is no more at the end
V2 only : uint16 * blobCount array


Follows the compressed blobs
*/

export async function loadDataKv3(reader: BinaryReader, block: Source2FileBlock, version: number): Promise<void> {
	const KV3_ENCODING_BLOCK_COMPRESSED = '\x46\x1A\x79\x95\xBC\x95\x6C\x4F\xA7\x0B\x05\xBC\xA1\xB7\xDF\xD2';
	const KV3_ENCODING_BLOCK_COMPRESSED_LZ4 = '\x8A\x34\x47\x68\xA1\x63\x5C\x4F\xA1\x97\x53\x80\x6F\xD9\xB1\x19';
	const KV3_ENCODING_BLOCK_COMPRESSED_UNKNOWN = '\x7C\x16\x12\x74\xE9\x06\x98\x46\xAF\xF2\xE6\x3E\xB5\x90\x37\xE7';

	reader.seek(block.offset);

	const method = 1;
	let bufferCount: 1 | 2 = 1;
	const uncompressedBufferSize: number[] = [];
	const compressedBufferSize: number[] = [];
	const bytesBufferSize1: number[] = [];
	const bytesBufferSize2: number[] = [];
	const bytesBufferSize4: number[] = [];
	const bytesBufferSize8: number[] = [];
	const objectCount: number[] = [];
	const arrayCount: number[] = [];

	reader.skip(4);
	const format = reader.getString(16);
	const compressionMethod = reader.getUint32();
	let compressionDictionaryId;
	let compressionFrameSize = 0;
	let dictionaryTypeLength = 0, unknown3, unknown4, blobCount = 0, totalUncompressedBlobSize = 0;
	let unknown5: number, unknown6: number, unknown7: number, unknown8: number;
	if (version >= 2) {
		compressionDictionaryId = reader.getUint16();
		compressionFrameSize = reader.getUint16();
		//unknown1 = reader.getUint32();//0 or 0x40000000 depending on compression method
	}

	bytesBufferSize1.push(reader.getUint32());
	bytesBufferSize2.push(0);
	bytesBufferSize4.push(reader.getUint32());
	bytesBufferSize8.push(reader.getUint32());
	let compressedLength = block.length;
	if (version >= 2) {
		dictionaryTypeLength = reader.getUint32();
		objectCount.push(reader.getUint16());
		arrayCount.push(reader.getUint16());
		if (false && TESTING) {
			console.log(dictionaryTypeLength, unknown3, unknown4, block);
		}
	}

	const decodeLength = reader.getUint32();
	if (version >= 2) {
		compressedLength = reader.getUint32();
		blobCount = reader.getUint32();
		totalUncompressedBlobSize = reader.getUint32();
	}

	if (version >= 4) {
		unknown5 = reader.getUint32();
		unknown6 = reader.getUint32();
	}

	if (version >= 5) {
		bufferCount = 2;
		uncompressedBufferSize.push(reader.getUint32());
		compressedBufferSize.push(reader.getUint32());
		uncompressedBufferSize.push(reader.getUint32());
		compressedBufferSize.push(reader.getUint32());
		bytesBufferSize1.push(reader.getUint32());
		bytesBufferSize2.push(reader.getUint32());
		bytesBufferSize4.push(reader.getUint32());
		bytesBufferSize8.push(reader.getUint32());

		// TODO: use those values
		unknown7 = reader.getUint32();
		objectCount.push(reader.getUint32());
		arrayCount.push(reader.getUint32());
		unknown8 = reader.getUint32();

		//console.info(block.type, block, uncompressedBufferSize, compressedBufferSize, bytesBufferSize1, bytesBufferSize2, bytesBufferSize4, bytesBufferSize8)
	} else {
		uncompressedBufferSize.push(decodeLength);
		compressedBufferSize.push(compressedLength);
	}

	let sa: Uint8Array = new Uint8Array();
	let compressedBlobReader;
	let uncompressedBlobReader;
	let stringDictionary: string[] = [];
	let buffer0: Uint8Array = new Uint8Array();
	for (let i = 0; i < bufferCount; i++) {
		switch (compressionMethod) {
			case 0:
				if (TESTING && version >= 2 && (compressionDictionaryId != 0 || compressionFrameSize != 0)) {
					throw 'Error compression method doesn\'t match';
				}
				sa = reader.getBytes(uncompressedBufferSize[i]!);
				break;
			case 1:
				const buf = new ArrayBuffer(uncompressedBufferSize[i]!);
				sa = new Uint8Array(buf);
				if (blobCount > 0) {
					compressedBlobReader = new BinaryReader(reader, reader.tell() + compressedBufferSize[i]!);
				}
				decodeLz4(reader, sa, compressedBufferSize[i]!, uncompressedBufferSize[i]!);
				{
					if (blobCount > 0) {
						//SaveFile(new File([new Blob([sa])], 'decodeLz4_' + block.offset + '_' + block.length));
					}
					if (TESTING && (block.type == 'ANIM')) {
						//SaveFile(new File([new Blob([sa])], 'decodeLz4_block_ANIM_' + block.length + '_' + block.offset));
					}
					//SaveFile(new File([new Blob([sa])], 'decodeLz4_block_' + block.type + '_' + block.length + '_' + block.offset));
				}
				break;
			case 2://new since spectre arcana
				//SaveFile(new File([new Blob([reader.getBytes(block.length, block.offset)])], 'block_' + block.offset + '_' + block.length));
				const compressedBytes = reader.getBytes(compressedBufferSize[i]!);
				//SaveFile(new File([new Blob([compressedBytes])], 'block_' + block.offset + '_' + block.length));
				const decompressedBytes = await Zstd.decompress(compressedBytes);
				if (!decompressedBytes) {
					break;
				}
				sa = new Uint8Array(new Uint8Array(decompressedBytes.buffer, 0, uncompressedBufferSize[i]));
				if (blobCount > 0) {
					if (version < 5) {
						uncompressedBlobReader = new BinaryReader(decompressedBytes, uncompressedBufferSize[i]);
					} else {
						if (i == 1) {
							const compressedBlobSize = compressedLength - (compressedBufferSize[0]! + compressedBufferSize[1]!);
							const compressedBlobBytes = reader.getBytes(compressedBlobSize);
							//SaveFile(new File([new Blob([compressedBlobBytes])], 'compressed_zstd' + block.type + '_' + i + '_' + block.length + '_' + block.offset));
							const decompressedBlobBytes = await Zstd.decompress(compressedBlobBytes);
							//console.info(decompressedBlobBytes);
							if (decompressedBlobBytes) {
								uncompressedBlobReader = new BinaryReader(decompressedBlobBytes);
							}
							//SaveFile(new File([new Blob([decompressedBlobBytes])], 'decompressed_zstd' + block.type + '_' + i + '_' + block.length + '_' + block.offset));

						}
						//compressedBlobReader = new BinaryReader(reader, reader.tell());
					}
				}
				//console.error(sa);
				//SaveFile(new File([new Blob([sa])], 'zstd'));

				break;
			default:
				throw 'Unknown kv3 compressionMethod ' + compressionMethod;
				return;
		}
		if (version >= 5) {
			//SaveFile(new File([new Blob([sa])], 'block_' + block.type + '_' + i + '_' + block.length + '_' + block.offset));
		}

		const result = BinaryKv3Loader.getBinaryKv3(version, sa, bytesBufferSize1, bytesBufferSize2, bytesBufferSize4, bytesBufferSize8,
			dictionaryTypeLength, blobCount, totalUncompressedBlobSize, compressedBlobReader, uncompressedBlobReader, compressionFrameSize,
			i, stringDictionary, objectCount[i]!, arrayCount[i]!, buffer0);
		if (version >= 5 && i == 0) {
			stringDictionary = result as string[];
			buffer0 = sa;
		} else {
			//console.log(block.type, result);
			if ((result as Kv3File).isKv3File) {
				block.keyValue = result as Kv3File;
			}
		}
	}
}
