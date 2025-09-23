import { BinaryReader } from 'harmony-binary-reader';
import { TESTING } from '../../../buildoptions';
import { decodeLz4 } from '../../../utils/lz4';
import { Kv3Element, Source2Kv3Value, SourceKv3String } from '../../common/keyvalue/kv3element';
import { Kv3File } from '../../common/keyvalue/kv3file';
import { Kv3Type, Kv3Value, Kv3ValueTypeAll, Kv3ValueTypePrimitives } from '../../common/keyvalue/kv3value';

const DATA_TYPE_NULL = 0x01;
const DATA_TYPE_BOOL = 0x02;
const DATA_TYPE_INT64 = 0x03;
const DATA_TYPE_UINT64 = 0x04;
const DATA_TYPE_DOUBLE = 0x05;
const DATA_TYPE_STRING = 0x06;
const DATA_TYPE_BLOB = 0x07;
const DATA_TYPE_ARRAY = 0x08;
const DATA_TYPE_OBJECT = 0x09;
//const DATA_TYPE_TYPED_ARRAY = 0x0A;
const DATA_TYPE_INT32 = 0x0B;
const DATA_TYPE_UINT32 = 0x0C;
const DATA_TYPE_TRUE = 0x0D;
const DATA_TYPE_FALSE = 0x0E;
const DATA_TYPE_INT_ZERO = 0x0F;
const DATA_TYPE_INT_ONE = 0x10;
const DATA_TYPE_DOUBLE_ZERO = 0x11;
const DATA_TYPE_DOUBLE_ONE = 0x12;
const DATA_TYPE_FLOAT = 0x13;
const DATA_TYPE_BYTE = 0x17;
//const DATA_TYPE_TYPED_ARRAY2 = 0x18;
//const DATA_TYPE_TYPED_ARRAY3 = 0x19;
//const DATA_TYPE_RESOURCE = 0x86;

interface Readers {
	reader1: BinaryReader;
	reader2: BinaryReader;
	reader4: BinaryReader;
	reader8: BinaryReader;
}

export const BinaryKv3Loader = new (function () {
	class BinaryKv3Loader {

		getBinaryVkv3(binaryString: string) {
			const reader = new BinaryReader(binaryString);
			const binaryKv3 = new Kv3File();
			const stringDictionary: string[] = [];

			readStringDictionary(reader, stringDictionary);
			const element = readElement(reader, stringDictionary);
			if (element instanceof Kv3Element) {
				binaryKv3.setRoot(element);
			}
			return binaryKv3;
		}

		getBinaryKv3(version: number, binaryString: string | Uint8Array, singleByteCount: number[], doubleByteCount: number[], quadByteCount: number[], eightByteCount: number[],
			dictionaryTypeLength: number, blobCount: number, totalUncompressedBlobSize: number, compressedBlobReader: BinaryReader | undefined, uncompressedBlobReader: BinaryReader | undefined,
			compressionFrameSize: number, bufferId: number, stringDictionary: string[] | undefined, objectCount: number, arrayCount: number/*TODO: use it*/, buffer0: Uint8Array): Kv3File | string[] {
			const reader = new BinaryReader(binaryString);
			if (!stringDictionary) {
				stringDictionary = [];
			}

			//let offset = reader.byteLength - 4;//TODO: check last 4 bytes (0x00 0xDD 0xEE 0xFF)
			let offset: number;
			let byteCursor = 0;
			if (version >= 5 && bufferId == 1) {
				byteCursor = objectCount * 4;
			}
			const doubleCursor = Math.ceil((byteCursor + singleByteCount[bufferId]!) / 2) * 2;//Math.ceil(byteCursor + singleByteCount[bufferId] / 2) * 2;
			const quadCursor = Math.ceil((doubleCursor + doubleByteCount[bufferId]! * 2) / 4) * 4;//Math.ceil(singleByteCount / 4) * 4;
			let eightCursor = Math.ceil((quadCursor + quadByteCount[bufferId]! * 4) / 8) * 8;

			if (version >= 5 && eightByteCount[bufferId] == 0) {
				// In this case, don't align cursor
				eightCursor = quadCursor + quadByteCount[bufferId]! * 4;
			}

			//console.info(byteCursor, doubleCursor, quadCursor, eightCursor);

			let dictionaryOffset = eightCursor + eightByteCount[bufferId]! * 8;
			if (version >= 5 && bufferId == 0) {
				dictionaryOffset = 0;
			}
			let uncompressedBlobSizeReader: BinaryReader | undefined, compressedBlobSizeReader: BinaryReader | undefined;
			const blobOffset = dictionaryOffset + dictionaryTypeLength;
			if (version >= 2 && blobCount != 0) {
				if (compressedBlobReader) {
					const uncompressedLength = blobCount * 4;
					uncompressedBlobSizeReader = new BinaryReader(reader, blobOffset, uncompressedLength);
					compressedBlobSizeReader = new BinaryReader(reader, blobOffset + 4 + uncompressedLength);

				} else {
					if (uncompressedBlobReader) {
						uncompressedBlobSizeReader = new BinaryReader(reader, reader.byteLength - blobCount * 4 - 4, blobCount * 4);
					}
				}
			}

			if (version == 1) {//v1
				offset = reader.byteLength - 4;
			} else if (version < 5) {//v2-v4
				offset = blobOffset;
			} else {
				offset = 0/*TODO: check*/;
			}

			const typeArray = [];
			const valueArray: Source2Kv3Value[] = [];

			if (version < 5) {
				do {
					--offset;
					const type = reader.getUint8(offset);
					//typeArray.unshift(type);
					if (type) {
						typeArray.unshift(type);
					} else {
						break;
					}
				} while (offset >= 0)
			} else {
				if (bufferId == 1) {
					reader.seek(dictionaryOffset);
					for (let i = 0; i < dictionaryTypeLength; i++) {
						const type = reader.getUint8();
						if (type) {
							typeArray.push(type);
						}
					}
				}
			}

			const byteReader = new BinaryReader(reader);
			const doubleReader = new BinaryReader(reader);
			const quadReader = new BinaryReader(reader);
			const eightReader = new BinaryReader(reader);

			let byteReaderBuf0: BinaryReader;
			let doubleReaderBuf0: BinaryReader;
			let quadReaderBuf0: BinaryReader;
			let eightReaderBuf0: BinaryReader;

			byteReader.seek(byteCursor);
			doubleReader.seek(doubleCursor);
			quadReader.seek(quadCursor);
			eightReader.seek(eightCursor);

			reader.seek(); // skip blob data

			const readers: Readers = {} as Readers;

			let objectsSizeReader = quadReader;

			if (bufferId == 0) {
				// In v5, strings are in buffer 0
				const stringCount = quadReader.getUint32();
				reader.seek(dictionaryOffset);
				readStringDictionary(reader, stringDictionary, stringCount);

				if (version >= 5) {
					return stringDictionary;
				}
			} else {
				objectsSizeReader = new BinaryReader(reader);
				const reader0 = new BinaryReader(buffer0);

				const byteCursorBuf0 = 0;
				const doubleCursorBuf0 = Math.ceil(singleByteCount[0]! / 2) * 2;
				const quadCursorBuf0 = Math.ceil((doubleCursorBuf0 + doubleByteCount[0]! * 2) / 4) * 4;
				const eightCursorBuf0 = Math.ceil((quadCursorBuf0 + quadByteCount[0]! * 4) / 8) * 8;
				//console.info('cursor buff 0', byteCursorBuf0, doubleCursorBuf0, quadCursorBuf0, eightCursorBuf0)

				byteReaderBuf0 = new BinaryReader(reader0);
				doubleReaderBuf0 = new BinaryReader(reader0);
				quadReaderBuf0 = new BinaryReader(reader0);
				eightReaderBuf0 = new BinaryReader(reader0);

				byteReaderBuf0.seek(byteCursorBuf0);
				doubleReaderBuf0.seek(doubleCursorBuf0);
				quadReaderBuf0.seek(quadCursorBuf0 + 4);// Eat a quad (string dictionnary length)
				eightReaderBuf0.seek(eightCursorBuf0);

				readers.reader1 = byteReaderBuf0;
				readers.reader2 = doubleReaderBuf0;
				readers.reader4 = quadReaderBuf0;
				readers.reader8 = eightReaderBuf0;
			}

			let decompressBlobBuffer;
			let decompressBlobArray: DecompressBlobArray | undefined;

			if (compressedBlobReader) {//if a compressed reader is provided, we have to uncompress the blobs
				decompressBlobBuffer = new ArrayBuffer(totalUncompressedBlobSize);
				decompressBlobArray =
					{ array: new Uint8Array(decompressBlobBuffer), offset: 0 }
					;
				//decompressBlobArray.decompressOffset = 0;
			}

			const rootElement = readBinaryKv3Element({ dictionary: stringDictionary }, version, byteReader, doubleReader, quadReader, eightReader, objectsSizeReader,
				uncompressedBlobSizeReader, compressedBlobSizeReader, blobCount,
				decompressBlobBuffer, decompressBlobArray, compressedBlobReader, uncompressedBlobReader,
				typeArray, valueArray, undefined, false, compressionFrameSize, readers);


			// return it in a suitable format
			const binaryKv3 = new Kv3File();
			if ((rootElement as Kv3Element).isKv3Element) {
				//binaryKv3.setRoot(binaryKv32KV3(rootElement, stringDictionary));
				binaryKv3.setRoot(rootElement as Kv3Element);
			}
			return binaryKv3;
		}
	}
	return BinaryKv3Loader;
}());

function readStringDictionary(reader: BinaryReader, stringDictionary: string[], stringCount?: number) {
	stringCount = stringCount ?? reader.getUint32();
	for (let i = 0; i < stringCount; i++) {
		stringDictionary.push(reader.getNullString());
	}
}

export type Source2Kv3ValueType = Source2Kv3Value | SourceKv3String | null | undefined | boolean | number | number[] | bigint | Uint8Array;

type Kv3Context = {
	dictionary: string[];
}

function readBinaryKv3Element(context: Kv3Context, version: number, byteReader: BinaryReader, doubleReader: BinaryReader, quadReader: BinaryReader, eightReader: BinaryReader, objectsSizeReader: BinaryReader,
	uncompressedBlobSizeReader: BinaryReader | undefined, compressedBlobSizeReader: BinaryReader | undefined, blobCount: number,
	decompressBlobBuffer: ArrayBuffer | undefined, decompressBlob: DecompressBlobArray | undefined, compressedBlobReader: BinaryReader | undefined, uncompressedBlobReader: BinaryReader | undefined,
	typeArray: number[], valueArray: Source2Kv3Value[]/*TODO: remove me ?*/, elementType: number/*TODO: create enum*/ | undefined, isArray: boolean, compressionFrameSize: number, readers0: Readers)
	: Kv3Element | Kv3Value | null {

	function shiftArray() {
		const elementType = typeArray.shift();
		if (elementType == Kv3Type.Resource) {
			// Why do we do that ?
			typeArray.shift();
		}
		if (elementType == Kv3Type.Subclass) {
			// Why do we do that ?
			typeArray.shift();
		}
		return elementType;
	}

	elementType = elementType || shiftArray()/*typeArray.shift()*/;
	if (elementType == undefined) {
		return null;
	}

	//let count;
	//let elements: SourceKv3Value[];
	switch (elementType) {
		case DATA_TYPE_NULL:
			return null;
		case DATA_TYPE_BOOL:
			return new Kv3Value(elementType, byteReader.getUint8() ? true : false);
		/*
			if (isArray) {
				//return byteReader.getUint8() ? true : false;
				return new Kv3Value(elementType, byteReader.getUint8() ? true : false);
			} else {
				const value = new Source2Kv3Value(elementType);
				valueArray.push(value);
				value.value = byteReader.getUint8() ? true : false;
				return value;
			}
		*/
		case DATA_TYPE_INT64:
			return new Kv3Value(elementType, eightReader.getBigInt64());
		/*
			if (isArray) {
				return eightReader.getBigInt64();
			} else {
				const value = new Source2Kv3Value(elementType);
				value.value = eightReader.getBigInt64();
				valueArray.push(value);
				return value;
			}
		*/
		case DATA_TYPE_UINT64:
			return new Kv3Value(elementType, eightReader.getBigUint64());
		/*
			if (isArray) {
				return eightReader.getBigUint64();
			} else {
				const value = new Source2Kv3Value(elementType);
				value.value = eightReader.getBigUint64();
				valueArray.push(value);
				return value;
			}
		*/
		case DATA_TYPE_DOUBLE:
			return new Kv3Value(elementType, eightReader.getFloat64());
		/*
			if (isArray) {
				return eightReader.getFloat64();
			} else {
				const value = new Source2Kv3Value(elementType);
				value.value = eightReader.getFloat64();
				valueArray.push(value);
				return value;
			}
		*/
		case DATA_TYPE_BYTE:
			return new Kv3Value(elementType, byteReader.getInt8());
		/*
			if (isArray) {
				return byteReader.getInt8();
			} else {
				const value = new Source2Kv3Value(elementType);
				value.value = byteReader.getInt8();
				valueArray.push(value);
				return value;
			}
		*/
		case DATA_TYPE_STRING:
			return new Kv3Value(elementType, context.dictionary[quadReader.getInt32()] ?? '');
		//return new SourceKv3String(quadReader.getInt32());
		case Kv3Type.Blob:
			if (blobCount == 0) {
				const blobCount = quadReader.getUint32();
				const blobArray = new Uint8Array(blobCount);
				for (let i = 0; i < blobCount; i++) {
					blobArray[i] = byteReader.getUint8();
				}

				return new Kv3Value(elementType, blobArray);
			} else {
				if (compressedBlobReader && uncompressedBlobSizeReader && compressedBlobSizeReader && decompressBlobBuffer && decompressBlob) {//if we have a decompress buffer, that means we have to decompress the blobs
					let uncompressedBlobSize = uncompressedBlobSizeReader.getUint32();

					//let decompressBuffer = new ArrayBuffer(uncompressedBlobSize);
					const decompressArray = new Uint8Array(decompressBlobBuffer, decompressBlob.offset, uncompressedBlobSize);


					/*
					TODO: test blobs version 5 compression method 1 (lz4)
					let compressedBlobSize: number;
					if (version < 5) {
						compressedBlobSize = compressedBlobSizeReader.getUint16();
					} else {
						compressedBlobSize = quadReader.getUint32();
					}*/

					while (true) {
						const compressedBlobSize = compressedBlobSizeReader.getUint16();
						if (uncompressedBlobSize > compressionFrameSize) {
							const uncompressedFrameSize = decodeLz4(compressedBlobReader, decompressBlob.array, compressedBlobSize, compressionFrameSize, decompressBlob.offset);
							decompressBlob.offset += uncompressedFrameSize;
							uncompressedBlobSize -= uncompressedFrameSize;
						} else {
							uncompressedBlobSize = decodeLz4(compressedBlobReader, decompressBlob.array, compressedBlobSize, uncompressedBlobSize, decompressBlob.offset);
							decompressBlob.offset += uncompressedBlobSize;
							break;
						}
					}
					/*if (uncompressedBlobSize > compressionFrameSize) {
						let uncompressedBlobSize2;
						uncompressedBlobSize2 = decodeLz4(compressedBlobReader, decompressBlobArray, compressedBlobSize, compressionFrameSize, decompressBlobArray.decompressOffset);
						decompressBlobArray.decompressOffset += uncompressedBlobSize2;
						uncompressedBlobSize2 = decodeLz4(compressedBlobReader, decompressBlobArray, compressedBlobSize, uncompressedBlobSize - compressionFrameSize, decompressBlobArray.decompressOffset);
						decompressBlobArray.decompressOffset += uncompressedBlobSize2;
						//uncompressedBlobSize = decodeLz4(compressedBlobReader, decompressBlobArray, compressedBlobSize, uncompressedBlobSize, decompressBlobArray.decompressOffset);
					} else {
						uncompressedBlobSize = decodeLz4(compressedBlobReader, decompressBlobArray, compressedBlobSize, uncompressedBlobSize, decompressBlobArray.decompressOffset);
						decompressBlobArray.decompressOffset += uncompressedBlobSize;
					}*/
					//return decompressArray;
					return new Kv3Value(elementType, decompressArray);
				} else {
					if (uncompressedBlobReader && uncompressedBlobSizeReader) {//blobs have already been uncompressed
						const uncompressedBlobSize = uncompressedBlobSizeReader.getUint32();
						//return uncompressedBlobReader.getBytes(uncompressedBlobSize);
						return new Kv3Value(elementType, uncompressedBlobReader.getBytes(uncompressedBlobSize));
					} else {
						//should not happend
						throw 'Missing reader';
					}
				}
			}
		case DATA_TYPE_ARRAY:
			const arrayCount = quadReader.getUint32();
			const arrayElements: (Kv3Element | Kv3Value | null)[] = new Array(arrayCount);
			for (let i = 0; i < arrayCount; i++) {
				arrayElements[i] = readBinaryKv3Element(context, version, byteReader, doubleReader, quadReader, eightReader, objectsSizeReader, uncompressedBlobSizeReader, compressedBlobSizeReader, blobCount, decompressBlobBuffer, decompressBlob, compressedBlobReader, uncompressedBlobReader, typeArray, valueArray, undefined, true, compressionFrameSize, readers0);
			}
			//return arrayElements;
			return new Kv3Value(elementType, arrayElements);
		case DATA_TYPE_OBJECT:
			const objectCount = objectsSizeReader.getUint32();
			//elements = new Kv3Element();
			const objectElements = new Kv3Element();//new Map<number, Source2Kv3Value>();
			const stringDictionary = context.dictionary;
			for (let i = 0; i < objectCount; i++) {
				const nameId = quadReader.getUint32();
				const element = readBinaryKv3Element(context, version, byteReader, doubleReader, quadReader, eightReader, objectsSizeReader, uncompressedBlobSizeReader, compressedBlobSizeReader, blobCount, decompressBlobBuffer, decompressBlob, compressedBlobReader, uncompressedBlobReader, typeArray, valueArray, undefined, false, compressionFrameSize, readers0);
				const name = stringDictionary[nameId];
				if (name !== undefined) {
					objectElements.setProperty(name, element);
				}
				//elements.setProperty(nameId, element);
			}
			return objectElements;
		case Kv3Type.TypedArray:
			{
				const typedArrayCount = quadReader.getUint32();
				if (TESTING && (typedArrayCount > 100000)) {
					console.error(typedArrayCount);
					console.error(typedArrayCount, quadReader.tell(), quadReader.byteLength);
					//typedArraycount = 0;
				}
				const subType = shiftArray()/*typeArray.shift()*/;
				const typesArrayElements: Kv3ValueTypePrimitives[] = new Array(typedArrayCount);
				for (let i = 0; i < typedArrayCount; i++) {
					const value = readBinaryKv3Element(context, version, byteReader, doubleReader, quadReader, eightReader, objectsSizeReader, uncompressedBlobSizeReader, compressedBlobSizeReader, blobCount, decompressBlobBuffer, decompressBlob, compressedBlobReader, uncompressedBlobReader, typeArray, valueArray, subType, true, compressionFrameSize, readers0)

					if (value && (value as Kv3Value).isKv3Value) {
						typesArrayElements[i] = (value as Kv3Value).getValue() as Kv3ValueTypePrimitives/*TODO: check that*/;
					} else {
						typesArrayElements[i] = (value as (Kv3Element | null));
					}
				}
				//return typesArrayElements;
				return new Kv3Value(elementType, typesArrayElements, subType);
			}
		case DATA_TYPE_INT32:
			return new Kv3Value(elementType, quadReader.getInt32());
		case DATA_TYPE_UINT32:
			return new Kv3Value(elementType, quadReader.getUint32());
		case DATA_TYPE_TRUE:
			return new Kv3Value(elementType, true);
		case DATA_TYPE_FALSE:
			return new Kv3Value(elementType, false);
		case DATA_TYPE_INT_ZERO:
		case DATA_TYPE_DOUBLE_ZERO:
			return new Kv3Value(elementType, 0);
		case DATA_TYPE_INT_ONE:
		case DATA_TYPE_DOUBLE_ONE:
			return new Kv3Value(elementType, 1);
		case DATA_TYPE_FLOAT:
			return new Kv3Value(elementType, quadReader.getFloat32());
		/*
			if (isArray) {
				return quadReader.getFloat32();
			} else {
				const value = new Source2Kv3Value(elementType);
				value.value = quadReader.getFloat32();
				valueArray.push(value);
				return value;
			}
		*/
		case Kv3Type.TypedArray2:
			{
				const typedArray2Count = byteReader.getUint8();
				const subType2 = shiftArray()/*typeArray.shift()*/;
				const typesArray2Elements = new Array(typedArray2Count);
				for (let i = 0; i < typedArray2Count; i++) {
					const value = readBinaryKv3Element(context, version, byteReader, doubleReader, quadReader, eightReader, objectsSizeReader, uncompressedBlobSizeReader, compressedBlobSizeReader, blobCount, decompressBlobBuffer, decompressBlob, compressedBlobReader, uncompressedBlobReader, typeArray, valueArray, subType2, true, compressionFrameSize, readers0);

					if ((value as Kv3Value).isKv3Value) {
						typesArray2Elements[i] = (value as Kv3Value).getValue();
					} else {
						typesArray2Elements[i] = (value as (Kv3Element | null));
					}
				}
				//return typesArray2Elements;
				return new Kv3Value(elementType, typesArray2Elements, subType2);
			}
		case Kv3Type.TypedArray3:
			{
				const typedArray3Count = byteReader.getUint8();
				const subType3 = shiftArray()/*typeArray.shift()*/;
				const typesArray3Elements = new Array(typedArray3Count);
				for (let i = 0; i < typedArray3Count; i++) {
					const value = readBinaryKv3Element(context, version, readers0.reader1, readers0.reader2, readers0.reader4, readers0.reader8, objectsSizeReader, uncompressedBlobSizeReader, compressedBlobSizeReader, blobCount, decompressBlobBuffer, decompressBlob, compressedBlobReader, uncompressedBlobReader, typeArray, valueArray, subType3, true, compressionFrameSize, readers0);

					if ((value as Kv3Value).isKv3Value) {
						typesArray3Elements[i] = (value as Kv3Value).getValue();
					} else {
						typesArray3Elements[i] = (value as (Kv3Element | null));
					}
				}
				//return typesArray3Elements;
				return new Kv3Value(elementType, typesArray3Elements, subType3);
			}
		case Kv3Type.Resource:
			//return new SourceKv3String(quadReader.getInt32());
			return new Kv3Value(elementType, context.dictionary[quadReader.getInt32()] ?? '');
		case Kv3Type.Subclass:
			const objectCount2 = objectsSizeReader.getUint32();
			const objectElements2 = new Kv3Element();
			const stringDictionary2 = context.dictionary;
			for (let i = 0; i < objectCount2; i++) {
				const nameId = quadReader.getUint32();
				const element = readBinaryKv3Element(context, version, byteReader, doubleReader, quadReader, eightReader, objectsSizeReader, uncompressedBlobSizeReader, compressedBlobSizeReader, blobCount, decompressBlobBuffer, decompressBlob, compressedBlobReader, uncompressedBlobReader, typeArray, valueArray, undefined, false, compressionFrameSize, readers0);
				const name = stringDictionary2[nameId];
				if (name !== undefined) {
					objectElements2.setProperty(name, element);
				}
			}
			return objectElements2;
		default:
			console.error('Unknown element type : ', elementType);
	}
	return null;
}

/*

function binaryKv32KV3_removeme(elementKv3: Source2Kv3Value | Map<Number, Source2Kv3ValueType> | Array<never>, stringDictionary: string[]): Kv3Element {
	let element: Kv3Element;

	if (elementKv3 instanceof Map || elementKv3 instanceof Array) {
		if (elementKv3 instanceof Map) {
			element = new Kv3Element();
		} else {
			element = [];
		}

		function iterateMap(value, key, map) {
			let newKey;
			if (elementKv3 instanceof Map) {
				newKey = stringDictionary[key];
			} else {
				//console.log(key, value);
			}

			if (value instanceof Map) {
				value = binaryKv32KV3(value, stringDictionary);
			} else if (value instanceof SourceKv3String) {
				value = stringDictionary[value.id];
			} else if (value instanceof Array) {
				value = binaryKv32KV3(value, stringDictionary);
			} else if (value instanceof Source2Kv3Value) {
				value = value.value;
			}

			if (elementKv3 instanceof Map) {
				element.setProperty(newKey, value);
			} else {
				element[key] = value;
			}
		}
		elementKv3.forEach(iterateMap);
	}
	return element;
}
	*/

function readElement(reader: BinaryReader, stringDictionary: string[], occurences?: number): Kv3Value {
	const type = reader.getUint8();
	//console.log(type);
	switch (type) {
		/*
		kv element:
		2: bool (len 1)
		3:int (len 8)
		5:float (len 8)
		6: string (len 4, index to string dict)
		8:array (len 4 + content)
		9:element
		uint32: properties count
		propertie index uint32
		property type uint8
		property value (len depends on type)


		86: resource(len 1 + 4, index to string dict)*/

		case 0:
			break;
		case 1:
			//return null;
			return new Kv3Value(type, null);
			/*
			if (occurences) {
				const arr = [];
				for (let i = 0; i < occurences; i++) {
					arr.push(reader.getInt32());
				}
				return arr;//new SE2Kv3Value(type, arr);
			} else {
				return reader.getInt32();//new SE2Kv3Value(type, reader.getInt32());
			}
				*/
			break;
		case 2: // Bool
			if (occurences) {
				const arr: boolean[] = [];
				for (let i = 0; i < occurences; i++) {
					arr.push(reader.getUint8() ? true : false);
				}
				//return arr;//new SE2Kv3Value(type, arr);
				return new Kv3Value(type, arr);
			} else {
				//return reader.getUint8() ? true : false;//new SE2Kv3Value(type, reader.getUint8() ? true:false);
				return new Kv3Value(type, reader.getUint8() ? true : false);
			}
			break;
		case 3: // Int 64
			if (occurences) {
				const arr: bigint[] = [];
				for (let i = 0; i < occurences; i++) {
					const int64 = reader.getBigInt64();//TODO: handle int64
					arr.push(int64/*(int64.hi << 32) + int64.lo*/);
				}
				//return arr;//new SE2Kv3Value(type, arr);
				return new Kv3Value(type, arr);
			} else {
				const int64 = reader.getBigInt64();//TODO: handle int64
				//return int64;//(int64.hi << 32) + int64.lo;//new SE2Kv3Value(type, (int64.hi << 32) + int64.lo);
				return new Kv3Value(type, int64);
			}
			break;
		case 5: // Float 64
			if (occurences) {
				const arr: number[] = [];
				for (let i = 0; i < occurences; i++) {
					arr.push(reader.getFloat64());
				}
				//return arr;//new SE2Kv3Value(type, arr);
				return new Kv3Value(type, arr);
			} else {
				//return reader.getFloat64();//new SE2Kv3Value(type, reader.getFloat64());
				return new Kv3Value(type, reader.getFloat64());
			}
			break;
		case 6: // String
			if (occurences) {
				const arr: string[] = [];
				for (let i = 0; i < occurences; i++) {
					propertyIndex = reader.getUint32();
					propertyName = stringDictionary[propertyIndex];
					arr.push(propertyName ?? '');
				}
				//return arr;//new SE2Kv3Value(type, arr);
				return new Kv3Value(type, arr);
			} else {
				propertyIndex = reader.getUint32();
				propertyName = stringDictionary[propertyIndex];
				//return propertyName;//new SE2Kv3Value(type, propertyName);
				return new Kv3Value(type, propertyName ?? '');
			}
			break;
		case 0x07: // byte array
			var propertiesCount = reader.getUint32();
			var element = new Uint8Array(propertiesCount);//new Kv3Array();
			for (let i = 0; i < propertiesCount; i++) {
				element[i] = reader.getUint8();
			}
			//return element;
			return new Kv3Value(type, element);
			break;
		case 8: // Array
			var propertiesCount = reader.getUint32();
			var elementArray: Kv3ValueTypeAll[] = new Array(propertiesCount);
			var propertyName = null;
			var propertyIndex = null;
			var property = null;
			for (var i = 0; i < propertiesCount; i++) {
				//propertyIndex = reader.getUint32();
				//propertyName = stringDictionary(propertyIndex);
				//property = readElement(reader, stringDictionary);
				//element.setProperty(property);
				elementArray[i] = readElement(reader, stringDictionary);
			}
			//return elementArray;
			return new Kv3Value(type, elementArray);
			break;
		case 9: // Element
			if (occurences) {
				const arr: Kv3Element[] = new Array(occurences);
				for (let i = 0; i < occurences; i++) {
					const propertiesCount = reader.getUint32();
					const element = new Kv3Element();
					var propertyName = null;
					var propertyIndex = null;
					var property = null;
					for (let ii = 0; ii < propertiesCount; ii++) {
						propertyIndex = reader.getUint32();
						propertyName = stringDictionary[propertyIndex];
						property = readElement(reader, stringDictionary);
						if (propertyName !== undefined) {
							element.setProperty(propertyName, property);
						}
					}
					arr[i] = element;
				}
				//return arr;
				return new Kv3Value(type, arr);
			} else {
				var propertiesCount = reader.getUint32();
				const element = new Kv3Element();
				var propertyName = null;
				var propertyIndex = null;
				var property = null;
				for (var i = 0; i < propertiesCount; i++) {
					propertyIndex = reader.getUint32();
					propertyName = stringDictionary[propertyIndex];
					property = readElement(reader, stringDictionary);
					if (propertyName !== undefined) {
						element.setProperty(propertyName, property);
					}
				}
				//return element;
				return new Kv3Value(type, element);
			}
			break;
		case 0x0A: // vector
			if (occurences) {
				const arr: Kv3Value[] = new Array(occurences);
				for (let i = 0; i < occurences; i++) {
					const count = reader.getUint32();
					arr[i] = readElement(reader, stringDictionary, count);
				}
				//return arr;//new SE2Kv3Value(type, arr);
				return new Kv3Value(type, arr);
			} else {
				const count = reader.getUint32();
				return readElement(reader, stringDictionary, count);
			}
			break;
		case 0x0B: // int32
			if (occurences) {
				const arr: number[] = new Array(occurences);
				for (let i = 0; i < occurences; i++) {
					arr[i] = reader.getInt32();
				}
				//return arr;//new SE2Kv3Value(type, arr);
				return new Kv3Value(type, arr);
			} else {
				//return reader.getInt32();//new SE2Kv3Value(type, reader.getInt32());
				return new Kv3Value(type, reader.getInt32());
			}
			break;
		case Kv3Type.IntOne:
		case Kv3Type.DoubleOne:
			if (occurences) {
				const arr: number[] = new Array(occurences);
				for (let i = 0; i < occurences; i++) {
					arr[i] = 1;
				}
				//return arr;//new SE2Kv3Value(type, arr);
				return new Kv3Value(type, arr);
			} else {
				//return 1;//new SE2Kv3Value(type, 1);
				return new Kv3Value(type, 1);
			}
			break;
		case Kv3Type.IntZero:
		case Kv3Type.DoubleZero:
			if (occurences) {
				const arr: number[] = new Array(occurences);
				for (let i = 0; i < occurences; i++) {
					arr[i] = 0;
				}
				//return arr;//new SE2Kv3Value(type, arr);
				return new Kv3Value(type, arr);
			} else {
				//return 0;//new SE2Kv3Value(type, 0);
				return new Kv3Value(type, 0);
			}
			break;
		case Kv3Type.True:
			if (occurences) {
				const arr: true[] = new Array(occurences);
				for (let i = 0; i < occurences; i++) {
					arr[i] = true;
				}
				//return arr;
				return new Kv3Value(type, arr);
			} else {
				//return true;
				return new Kv3Value(type, true);
			}
			break;
		case Kv3Type.False:
			if (occurences) {
				const arr: false[] = new Array(occurences);
				for (let i = 0; i < occurences; i++) {
					arr[i] = false;
				}
				//return arr;
				return new Kv3Value(type, arr);
			} else {
				//return false;
				return new Kv3Value(type, false);
			}
			break;
		case Kv3Type.Resource:
			if (occurences) {
				const arr: string[] = [];
				const test = reader.getUint8();//todo: rename variable
				for (let i = 0; i < occurences; i++) {
					propertyIndex = reader.getUint32();
					propertyName = stringDictionary[propertyIndex];
					arr.push(propertyName ?? '');
				}
				//return arr;//new SE2Kv3Value(type, arr);
				return new Kv3Value(type, arr);
			} else {
				const test = reader.getUint8();//todo: rename variable
				propertyIndex = reader.getUint32();
				propertyName = stringDictionary[propertyIndex];
				//console.error(propertyName, test);
				//return propertyName;//new SE2Kv3Value(type, propertyName);
				return new Kv3Value(type, propertyName ?? '');
			}
			break;
		default:
			console.error('Unknown value type : ' + type);

	}
	//return null;

	return new Kv3Value(type, null);
}

type DecompressBlobArray = {
	array: Uint8Array;
	offset: number;
}
