import { vec2, vec3, vec4 } from 'gl-matrix';
import { BinaryReader } from 'harmony-binary-reader';
import { MeshoptDecoder } from 'meshoptimizer';
import { INFO, TESTING, VERBOSE } from '../../../buildoptions';
import { decodeLz4 } from '../../../utils/lz4';
import { Zstd } from '../../../utils/zstd';
import { Kv3Element } from '../../common/keyvalue/kv3element';
import { Kv3File } from '../../common/keyvalue/kv3file';
import { Kv3Type, Kv3Value } from '../../common/keyvalue/kv3value';
import { VTEX_FLAG_CUBE_TEXTURE, VTEX_FORMAT_BGRA8888 } from '../constants';
import { Source2SpriteSheet } from '../textures/source2spritesheet';
import { Source2Texture, VtexImageFormat } from '../textures/source2texture';
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
import { Source2DataBlock, Source2FileBlock, Source2FileStruct, Source2NtroBlock, Source2RerlBlock, Source2SnapBlock, Source2StructField, Source2VtexBlock } from './source2fileblock';
import { decodeBlockCompressed } from './blocks/kv3/blockcompressed';
import { loadDataVkv } from './blocks/kv3/vkv';
import { loadDataKv3 } from './blocks/kv3/kv3';
import { loadDataVtex } from './blocks/vtex';
import { loadStruct } from './blocks/structs';
import { readHandle } from './blocks/handle';
import { loadData } from './blocks/data';
import { loadRedi } from './blocks/redi';


export function sNormUint16(uint16: number) {
	//https://www.khronos.org/opengl/wiki/Normalized_Integer
	return Math.max(uint16 / 0x7FFF, -1.0);
}

export type Source2BlockLoaderContext = {
	meshIndex: number;
}

export const Source2BlockLoader = new (function () {
	class Source2BlockLoader {

		async parseBlock(reader: BinaryReader, file: Source2File, block: Source2FileBlock, parseVtex: boolean, context: Source2BlockLoaderContext) {//TODOv3 parseVtex
			const introspection = file.blocks['NTRO'] as Source2NtroBlock;
			const reference = file.blocks['RERL'] as Source2RerlBlock;
			switch (block.type) {
				case 'RERL':
					loadRerl(reader, block as Source2RerlBlock);
					break;
				case 'NTRO':
					loadNtro(reader, block as Source2NtroBlock);
					break;
				//case 'DATA':
				case 'ANIM':
				case 'CTRL':
				case 'MRPH':
				case 'MDAT':
				case 'ASEQ':
				case 'AGRP':
				case 'PHYS':
				case 'LaCo':
					await loadData(reader, file, reference, block, introspection, false);
					break;
				case 'DATA':
					await loadData(reader, file, reference, block, introspection, parseVtex);
					break
				case 'REDI':
				case 'RED2':
					await loadRedi(reader, file, reference, block, introspection, false);
					break;
				case 'VBIB':
				case 'MBUF':
					loadVbib(reader, block, context.meshIndex++);
					break;
				case 'SNAP':
					let decodeLength, sa;
					decodeLength = reader.getUint32(block.offset);
					if ((decodeLength >>> 24) == 0x80) {
						//no compression see particles/models/heroes/antimage/antimage_weapon_primary.vsnap_c
						sa = reader.getBytes(decodeLength & 0xFFFFFF);
					} else {
						sa = new Uint8Array(new ArrayBuffer(decodeLength));
						decodeBlockCompressed(reader, sa, decodeLength);
					}
					(block as Source2SnapBlock).datas = sa;
					break;
				case 'MVTX':
				case 'MIDX':
					// Loaded along CTRL block
					break;
				default:
					console.info('Unknown block type ' + block.type, block.offset, block.length, block);
			}
		}
	}
	return Source2BlockLoader;
}());

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

export const defaultValuesPosition = vec3.create();
export const defaultValuesNormal = vec3.create();
export const defaultValuesTangent = vec4.create();
export const defaultValuesCoord = vec2.create();
export const defaultValuesBoneIndice = vec4.create();
export const defaultValuesBoneWeight = vec4.fromValues(1.0, 0, 0, 0);

export const VERTEX_POSITION_LEN = 3;
export const VERTEX_NORMAL_LEN = 4;
export const VERTEX_TANGENT_LEN = 4;
export const VERTEX_COORD_LEN = 2;
export const VERTEX_BONE_INDICE_LEN = 4;
export const VERTEX_BONE_WEIGHT_LEN = 4;

export const BYTES_PER_VERTEX_POSITION = VERTEX_POSITION_LEN * 4;
export const BYTES_PER_VERTEX_NORMAL = VERTEX_NORMAL_LEN * 4;
export const BYTES_PER_VERTEX_TANGENT = VERTEX_TANGENT_LEN * 4;
export const BYTES_PER_VERTEX_COORD = VERTEX_COORD_LEN * 4;
export const BYTES_PER_VERTEX_BONE_INDICE = VERTEX_BONE_INDICE_LEN * 4;
export const BYTES_PER_VERTEX_BONE_WEIGHT = VERTEX_BONE_WEIGHT_LEN * 4;
export const BYTES_PER_INDEX = 1 * 4;

function loadVbib(reader: BinaryReader, block: Source2FileBlock, meshIndex: number) {

	const VERTEX_HEADER_SIZE = 24;
	const INDEX_HEADER_SIZE = 24;
	const DESC_HEADER_SIZE = 56;
	const DESC_HEADER_NAME_SIZE = 36;
	reader.seek(block.offset);
	const vertexOffset = reader.tell() + reader.getInt32();
	const vertexCount = reader.getInt32();
	const indexOffset = reader.tell() + reader.getInt32();
	const indexCount = reader.getInt32();

	//block.file.vertices = [];
	//block.file.indices = [];

	const blockVertices: any[] = [];
	const blockIndices: any[] = [];

	block.file.vertices.set(meshIndex, blockVertices);
	block.file.indices.set(meshIndex, blockIndices);

	for (var i = 0; i < vertexCount; i++) { // header size: 24 bytes
		reader.seek(vertexOffset + i * VERTEX_HEADER_SIZE);
		const s1: any/*TODO: fix typer*/ = {};
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
						s1Tangents.set(tempValue, vertexIndex * VERTEX_TANGENT_LEN);//TODOv3
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
		blockVertices.push(s1);
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

		s2.indices = new ArrayBuffer(s2.indexCount * BYTES_PER_INDEX);/*TODO; use s2.bytesPerIndex and create a Uint16Array / Uint32Array depending on bytesPerIndex*/
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

		blockIndices.push(s2);
	}
}

//KV3_ENCODING_BLOCK_COMPRESSED = '\x46, \x1A, \x79, \x95, \xBC, \x95, \x6C, \x4F, \xA7, \x0B, \x05, \xBC, \xA1, \xB7, \xDF, \xD2';
