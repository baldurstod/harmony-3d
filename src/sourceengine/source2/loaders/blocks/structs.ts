import { BinaryReader } from 'harmony-binary-reader';
import { INFO } from '../../../../buildoptions';
import { Kv3Element } from '../../../common/keyvalue/kv3element';
import { Kv3Flag, Kv3Type, Kv3Value } from '../../../common/keyvalue/kv3value';
import { Source2DataBlock, Source2FileStruct, Source2NtroBlock, Source2RerlBlock, Source2StructField } from '../source2fileblock';
import { readHandle } from './handle';

const FIELD_SIZE = [0, 0/*STRUCT*/, 0/*ENUM*/, 8/*HANDLE*/, 0, 0, 0, 0, 0, 0,
	1/*BYTE*/, 1/*BYTE*/, 2/*SHORT*/, 2/*SHORT*/, 4/*INTEGER*/, 4/*INTEGER*/, 8/*INT64*/, 8/*INT64*/,
	4/*FLOAT*/, 0, 0, 0, 12/*VECTOR3*/, 0, 0, 16/*QUATERNION*/, 0, 16, 4, 0, 1, 4];

// TODO: create enum
const DATA_TYPE_STRUCT = 1;
const DATA_TYPE_ENUM = 2;
const DATA_TYPE_HANDLE = 3;
const DATA_TYPE_STRING = 4;
const DATA_TYPE_BYTE = 10;
const DATA_TYPE_UBYTE = 11;
const DATA_TYPE_SHORT = 12;
const DATA_TYPE_USHORT = 13;
const DATA_TYPE_INTEGER = 14;
const DATA_TYPE_UINTEGER = 15;
const DATA_TYPE_INT64 = 16;
const DATA_TYPE_UINT64 = 17;
const DATA_TYPE_FLOAT = 18;
const DATA_TYPE_VECTOR2 = 21;
const DATA_TYPE_VECTOR3 = 22;
const DATA_TYPE_VECTOR4 = 23;
const DATA_TYPE_QUATERNION = 25;
const DATA_TYPE_COLOR = 28;
const DATA_TYPE_BOOLEAN = 30;
const DATA_TYPE_NAME = 31;

export function loadStruct(reader: BinaryReader, reference: Source2RerlBlock, struct: Source2FileStruct, block: Source2DataBlock | null, startOffset: number, introspection: Source2NtroBlock, depth: number): Kv3Element {
	//let dataStruct: Source2DataStruct = {};

	let element: Kv3Element;// = new Kv3Element();
	if (struct.baseId) {
		//throw 'TODO: fix this loadStruct';
		const baseStruct = getStruct(introspection, struct.baseId);
		if (baseStruct) {
			element = loadStruct(reader, reference, baseStruct, block, startOffset, introspection, depth);
		} else {
			element = new Kv3Element();
		}
	} else {
		element = new Kv3Element();
	}

	const fieldList = struct.fields;

	for (let fieldIndex = 0; fieldIndex < fieldList.length; fieldIndex++) {
		const field = fieldList[fieldIndex]!;
		if (field.count) {
			const data: number[] = /*dataStruct[field.name]*/[];
			const fieldSize = FIELD_SIZE[field.type2];
			for (let i = 0; i < field.count; i++) {
				data.push(255);//TODOv3 dafuck ?
			}
			element.setProperty(field.name, new Kv3Value(Kv3Type.TypedArray, data, Kv3Flag.None, Kv3Type.UnsignedInt32));
		} else {
			const f = loadField(reader, reference, field, block, startOffset, introspection, field.offset, field.indirectionByte, field.level, depth);
			if (f) {
				//dataStruct[field.name] = f;
				element.setProperty(field.name, f);
			}
		}
	}

	//dataStruct._name = struct.name;
	return element;
}

function getStruct(block: Source2NtroBlock, structId: number) {
	return block.structs?.[structId];
}


function loadField(reader: BinaryReader, reference: Source2RerlBlock, field: Source2StructField, block: Source2DataBlock | null, startOffset: number, introspection: Source2NtroBlock, fieldOffset: number, fieldIndirectionByte: number, fieldLevel: number, depth: number): Kv3Element | Kv3Value | null {
	fieldOffset = startOffset + fieldOffset;

	if (fieldLevel > 0) {
		const indirectionType = reader.getInt8(fieldOffset);
		if (fieldIndirectionByte == 3) { // Pointer
			if (INFO) {
				console.log('indirect type 3', fieldOffset);
			}
			var struct = introspection.structs?.[field.type];
			if (struct) {
				var pos = reader.getUint32(fieldOffset);
				return loadStruct(reader, reference, struct, null, fieldOffset + pos, introspection, depth + 1);
			} else {
				console.log('Unknown struct ' + field.type, fieldOffset);
			}
			console.log(fieldOffset);
			throw 'check this code loadField1';
			return new Kv3Value(Kv3Type.Int32, fieldOffset);
			//return fieldOffset;
		} else if (fieldIndirectionByte == 4) { // Array
			//console.log("indirect type 4", reader.getUint32(fieldOffset));
			const arrayOffset2 = reader.getUint32(fieldOffset);
			if (arrayOffset2) {
				const arrayOffset = fieldOffset + arrayOffset2;
				const arrayCount = reader.getUint32();
				const values: string[] = [];
				if (field.type) {
					if (field.type2 == DATA_TYPE_STRUCT) { // STRUCT
						const struct = introspection.structs?.[field.type];
						if (struct) {

							const values: Kv3Element[] = [];
							for (var i = 0; i < arrayCount; i++) {
								var pos = arrayOffset + struct.discSize * i;
								//reader.seek(reader.getUint32(pos) + pos);
								reader.seek(pos);
								//var name = reader.getNullString();
								//values[name] = this.loadStruct(reader, struct, null, pos, introspection);
								values.push(loadStruct(reader, reference, struct, block, pos, introspection, depth + 1));
							}
							return new Kv3Value(Kv3Type.TypedArray, values, Kv3Flag.None, Kv3Type.Element);
						} else {
							console.log('Unknown struct ' + field.type, fieldOffset);
						}
					} else if (field.type2 == DATA_TYPE_HANDLE) { // HANDLE
						// Handle to an external ressource in the RERL block
						for (var i = 0; i < arrayCount; i++) {
							var pos = arrayOffset + 8 * i;
							reader.seek(pos);
							var handle = readHandle(reader);
							values[i] = reference.externalFiles[handle] ?? '';
						}
						//reader.seek(fieldOffset);
						//var handle = readHandle(reader);
						//return values;//this.reference.externalFiles[handle];
						return new Kv3Value(Kv3Type.TypedArray, values, Kv3Flag.None, Kv3Type.String);
					} else {
						console.log('Unknown struct type for array ' + field, fieldOffset);
					}
				} else {
					// single field
					const values: (Kv3Element | Kv3Value | null)[] = [];
					const fieldSize = FIELD_SIZE[field.type2] ?? 0;
					if (field.type2 == 11) {
						//console.log(field.type2);//TODOV2
						const arr = new Uint8Array(arrayCount);

						for (var i = 0; i < arrayCount; i++) {
							arr[i] = reader.getUint8(arrayOffset + i);
						}

						return new Kv3Value(Kv3Type.Blob, arr);

					}
					// TODO: fix this: typed array must be loaded for all types
					if (field.type2 == DATA_TYPE_NAME) {
						const arr: string[] = new Array(arrayCount);

						for (let i = 0; i < arrayCount; i++) {
							let pos = arrayOffset + fieldSize * i;
							let strOffset = reader.getInt32(pos);
							reader.seek(pos + strOffset);

							arr[i] = reader.getNullString(pos + strOffset);
						}

						return new Kv3Value(Kv3Type.TypedArray, arr, Kv3Flag.None, Kv3Type.String);
					}
					for (var i = 0; i < arrayCount; i++) {
						var pos = arrayOffset + fieldSize * i;
						/*reader.seek(reader.getUint32(pos) + pos);
						var name = reader.getNullString();*/

						values[i] = loadField(reader, reference, field, null, pos, introspection, 0, 0, 0, 0);
					}
					//return values;
					console.info(values);
					//throw 'check array type';
					return new Kv3Value(Kv3Type.Array, values);
				}
			}
			//throw 'check this code loadField2';
			return new Kv3Value(Kv3Type.Array, []);
			//return [];
		} else {
			// No indirection
			return null;
		}
	} else {
		//fieldOffset += field_offset;
		switch (field.type2) {
			case DATA_TYPE_STRUCT://1
				const struct = introspection.structs?.[field.type];
				if (struct) {
					return loadStruct(reader, reference, struct, null, fieldOffset, introspection, depth + 1);
				}
				console.log(fieldOffset);
				return null;
			case DATA_TYPE_ENUM://2
				throw 'fix me';
			//return ['enum', field.name, field.type2, fieldOffset, reader.getInt32(fieldOffset)];
			case DATA_TYPE_HANDLE://3
				// Handle to an external ressource in the RERL block
				reader.seek(fieldOffset);
				var handle = readHandle(reader);
				//return reference ? reference.externalFiles[handle] : null;
				return new Kv3Value(Kv3Type.String, reference.externalFiles[handle] ?? '', Kv3Flag.ResourceName);
			case DATA_TYPE_BYTE://10
				return new Kv3Value(Kv3Type.Int32/*TODO: check if there is a better type*/, reader.getInt8(fieldOffset));
			case DATA_TYPE_UBYTE://11
				return new Kv3Value(Kv3Type.UnsignedInt32/*TODO: check if there is a better type*/, reader.getUint8(fieldOffset));
			case DATA_TYPE_SHORT://12
				throw 'fix me';
			//return reader.getInt16(fieldOffset);
			case DATA_TYPE_USHORT://13
				throw 'fix me';
			//return reader.getUint16(fieldOffset);
			case DATA_TYPE_INTEGER://14
				return new Kv3Value(Kv3Type.Int32, reader.getInt32(fieldOffset));
			//return reader.getInt32(fieldOffset);
			case DATA_TYPE_UINTEGER://15
				return new Kv3Value(Kv3Type.UnsignedInt32, reader.getUint32(fieldOffset));
			//return reader.getUint32(fieldOffset);
			case DATA_TYPE_INT64://16
				const i64 = reader.getBigInt64(fieldOffset);
				//return i64;//i64.lo + i64.hi * 4294967295;
				return new Kv3Value(Kv3Type.Int64, i64);
			case DATA_TYPE_UINT64://17
				const ui64 = reader.getBigUint64(fieldOffset);
				//return ui64;//ui64.lo + ui64.hi * 4294967295;
				return new Kv3Value(Kv3Type.UnsignedInt64, ui64);
			case DATA_TYPE_FLOAT://18
				//return reader.getFloat32(fieldOffset);
				return new Kv3Value(Kv3Type.Float, reader.getFloat32(fieldOffset));
			case DATA_TYPE_VECTOR2://21
				throw 'fix me';
			//return reader.getVector2(fieldOffset);
			case DATA_TYPE_VECTOR3://22
				throw 'fix me';
			//return reader.getVector3(fieldOffset);
			case DATA_TYPE_VECTOR4://23
				//return reader.getVector4(fieldOffset);
				return new Kv3Value(Kv3Type.TypedArray2, reader.getVector4(fieldOffset), Kv3Flag.None, Kv3Type.Float);
			case DATA_TYPE_QUATERNION://25
				//return reader.getVector4(fieldOffset);
				return new Kv3Value(Kv3Type.TypedArray2, reader.getVector4(fieldOffset), Kv3Flag.None, Kv3Type.Float);
			case DATA_TYPE_BOOLEAN://30
				throw 'fix me';
			//return (reader.getInt8(fieldOffset)) ? true : false;
			case DATA_TYPE_NAME://31
				var strStart = fieldOffset;//reader.tell();
				var strOffset = reader.getInt32(fieldOffset);
				/*if ((strOffset<0) || (strOffset>10000)) {
					console.log(strOffset);
				}*/
				reader.seek(fieldOffset + strOffset);
				//return reader.getNullString();

				return new Kv3Value(Kv3Type.String, reader.getNullString());
			case 40: //DATA_TYPE_VECTOR4://40
				throw 'fix me';
			//return reader.getVector4(fieldOffset);
			default:
				console.error(`Unknown field type: ${field.type2}`);
		}
	}
	return null;
}
