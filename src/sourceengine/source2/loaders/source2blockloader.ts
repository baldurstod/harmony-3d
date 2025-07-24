import { vec2, vec3, vec4 } from 'gl-matrix';
import { BinaryReader } from 'harmony-binary-reader';
import { MeshoptDecoder } from 'meshoptimizer';
import { INFO, TESTING, VERBOSE } from '../../../buildoptions';
import { decodeLz4 } from '../../../utils/lz4';
import { Zstd } from '../../../utils/zstd';
import { Kv3Element } from '../../common/keyvalue/kv3element';
import { Kv3File } from '../../common/keyvalue/kv3file';
import { Kv3Type, Kv3Value } from '../../common/keyvalue/kv3value';
import { VTEX_FLAG_CUBE_TEXTURE, VTEX_FORMAT_BC4, VTEX_FORMAT_BC5, VTEX_FORMAT_BC7, VTEX_FORMAT_BGRA8888, VTEX_FORMAT_DXT1, VTEX_FORMAT_DXT5, VTEX_FORMAT_PNG_R8G8B8A8_UINT, VTEX_FORMAT_R8, VTEX_FORMAT_R8G8B8A8_UINT } from '../constants';
import { Source2SpriteSheet } from '../textures/source2spritesheet';
import { BinaryKv3Loader } from './binarykv3loader';
import {
	DXGI_FORMAT_R16G16B16A16_SINT,
	DXGI_FORMAT_R16G16_FLOAT,
	DXGI_FORMAT_R16G16_SINT,
	DXGI_FORMAT_R16G16_SNORM,
	DXGI_FORMAT_R32G32B32A32_FLOAT, DXGI_FORMAT_R32G32B32_FLOAT, DXGI_FORMAT_R32G32_FLOAT,
	DXGI_FORMAT_R32_FLOAT,
	DXGI_FORMAT_R32_UINT,
	DXGI_FORMAT_R8G8B8A8_UINT,
	DXGI_FORMAT_R8G8B8A8_UNORM
} from './dxgiformat';
import { Source2File } from './source2file';
import { Source2DataBlock, Source2FileBlock, Source2FileStruct, Source2NtroBlock, Source2RerlBlock, Source2SnapBlock, Source2StructField, Source2StructFieldValue, Source2VtexBlock } from './source2fileblock';

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

function sNormUint16(uint16: number) {
	//https://www.khronos.org/opengl/wiki/Normalized_Integer
	return Math.max(uint16 / 0x7FFF, -1.0);
}

export const Source2BlockLoader = new (function () {
	class Source2BlockLoader {

		async parseBlock(reader: BinaryReader, file: Source2File, block: Source2FileBlock, parseVtex: boolean) {//TODOv3 parseVtex
			const introspection = file.blocks['NTRO'] as Source2NtroBlock;
			const reference = file.blocks['RERL'] as Source2RerlBlock;
			switch (block.type) {
				case 'RERL':
					loadRerl(reader, block as Source2RerlBlock);
					break;
				case 'REDI':
					break;
				case 'NTRO':
					loadNtro(reader, block as Source2NtroBlock);
					break;
				case 'DATA':
				case 'ANIM':
				case 'CTRL':
				case 'MRPH':
				case 'MDAT':
				case 'ASEQ':
				case 'AGRP':
				case 'PHYS':
				case 'LaCo':
					await this.loadData(reader, reference, block, introspection, parseVtex);
					break;
				case 'VBIB':
				case 'MBUF':
					loadVbib(reader, block);
					break;
				case 'SNAP':
					let decodeLength, sa;
					decodeLength = reader.getUint32(block.offset);
					if ((decodeLength >>> 24) == 0x80) {
						//no compression see particles/models/heroes/antimage/antimage_weapon_primary.vsnap_c
						sa = reader.getBytes(decodeLength & 0xFFFFFF);
					} else {
						sa = new Uint8Array(new ArrayBuffer(decodeLength));
						decodeMethod1(reader, sa, decodeLength);
					}
					(block as Source2SnapBlock).datas = sa;
					break;
				default:
					console.info('Unknown block type ' + block.type, block.offset, block.length, block);
			}
		}

		async loadData(reader: BinaryReader, reference: Source2RerlBlock, block: Source2DataBlock, introspection: Source2NtroBlock, parseVtex: boolean) {
			const bytes = reader.getUint32(block.offset);
			switch (bytes) {
				case 0x03564B56: // VKV3
					return loadDataVkv(reader, block);
				case 0x4B563301: // kv31
					return await loadDataKv3(reader, block, 1);
				case 0x4B563302: // kv32 ?? new since wind ranger arcana
					return await loadDataKv3(reader, block, 2);
				case 0x4B563303: // KV3 v3 new since muerta
					return await loadDataKv3(reader, block, 3);
				case 0x4B563304: // KV3 v4 new since dota 7.33
					return await loadDataKv3(reader, block, 4);
				case 0x4B563305: // KV3 v5 new since frostivus 2024
					return await loadDataKv3(reader, block, 5);
				default:
					console.info('Unknown block data type:', bytes);
			}
			if (!introspection || !introspection.structsArray) {
				if (parseVtex) {//TODO
					return loadDataVtex(reader, block as Source2VtexBlock);
				}
				return null;
			}
			block.keyValue = new Kv3File();
			const rootElement = new Kv3Element();
			block.keyValue.setRoot(rootElement);

			const structList = introspection.structsArray;
			let startOffset = block.offset;
			for (let structIndex = 0; structIndex < 1/*removeme*//*structList.length*/; structIndex++) {
				const struct = structList[structIndex];//introspection.firstStruct;
				//block.structs[struct.name] = ;
				rootElement.setProperty(struct.name, loadStruct(reader, reference, struct, block, startOffset, introspection, 0));
				startOffset += struct.discSize;
			}
			if (VERBOSE) {
				console.log(block.structs);
			}
		}
	}
	return Source2BlockLoader;
}());

function ab2str(arrayBuf: Uint8Array) {
	let s = '';
	for (let i = 0; i < arrayBuf.length; i++) {
		s += String.fromCharCode(arrayBuf[i]);
	}
	return s;
}
function loadRerl(reader: BinaryReader, block: Source2RerlBlock) {
	reader.seek(block.offset);
	const resOffset = reader.getInt32();// Seems to be always 0x00000008
	const resCount = reader.getInt32();
	block.externalFiles = {};
	block.externalFiles2 = [];

	reader.seek(block.offset + resOffset);


	for (let resIndex = 0; resIndex < resCount; resIndex++) {
		reader.seek(block.offset + resOffset + 16 * resIndex);
		const handle = readHandle(reader);//reader.getUint64(fieldOffset);
		const strOffset = reader.getInt32();
		reader.skip(strOffset - 4);
		const s = reader.getNullString();
		block.externalFiles[handle] = s;
		block.externalFiles2[resIndex] = s;
	}
}

function readHandle(reader: BinaryReader) {
	let str = '';
	let c;
	let hex;
	for (let i = 0; i < 8; i++) {
		c = reader.getUint8();
		hex = c.toString(16); // convert to hex
		hex = (hex.length == 1 ? '0' + hex : hex);
		str += hex;
	}
	return str;
}

function loadNtro(reader: BinaryReader, block: Source2NtroBlock) {
	const _NTRO_STRUCT_LENGTH_ = 40;
	const _NTRO_FIELD_LENGTH_ = 24;
	reader.seek(block.offset);
	// NTRO header
	const ntroVersion = reader.getInt32();//TODO: check version
	const ntroOffset = reader.getInt32();
	const structCount = reader.getInt32();
	block.structs = {};
	block.structsArray = [];
	block.firstStruct = null;

	for (let structIndex = 0; structIndex < structCount; structIndex++) {
		reader.seek(block.offset + ntroOffset + 4 + _NTRO_STRUCT_LENGTH_ * structIndex);
		const ntroStruct: any = {};
		ntroStruct.version = reader.getInt32();
		//console.log(ntroStruct.version);
		ntroStruct._offset = reader.tell();
		ntroStruct.id = reader.getUint32();
		var strStart = reader.tell();
		var strOffset = reader.getInt32();
		ntroStruct.crc = reader.getInt32();
		ntroStruct.unknown1 = reader.getInt32();
		ntroStruct.discSize = reader.getInt16();
		ntroStruct.unknown = reader.getInt16();//TODO

		ntroStruct.baseId = reader.getUint32();
		const fieldStart = reader.tell();
		const fieldOffset = reader.getInt32();
		const fieldCount = reader.getInt32();
		ntroStruct.flags = reader.getInt32();

		// Read struct Name
		reader.seek(strStart + strOffset);
		ntroStruct.name = reader.getNullString();

		//Read struct fields
		ntroStruct.fields = [];
		for (let fieldIndex = 0; fieldIndex < fieldCount; fieldIndex++) {
			reader.seek(fieldStart + fieldOffset + _NTRO_FIELD_LENGTH_ * fieldIndex);
			const field: any = {};
			field._offset = fieldStart + fieldOffset + _NTRO_FIELD_LENGTH_ * fieldIndex;
			var strStart = reader.tell();
			var strOffset = reader.getInt32();
			field.count = reader.getInt16();
			field.offset = reader.getInt16();
			const indStart = reader.tell();
			field.indirectionOffset = reader.getInt32();
			field.level = reader.getInt32();
			field.typeOffset = reader.tell();
			field.type = reader.getUint32();
			field.type2 = reader.getUint16();

			// Read field Name
			reader.seek(strStart + strOffset);
			field.name = reader.getNullString();

			ntroStruct.fields.push(field);

			if (field.indirectionOffset) {
				field.indirectionByte = reader.getInt8(indStart + field.indirectionOffset);
				field.indirectionByte1 = indStart + field.indirectionOffset;//TODO: wtf ?
			}
		}

		block.structs[ntroStruct.id] = ntroStruct;
		block.structsArray.push(ntroStruct);
		if (block.firstStruct == null) {
			block.firstStruct = ntroStruct;
		}
	}
}

const defaultValuesPosition = vec3.create();
const defaultValuesNormal = vec3.create();
const defaultValuesTangent = vec4.create();
const defaultValuesCoord = vec2.create();
const defaultValuesBoneIndice = vec4.create();
const defaultValuesBoneWeight = vec4.fromValues(1.0, 0, 0, 0);
const VERTEX_POSITION_LEN = 3;
const VERTEX_NORMAL_LEN = 4;
const VERTEX_TANGENT_LEN = 4;
const VERTEX_COORD_LEN = 2;
const VERTEX_BONE_INDICE_LEN = 4;
const VERTEX_BONE_WEIGHT_LEN = 4;

const BYTES_PER_VERTEX_POSITION = VERTEX_POSITION_LEN * 4;
const BYTES_PER_VERTEX_NORMAL = VERTEX_NORMAL_LEN * 4;
const BYTES_PER_VERTEX_TANGENT = VERTEX_TANGENT_LEN * 4;
const BYTES_PER_VERTEX_COORD = VERTEX_COORD_LEN * 4;
const BYTES_PER_VERTEX_BONE_INDICE = VERTEX_BONE_INDICE_LEN * 4;
const BYTES_PER_VERTEX_BONE_WEIGHT = VERTEX_BONE_WEIGHT_LEN * 4;
const BYTES_PER_INDEX = 1 * 4;
function loadVbib(reader: BinaryReader, block: Source2FileBlock) {

	const VERTEX_HEADER_SIZE = 24;
	const INDEX_HEADER_SIZE = 24;
	const DESC_HEADER_SIZE = 56;
	const DESC_HEADER_NAME_SIZE = 36;
	reader.seek(block.offset);
	const vertexOffset = reader.tell() + reader.getInt32();
	const vertexCount = reader.getInt32();
	const indexOffset = reader.tell() + reader.getInt32();
	const indexCount = reader.getInt32();

	block.vertices = [];
	block.indices = [];

	for (var i = 0; i < vertexCount; i++) { // header size: 24 bytes
		reader.seek(vertexOffset + i * VERTEX_HEADER_SIZE);
		const s1: any = {};
		s1.vertexCount = reader.getInt32();
		s1.bytesPerVertex = reader.getInt16();
		reader.skip(2);// TODO: figure out what it is. Used to be 0, now 1024 for pudge model spring 2025
		s1.headerOffset = reader.tell() + reader.getInt32();
		s1.headerCount = reader.getInt32();
		s1.dataOffset = reader.tell() + reader.getInt32();
		s1.dataLength = reader.getInt32();

		const vertexDataSize = s1.vertexCount * s1.bytesPerVertex;

		let vertexReader = reader;
		if (vertexDataSize != s1.dataLength) {
			const vertexBuffer = new Uint8Array(new ArrayBuffer(vertexDataSize));
			MeshoptDecoder.decodeVertexBuffer(vertexBuffer, s1.vertexCount, s1.bytesPerVertex, new Uint8Array(reader.buffer.slice(s1.dataOffset, s1.dataOffset + s1.dataLength)));
			//SaveFile('sa.obj', new Blob([vertexBuffer]));
			vertexReader = new BinaryReader(vertexBuffer);
			s1.dataOffset = 0;
		}

		s1.headers = [];
		for (let j = 0; j < s1.headerCount; j++) { // header size: 24 bytes
			const header: any = {};
			const headerOffset = s1.headerOffset + j * DESC_HEADER_SIZE;
			reader.seek(headerOffset);
			header.name = reader.getNullString();
			reader.seek(headerOffset + DESC_HEADER_NAME_SIZE);
			header.type = reader.getUint32();
			header.offset = reader.getUint32();

			s1.headers.push(header);
		}

		s1.vertices = new ArrayBuffer(s1.vertexCount * BYTES_PER_VERTEX_POSITION);
		s1.normals = new ArrayBuffer(s1.vertexCount * BYTES_PER_VERTEX_NORMAL);
		s1.tangents = new ArrayBuffer(s1.vertexCount * BYTES_PER_VERTEX_TANGENT);
		s1.coords = new ArrayBuffer(s1.vertexCount * BYTES_PER_VERTEX_COORD);
		s1.boneIndices = new ArrayBuffer(s1.vertexCount * BYTES_PER_VERTEX_BONE_INDICE);
		s1.boneWeight = new ArrayBuffer(s1.vertexCount * BYTES_PER_VERTEX_BONE_WEIGHT);

		const s1Vertices = new Float32Array(s1.vertices);
		const s1Normals = new Float32Array(s1.normals);
		const s1Tangents = new Float32Array(s1.tangents);
		const s1Coords = new Float32Array(s1.coords);
		const s1BoneIndices = new Float32Array(s1.boneIndices);
		const s1BoneWeight = new Float32Array(s1.boneWeight);
		for (let vertexIndex = 0; vertexIndex < s1.vertexCount; vertexIndex++) {
			vertexReader.seek(s1.dataOffset + vertexIndex * s1.bytesPerVertex);
			var vertex = {};

			let positionFilled = false;//TODOv3: remove this
			let normalFilled = false;
			let tangentFilled = false;
			let texCoordFilled = false;
			let blendIndicesFilled = false;
			let blendWeightFilled = false;
			for (let headerIndex = 0; headerIndex < s1.headers.length; headerIndex++) {
				const headerName = s1.headers[headerIndex].name;
				const headerType = s1.headers[headerIndex].type;
				let tempValue: number[] | vec2 | vec3 | vec4;// = vec4.create();//TODO: optimize


				vertexReader.seek(s1.dataOffset + vertexIndex * s1.bytesPerVertex + s1.headers[headerIndex].offset);
				switch (headerType) {
					case DXGI_FORMAT_R32G32B32A32_FLOAT:
						tempValue = vec4.create();//TODO: optimize
						tempValue[0] = vertexReader.getFloat32();
						tempValue[1] = vertexReader.getFloat32();
						tempValue[2] = vertexReader.getFloat32();
						tempValue[3] = vertexReader.getFloat32();
						break;
					case DXGI_FORMAT_R32G32B32_FLOAT:// 3 * float32
						tempValue = vec3.create();//TODO: optimize
						tempValue[0] = vertexReader.getFloat32();
						tempValue[1] = vertexReader.getFloat32();
						tempValue[2] = vertexReader.getFloat32();
						break;
					case DXGI_FORMAT_R16G16B16A16_SINT:
						tempValue = vec4.create();//TODO: optimize
						tempValue[0] = vertexReader.getInt16();
						tempValue[1] = vertexReader.getInt16();
						tempValue[2] = vertexReader.getInt16();
						tempValue[3] = vertexReader.getInt16();
						break;
					case DXGI_FORMAT_R32G32_FLOAT:// 2 * float32
						tempValue = vec2.create();//TODO: optimize
						tempValue[0] = vertexReader.getFloat32();
						tempValue[1] = vertexReader.getFloat32();
						break;
					case DXGI_FORMAT_R8G8B8A8_UNORM:
						tempValue = vec4.create();//TODO: optimize
						tempValue[0] = vertexReader.getUint8() / 255;
						tempValue[1] = vertexReader.getUint8() / 255;
						tempValue[2] = vertexReader.getUint8() / 255;
						tempValue[3] = vertexReader.getUint8() / 255;
						//vertexReader.getUint8();
						break;
					case DXGI_FORMAT_R8G8B8A8_UINT:// 4 * uint8
						tempValue = vec4.create();//TODO: optimize
						tempValue[0] = vertexReader.getUint8();
						tempValue[1] = vertexReader.getUint8();
						tempValue[2] = vertexReader.getUint8();
						tempValue[3] = vertexReader.getUint8();
						break;
					case DXGI_FORMAT_R16G16_FLOAT:// 2 * float16
						tempValue = vec2.create();//TODO: optimize
						tempValue[0] = vertexReader.getFloat16();
						tempValue[1] = vertexReader.getFloat16();
						break;
					case DXGI_FORMAT_R16G16_SNORM://New with battlepass 2022
						tempValue = vec2.create();//TODO: optimize
						tempValue[0] = sNormUint16(vertexReader.getInt16());
						tempValue[1] = sNormUint16(vertexReader.getInt16());
						break;
					case DXGI_FORMAT_R16G16_SINT:
						tempValue = vec2.create();//TODO: optimize
						tempValue[0] = vertexReader.getInt16();
						tempValue[1] = vertexReader.getInt16();
						break;
					case DXGI_FORMAT_R32_FLOAT:// single float32 ??? new in half-life Alyx
						tempValue = [];
						tempValue[0] = vertexReader.getFloat32();
						break;
					case DXGI_FORMAT_R32_UINT: // single uint32 ??? new since DOTA2 2023_08_30
						tempValue = [];
						tempValue[0] = vertexReader.getUint32();
						s1.decompressTangentV2 = true;
						break;
					default:
						//TODO add types when needed. see DxgiFormat.js
						console.error('Warning: unknown type ' + headerType + ' for value ' + headerName);
						tempValue = vec4.create();//TODO: optimize
						tempValue[0] = 0;
						tempValue[1] = 0;
						tempValue[2] = 0;
						tempValue[3] = 0;
				}

				switch (headerName) {
					case 'POSITION':
						s1Vertices.set(tempValue, vertexIndex * VERTEX_POSITION_LEN);
						positionFilled = true;
						break;
					case 'NORMAL':
						s1Normals.set(tempValue, vertexIndex * VERTEX_NORMAL_LEN);//TODOv3
						normalFilled = true;
						break;
					case 'TANGENT':
						s1Tangents.set(tempValue, vertexIndex * VERTEX_NORMAL_LEN);//TODOv3
						tangentFilled = true;
						break;
					case 'TEXCOORD':
						if (!texCoordFilled) {//TODO: handle 2 TEXCOORD
							const test = vec2.clone(tempValue as vec2);//todov3: fixme see //./Alyx/models/props_industrial/hideout_doorway.vmdl_c
							s1Coords.set(test/*tempValue*/, vertexIndex * VERTEX_COORD_LEN);
							texCoordFilled = true;
						}
						break;
					case 'BLENDINDICES':
						/*s1.boneIndices.push(tempValue[0]);
						s1.boneIndices.push(tempValue[1]);
						s1.boneIndices.push(tempValue[2]);
						s1.boneIndices.push(tempValue[3]);*/
						s1BoneIndices.set(tempValue, vertexIndex * VERTEX_BONE_INDICE_LEN);
						blendIndicesFilled = true;
						break;
					case 'BLENDWEIGHT':
						/*s1.boneWeight.push(tempValue[0]);
						s1.boneWeight.push(tempValue[1]);
						s1.boneWeight.push(tempValue[2]);
						s1.boneWeight.push(tempValue[3]);*/
						//vec4.scale(tempValue, tempValue, 1 / 255.0);
						s1BoneWeight.set(tempValue, vertexIndex * VERTEX_BONE_WEIGHT_LEN);
						blendWeightFilled = true;
						break;
					//TODOv3: add "texcoord" lowercase maybe a z- tex coord ?
				}
			}

			//TODOv3: remove this
			if (!positionFilled) {
				/*s1.vertices.push(0);
				s1.vertices.push(0);
				s1.vertices.push(0);*/
				s1Vertices.set(defaultValuesPosition, vertexIndex * VERTEX_POSITION_LEN);
			}
			if (!normalFilled) {
				/*s1.normals.push(0);
				s1.normals.push(0);
				s1.normals.push(0);*/
				s1Normals.set(defaultValuesNormal, vertexIndex * VERTEX_NORMAL_LEN);
			}
			if (!tangentFilled) {
				s1Tangents.set(defaultValuesTangent, vertexIndex * VERTEX_TANGENT_LEN);
			}
			if (!texCoordFilled) {
				/*s1.coords.push(0);
				s1.coords.push(0);*/
				s1Coords.set(defaultValuesCoord, vertexIndex * VERTEX_COORD_LEN);
			}
			if (!blendIndicesFilled) {
				/*s1.boneIndices.push(0);
				s1.boneIndices.push(0);
				s1.boneIndices.push(0);
				s1.boneIndices.push(0);*/
				s1BoneIndices.set(defaultValuesBoneIndice, vertexIndex * VERTEX_BONE_INDICE_LEN);
			}
			if (!blendWeightFilled) {
				/*s1.boneWeight.push(255);
				s1.boneWeight.push(0);
				s1.boneWeight.push(0);
				s1.boneWeight.push(0);*/
				s1BoneWeight.set(defaultValuesBoneWeight, vertexIndex * VERTEX_BONE_WEIGHT_LEN);
			}

		}
		if (VERBOSE) {
			console.log(s1.normals[0], s1.normals[1], s1.normals[2]);
		}
		block.vertices.push(s1);
	}

	//console.log(block.vertices);

	for (var i = 0; i < indexCount; i++) { // header size: 24 bytes
		reader.seek(indexOffset + i * INDEX_HEADER_SIZE);
		const s2: any = {};
		s2.indexCount = reader.getInt32();
		s2.bytesPerIndex = reader.getInt32();
		s2.headerOffset = reader.tell() + reader.getInt32();
		s2.headerCount = reader.getInt32();
		s2.dataOffset = reader.tell() + reader.getInt32();
		s2.dataLength = reader.getInt32();

		const indexDataSize = s2.indexCount * s2.bytesPerIndex;

		let indexReader = reader;
		if (indexDataSize != s2.dataLength) {
			const indexBuffer = new Uint8Array(new ArrayBuffer(indexDataSize));
			MeshoptDecoder.decodeIndexBuffer(indexBuffer, s2.indexCount, s2.bytesPerIndex, new Uint8Array(reader.buffer.slice(s2.dataOffset, s2.dataOffset + s2.dataLength)));
			indexReader = new BinaryReader(indexBuffer);
			s2.dataOffset = 0;
		}

		s2.indices = new ArrayBuffer(s2.indexCount * BYTES_PER_INDEX);
		const s2Indices = new Uint32Array(s2.indices);
		for (let indicesIndex = 0; indicesIndex < s2.indexCount; indicesIndex++) {
			indexReader.seek(s2.dataOffset + indicesIndex * s2.bytesPerIndex);
			var vertex = {};
			//s2.indices.push(indexReader.getUint16());
			if (s2.bytesPerIndex == 2) {
				s2Indices[indicesIndex] = indexReader.getUint16();
			} else {
				s2Indices[indicesIndex] = indexReader.getUint32();
			}
		}

		block.indices.push(s2);
	}
}

function getStruct(block: Source2NtroBlock, structId: number) {
	return block.structs?.[structId];
}

function loadStruct(reader: BinaryReader, reference: Source2RerlBlock, struct: Source2FileStruct, block: Source2DataBlock | null, startOffset: number, introspection: Source2NtroBlock, depth: number): Kv3Element {
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
		const field = fieldList[fieldIndex];
		if (field.count) {
			const data: number[] = /*dataStruct[field.name]*/[];
			const fieldSize = FIELD_SIZE[field.type2];
			for (let i = 0; i < field.count; i++) {
				data.push(255);//TODOv3 dafuck ?
			}
			element.setProperty(field.name, new Kv3Value(Kv3Type.TypedArray, data, Kv3Type.UnsignedInt32));
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
const FIELD_SIZE = [0, 0/*STRUCT*/, 0/*ENUM*/, 8/*HANDLE*/, 0, 0, 0, 0, 0, 0,
	1/*BYTE*/, 1/*BYTE*/, 2/*SHORT*/, 2/*SHORT*/, 4/*INTEGER*/, 4/*INTEGER*/, 8/*INT64*/, 8/*INT64*/,
	4/*FLOAT*/, 0, 0, 0, 12/*VECTOR3*/, 0, 0, 16/*QUATERNION*/, 0, 16, 4, 0, 1, 4];

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
				const values = [];
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
							return new Kv3Value(Kv3Type.TypedArray, values, Kv3Type.Element);
						} else {
							console.log('Unknown struct ' + field.type, fieldOffset);
						}
					} else if (field.type2 == DATA_TYPE_HANDLE) { // HANDLE
						// Handle to an external ressource in the RERL block
						for (var i = 0; i < arrayCount; i++) {
							var pos = arrayOffset + 8 * i;
							reader.seek(pos);
							var handle = readHandle(reader);
							values[i] = reference ? reference.externalFiles[handle] : '';
						}
						//reader.seek(fieldOffset);
						//var handle = readHandle(reader);
						//return values;//this.reference.externalFiles[handle];
						return new Kv3Value(Kv3Type.TypedArray, values, Kv3Type.String);
					} else {
						console.log('Unknown struct type for array ' + field, fieldOffset);
					}
				} else {
					// single field
					const values: (Kv3Element | Kv3Value | null)[] = [];
					const fieldSize = FIELD_SIZE[field.type2];
					if (field.type2 == 11) {
						//console.log(field.type2);//TODOV2
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
				return ['enum', field.name, field.type2, fieldOffset, reader.getInt32(fieldOffset)];
			case DATA_TYPE_HANDLE://3
				// Handle to an external ressource in the RERL block
				reader.seek(fieldOffset);
				var handle = readHandle(reader);
				//return reference ? reference.externalFiles[handle] : null;
				return new Kv3Value(Kv3Type.Resource, reference ? reference.externalFiles[handle] : '');
			case DATA_TYPE_BYTE://10
				return new Kv3Value(Kv3Type.Int32/*TODO: check if there is a better type*/, reader.getInt8(fieldOffset));
			case DATA_TYPE_UBYTE://11
				return new Kv3Value(Kv3Type.UnsignedInt32/*TODO: check if there is a better type*/, reader.getUint8(fieldOffset));
			case DATA_TYPE_SHORT://12
				throw 'fix me';
				return reader.getInt16(fieldOffset);
			case DATA_TYPE_USHORT://13
				throw 'fix me';
				return reader.getUint16(fieldOffset);
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
				return reader.getVector2(fieldOffset);
			case DATA_TYPE_VECTOR3://22
				throw 'fix me';
				return reader.getVector3(fieldOffset);
			case DATA_TYPE_VECTOR4://23
				//return reader.getVector4(fieldOffset);
				return new Kv3Value(Kv3Type.TypedArray2, reader.getVector4(fieldOffset), Kv3Type.Float);
			case DATA_TYPE_QUATERNION://25
				//return reader.getVector4(fieldOffset);
				return new Kv3Value(Kv3Type.TypedArray2, reader.getVector4(fieldOffset), Kv3Type.Float);
			case DATA_TYPE_BOOLEAN://30
				throw 'fix me';
				return (reader.getInt8(fieldOffset)) ? true : false;
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
				return reader.getVector4(fieldOffset);
			default:
				console.error(`Unknown field type: ${field.type2}`);
		}
	}
	return null;
}

function loadDataVtex(reader: BinaryReader, block: Source2VtexBlock) {
	const DATA_UNKNOWN = 0;
	const DATA_FALLBACK_BITS = 1;
	const DATA_SHEET = 2;
	const DATA_FILL_TO_POWER_OF_TWO = 3;
	const DATA_COMPRESSED_MIP_SIZE = 4;
	const DATA_CUBEMAP_RADIANCE = 5;
	reader.seek(block.offset);
	block.vtexVersion = reader.getUint16();
	block.flags = reader.getUint16();

	block.reflectivity = reader.getVector4();

	block.width = reader.getUint16();
	block.height = reader.getUint16();
	block.depth = reader.getUint16();
	block.imageFormat = reader.getUint8();
	block.numMipLevels = reader.getUint8();
	block.picmip0Res = reader.getUint32();

	const extraDataOffset = reader.tell() + reader.getUint32();
	const extraDataCount = reader.getUint32();

	let nonPow2Width = 0;
	let nonPow2Height = 0;
	let compressedMips = null;//new Uint32Array(mips);

	if (extraDataCount) {
		/* read headers */
		const headers = [];
		for (let i = 0; i < extraDataCount; i++) {
			const h = {
				type: reader.getUint32(),
				offset: reader.tell() + reader.getUint32(),
				size: reader.getUint32(),
			};
			headers.push(h);
		}


		for (let i = 0; i < extraDataCount; i++) {
			const h = headers[i];
			const type = h.type;
			const offset = h.offset;
			const size = h.size;
			reader.seek(offset);

			switch (type) {
				case DATA_FALLBACK_BITS:
					reader.seek(offset + size);
					break;
				case DATA_FILL_TO_POWER_OF_TWO:
					const unk = reader.getUint16();
					const nw = reader.getUint16();
					const nh = reader.getUint16();
					if (nw > 0 && nh > 0 && block.width >= nw && block.height >= nh) {
						console.error('code me');
						nonPow2Width = nw;
						nonPow2Height = nh;
					}
					break;
				case DATA_COMPRESSED_MIP_SIZE:
					const unk1 = reader.getUint32();
					const unk2 = reader.getUint32();
					const mips = reader.getUint32();
					compressedMips = new Array(mips);// we can't upe pop() on a Uint32Array

					for (let i = 0; i < mips; i++) {
						compressedMips[i] = reader.getUint32();
					}
					console.warn(`compressed mips : ${unk1} ${unk2} ${mips}`, compressedMips);
					break;
				case DATA_SHEET:
					loadVtexSpriteSheet(reader, block, offset, size);
					/*if (TESTING) {
						SaveFile(new File([new Blob([reader.getBytes(size, offset)])], 'block_' + size + '_' + offset));
					}*/
					break;
				case DATA_CUBEMAP_RADIANCE:
					loadVtexCubemapRadiance(reader, block, offset, size);
					break;
				default:
					/*if (TESTING) {
						SaveFile(new File([new Blob([reader.getBytes(size, offset)])], 'block_' + size + '_' + offset));
					}*/
					console.error(`Unknown type : ${type}`);
			}
		}
	}

	loadDataVtexImageData(reader, block, compressedMips);
}

function loadDataVtexImageData(reader: BinaryReader, block: Source2VtexBlock, compressedMips: number[] | null) {
	let faceCount = 1;
	if ((block.flags & VTEX_FLAG_CUBE_TEXTURE) == VTEX_FLAG_CUBE_TEXTURE) { // Handle cube texture
		faceCount = 6;
	}

	// Goto
	reader.seek(block.file.fileLength);
	let mipmapWidth = block.width * Math.pow(0.5, block.numMipLevels - 1);
	let mipmapHeight = block.height * Math.pow(0.5, block.numMipLevels - 1);
	block.imageData = [];

	// Only keep last (biggest) mipmap
	for (let mipmapIndex = 0; mipmapIndex < block.numMipLevels; mipmapIndex++) {
		// Todo : add frame support + depth support
		for (let faceIndex = 0; faceIndex < faceCount; faceIndex++) {
			const compressedLength = compressedMips?.pop() ?? null; //TODO: check how this actually works with depth / frames
			block.imageData[faceIndex] = getImage(reader, mipmapWidth, mipmapHeight, block.imageFormat, compressedLength);
			if (false && block.imageFormat == VTEX_FORMAT_BC4) {//TODOv3: removeme
				const str = block.imageData[faceIndex];
				if (str.length >= 512 * 512) {
					/*const buf = new ArrayBuffer(str.length);
					const bufView = new Uint8Array(buf);
					for (let i = 0, strLen = str.length; i < strLen; i ++) {
						bufView[i] = str.charCodeAt(i);
					}*/
					//SaveFile('vtex' + str.length, str);
				}
			}
		}
		mipmapWidth *= 2;
		mipmapHeight *= 2;
	}
}

function getImage(reader: BinaryReader, mipmapWidth: number, mipmapHeight: number, imageFormat: number/*TODO: create enum*/, compressedLength: number | null) {
	let entrySize = 0;
	switch (imageFormat) {
		case VTEX_FORMAT_DXT1:
			entrySize = Math.max(mipmapWidth * mipmapHeight * 0.5, 8); // 0.5 byte per pixel
			break;
		case VTEX_FORMAT_DXT5:
			entrySize = Math.max(mipmapWidth, 4) * Math.max(mipmapHeight, 4); // 1 byte per pixel
			break;
		case VTEX_FORMAT_R8:
			entrySize = Math.max(mipmapWidth, 1) * Math.max(mipmapHeight, 1); // 1 byte per pixel;
			break;
		case VTEX_FORMAT_R8G8B8A8_UINT:
		case VTEX_FORMAT_BGRA8888:
			// 4 bytes per pixel
			entrySize = mipmapWidth * mipmapHeight * 4;
			break;
		case VTEX_FORMAT_PNG_R8G8B8A8_UINT:
			entrySize = reader.byteLength - reader.tell();
			const a = reader.tell();
			//SaveFile('loadout.obj', b64toBlob(encode64(reader.getString(entrySize))));//TODOv3: removeme
			reader.seek(a);
			break;
		case VTEX_FORMAT_BC4:
		case VTEX_FORMAT_BC5:
			entrySize = Math.ceil(mipmapWidth / 4) * Math.ceil(mipmapHeight / 4) * 8;// 0.5 byte per pixel
			break;
		case VTEX_FORMAT_BC7:
			entrySize = Math.max(mipmapWidth, 4) * Math.max(mipmapHeight, 4);// 1 byte per pixel, blocks of 16 bytes
			break;
		default:
			console.warn('Unknown image format ' + imageFormat, reader, mipmapWidth, mipmapHeight, compressedLength);
	}
	let imageDatas;
	if (compressedLength === null || compressedLength === entrySize) {
		const start = reader.tell();
		//return reader.getString(entrySize);
		imageDatas = new Uint8Array(reader.buffer, reader.tell(), entrySize);
		reader.seek(start + entrySize);
	} else {
		const start = reader.tell();
		const buf = new ArrayBuffer(entrySize);
		imageDatas = new Uint8Array(buf);
		decodeLz4(reader, imageDatas, compressedLength, entrySize);
		reader.seek(start + compressedLength);// decoder may overread, place the reader at the start of the next image block
		if ((start + compressedLength) != reader.tell()) {
			console.error('error decoding texture: wrong decompressed size: ', start, compressedLength, entrySize);
		}
	}

	if (imageDatas && imageFormat == VTEX_FORMAT_BGRA8888) {
		for (let i = 0, l = imageDatas.length; i < l; i += 4) {
			const b = imageDatas[i];
			imageDatas[i] = imageDatas[i + 2];
			imageDatas[i + 2] = b;
		}
	}

	return imageDatas;
}

//KV3_ENCODING_BLOCK_COMPRESSED = '\x46, \x1A, \x79, \x95, \xBC, \x95, \x6C, \x4F, \xA7, \x0B, \x05, \xBC, \xA1, \xB7, \xDF, \xD2';
function loadDataVkv(reader: BinaryReader, block: Source2FileBlock) {
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
				decodeMethod1(reader, sa, decodeLength);
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
	block.keyValue = BinaryKv3Loader.getBinaryVkv3(ab2str(sa));
}



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

async function loadDataKv3(reader: BinaryReader, block: Source2FileBlock, version: number) {
	const KV3_ENCODING_BLOCK_COMPRESSED = '\x46\x1A\x79\x95\xBC\x95\x6C\x4F\xA7\x0B\x05\xBC\xA1\xB7\xDF\xD2';
	const KV3_ENCODING_BLOCK_COMPRESSED_LZ4 = '\x8A\x34\x47\x68\xA1\x63\x5C\x4F\xA1\x97\x53\x80\x6F\xD9\xB1\x19';
	const KV3_ENCODING_BLOCK_COMPRESSED_UNKNOWN = '\x7C\x16\x12\x74\xE9\x06\x98\x46\xAF\xF2\xE6\x3E\xB5\x90\x37\xE7';

	reader.seek(block.offset);

	const method = 1;
	let bufferCount = 1;
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
				sa = reader.getBytes(uncompressedBufferSize[i]);
				break;
			case 1:
				const buf = new ArrayBuffer(uncompressedBufferSize[i]);
				sa = new Uint8Array(buf);
				if (blobCount > 0) {
					compressedBlobReader = new BinaryReader(reader, reader.tell() + compressedBufferSize[i]);
				}
				decodeLz4(reader, sa, compressedBufferSize[i], uncompressedBufferSize[i]);
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
				const compressedBytes = reader.getBytes(compressedBufferSize[i]);
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
							const compressedBlobSize = compressedLength - (compressedBufferSize[0] + compressedBufferSize[1]);
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
			i, stringDictionary, objectCount[i], arrayCount[i], buffer0);
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

function decodeMethod1(reader: BinaryReader, sa: Uint8Array, decodeLength: number) {
	let mask = null;

	let outputIndex = 0;
	let decodedeBytes = 0;

	decodeLoop:
	for (let i = 0; ; i++) {
		mask = reader.getUint16();
		if (mask == 0) {
			/* TODO: copy 16 bytes at once */
			for (let j = 0; j < 16; j++) {
				sa[outputIndex++] = reader.getBytes(1)[0];
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
						sa[outputIndex] = sa[outputIndex - decodeOffset - 1];
						++decodedeBytes;
						if (decodedeBytes >= decodeLength) {
							break decodeLoop;
						}
						++outputIndex;
					}

				} else { // Single byte
					sa[outputIndex++] = reader.getBytes(1)[0];
					++decodedeBytes;
					if (decodedeBytes >= decodeLength) {
						break decodeLoop;
					}
				}
			}
		}
	}
}

function loadVtexSpriteSheet(reader: BinaryReader, block: Source2VtexBlock, offset: number, size: number) {
	reader.seek(offset);
	const version = reader.getUint32();
	let sequenceCount = reader.getUint32();

	let headerOffset = reader.tell();
	const spriteSheet = new Source2SpriteSheet();
	block.spriteSheet = spriteSheet;

	while (sequenceCount--) {
		const spriteSheetSequence = spriteSheet.addSequence();
		const sequenceId = reader.getUint32(headerOffset);
		const unknown1 = reader.getUint32();//1 ? probably some flag -> clamp //0 in materials/particle/water_ripples/allripples
		//unknown1 is most likely 2 uint16 -> see dota2 texture materials/particle/smoke3/smoke3b
		const sequenceDataOffset = reader.tell() + reader.getUint32();
		const frameCount = reader.getUint32();
		spriteSheetSequence.duration = reader.getFloat32();
		const unknown2 = reader.getUint32();//offset to 'CDmeSheetSequence'
		const unknown3 = reader.getUint32();//0
		const unknown4 = reader.getUint32();//0
		headerOffset = reader.tell();

		reader.seek(sequenceDataOffset);

		let frameHeaderOffset = reader.tell();
		let frameIndex = frameCount;
		while (frameIndex--) {
			const spriteSheetFrame = spriteSheetSequence.addFrame();
			spriteSheetFrame.duration = reader.getFloat32(frameHeaderOffset);
			const frameOffset = reader.tell() + reader.getUint32();
			const frameCoords = reader.getUint32();
			frameHeaderOffset = reader.tell();

			reader.seek(frameOffset);
			//while (frameCoords--) we should use all coords but they are identical ? probably one per channel
			{
				spriteSheetFrame.coords[0] = reader.getFloat32();
				spriteSheetFrame.coords[1] = reader.getFloat32();
				spriteSheetFrame.coords[2] = reader.getFloat32();
				spriteSheetFrame.coords[3] = reader.getFloat32();
			}
		}

		//console.error(sequenceId, frameCount, spriteSheetSequence.duration, sequenceDataOffset);
		//console.error(unknown1, unknown2, unknown3, unknown4);

	}
	//console.error(version, sequenceCount);
}

function loadVtexCubemapRadiance(reader: BinaryReader, block: Source2VtexBlock, offset: number, size: number) {
	reader.seek(offset);
	const coeffOffset = reader.getUint32();
	const coeffCount = reader.getUint32();

	//Spherical Harmonics
	const coefficients: number[] = new Array(coeffCount);

	reader.seek(offset + coeffOffset);

	for (let i = 0; i < coeffCount; i++) {
		coefficients[i] = reader.getFloat32();
	}

	block.cubemapRadiance = coefficients;
}
