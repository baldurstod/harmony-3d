import { vec2, vec3, vec4 } from 'gl-matrix';
import { TEXTURE_FORMAT_COMPRESSED_RGBA_BC4, TEXTURE_FORMAT_COMPRESSED_RGBA_BC5, TEXTURE_FORMAT_COMPRESSED_RGBA_BC7, TEXTURE_FORMAT_COMPRESSED_RGBA_DXT1, TEXTURE_FORMAT_COMPRESSED_RGBA_DXT5, TEXTURE_FORMAT_UNCOMPRESSED_BGRA8888, TEXTURE_FORMAT_UNCOMPRESSED_R8, TEXTURE_FORMAT_UNCOMPRESSED_RGBA } from '../../../textures/textureconstants';
import { Kv3Element } from '../../common/keyvalue/kv3element';
import { Kv3Type, Kv3Value, Kv3ValueType } from '../../common/keyvalue/kv3value';
import { VTEX_FORMAT_BC4, VTEX_FORMAT_BC5, VTEX_FORMAT_BC7, VTEX_FORMAT_BGRA8888, VTEX_FORMAT_DXT1, VTEX_FORMAT_DXT5, VTEX_FORMAT_R8, VTEX_FORMAT_R8G8B8A8_UINT } from '../constants';
import { Source2FileBlock, Source2RerlBlock, Source2VtexBlock } from './source2fileblock';

export const VTEX_TO_INTERNAL_IMAGE_FORMAT: Record<number, number> = {};
VTEX_TO_INTERNAL_IMAGE_FORMAT[VTEX_FORMAT_DXT1] = TEXTURE_FORMAT_COMPRESSED_RGBA_DXT1;
VTEX_TO_INTERNAL_IMAGE_FORMAT[VTEX_FORMAT_DXT5] = TEXTURE_FORMAT_COMPRESSED_RGBA_DXT5;
VTEX_TO_INTERNAL_IMAGE_FORMAT[VTEX_FORMAT_R8] = TEXTURE_FORMAT_UNCOMPRESSED_R8;
VTEX_TO_INTERNAL_IMAGE_FORMAT[VTEX_FORMAT_BC4] = TEXTURE_FORMAT_COMPRESSED_RGBA_BC4;
VTEX_TO_INTERNAL_IMAGE_FORMAT[VTEX_FORMAT_BC5] = TEXTURE_FORMAT_COMPRESSED_RGBA_BC5;
VTEX_TO_INTERNAL_IMAGE_FORMAT[VTEX_FORMAT_BC7] = TEXTURE_FORMAT_COMPRESSED_RGBA_BC7;
VTEX_TO_INTERNAL_IMAGE_FORMAT[VTEX_FORMAT_R8G8B8A8_UINT] = TEXTURE_FORMAT_UNCOMPRESSED_RGBA;
VTEX_TO_INTERNAL_IMAGE_FORMAT[VTEX_FORMAT_BGRA8888] = TEXTURE_FORMAT_UNCOMPRESSED_BGRA8888;

/*VTEX_FORMAT_DXT1 : TEXTURE_FORMAT_COMPRESSED_RGBA_DXT1,
VTEX_FORMAT_DXT5 : TEXTURE_FORMAT_COMPRESSED_RGBA_DXT5,
VTEX_FORMAT_BC7 : TEXTURE_FORMAT_COMPRESSED_RGBA_BC7,
}*/

//TODOv3: improve
/*export const TEXTURE_FORMAT_UNKNOWN = 0;
export const TEXTURE_FORMAT_UNCOMPRESSED_RGB = 1;
export const TEXTURE_FORMAT_UNCOMPRESSED_RGBA = 2;
export const TEXTURE_FORMAT_COMPRESSED_RGB_DXT1 = 1000;
export const TEXTURE_FORMAT_COMPRESSED_RGBA_DXT1 = 1001;
export const TEXTURE_FORMAT_COMPRESSED_RGBA_DXT3 = 1002;
export const TEXTURE_FORMAT_COMPRESSED_RGBA_DXT5 = 1003;
export const TEXTURE_FORMAT_COMPRESSED_RGBA_BC7 = 1004;


export const VTEX_FORMAT_DXT1 = 0x01;
export const VTEX_FORMAT_DXT5 = 0x02;
export const VTEX_FORMAT_R8G8B8A8_UINT = 0x04;
export const VTEX_FORMAT_PNG_R8G8B8A8_UINT = 0x10;
export const VTEX_FORMAT_BC7 = 0x14;//not sure*/


/**
 * Source2 common file
 */
export class Source2File {
	repository: string;
	fileName: string;
	// blocks stores the first occurence of a block type
	// some blocks (MBUF, MDAT) may have multiple occurences that can be accessed via blocksArray
	blocks: Record<string, Source2FileBlock> = {};
	blocksArray: Source2FileBlock[] = [];
	fileLength = 0;
	versionMaj = 0;
	versionMin = 0;
	maxBlockOffset = 0;

	constructor(repository: string, fileName: string) {
		this.repository = repository;
		this.fileName = fileName;
	}

	addBlock(block: Source2FileBlock): void {
		this.blocksArray.push(block);
		if (this.blocks[block.type] === undefined) {
			this.blocks[block.type] = block;
		}
	}

	getBlockByType(type: string): Source2FileBlock | null {
		return this.blocks[type];
	}

	getBlockById(id: number): Source2FileBlock | null {
		return this.blocksArray[id];
	}

	getVertexCount(bufferId: number): number {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return 0;
		}

		return block.indices![bufferId].indices.length;
	}

	getIndices(bufferId: number): number[] | null {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const indexBuffer = block.indices![bufferId];

		return indexBuffer ? indexBuffer.indices : [];
	}

	getVertices(bufferId: number): number[] | null {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const vertexBuffer = block.vertices![bufferId];

		return vertexBuffer ? vertexBuffer.vertices : [];
	}

	getNormals(bufferId: number): number[] | null {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const vertexBuffer = block.vertices![bufferId];
		const normals = vertexBuffer.normals;
		const ret = [];
		const normalVec4 = vec4.create();
		let normalVec3;
		for (let i = 0, l = normals.length; i < l; i += 4) {
			normalVec4[0] = normals[i + 0];
			normalVec4[1] = normals[i + 1];
			normalVec4[2] = normals[i + 2];
			normalVec4[3] = normals[i + 3];

			normalVec3 = DecompressNormal(normalVec4);
			ret.push(normalVec3[0]);
			ret.push(normalVec3[1]);
			ret.push(normalVec3[2]);
		}
		return ret;//vertexBuffer ? vertexBuffer.normals : [];
	}

	getCoords(bufferId: number): number[] | null {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const vertexBuffer = block.vertices![bufferId];

		return vertexBuffer ? vertexBuffer.coords : [];
	}

	getBoneIndices(bufferId: number): number[] | null {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const vertexBuffer = block.vertices![bufferId];

		return vertexBuffer ? vertexBuffer.boneIndices : [];
	}

	getBoneWeight(bufferId: number): number[] | null {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const vertexBuffer = block.vertices![bufferId];

		return vertexBuffer ? vertexBuffer.boneWeight : [];
	}

	/*
	getPositionArray(bufferId: number) {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const vertexBuffer = block.vertices[bufferId];
		const indexBuffer = block.indices[bufferId];

		const vertices = vertexBuffer ? vertexBuffer.vertices : [];
		const indices = indexBuffer ? indexBuffer.indices : [];

		const ret = [];
		const indicesLength = indices.length;
		for (let i = 0; i < indicesLength; i++) {
			const vertexId = indices[i] * 3;
			ret.push(vertices[vertexId + 0]);
			ret.push(vertices[vertexId + 1]);
			ret.push(vertices[vertexId + 2]);
		}
		return ret;
	}

	getNormalArray(bufferId) {

		/*function DecompressNormal(float2 inputTangent, out float4 outputTangent) {//_DecompressShort2Tangent
			const ztSigns		= sign(inputTangent);				// sign bits for z and tangent (+1 or -1)
			float2 xyAbs		= abs(inputTangent);				// 1..32767
			outputTangent.xy	= (xyAbs - 16384.0) / 16384.0;	// x and y
			outputTangent.z		= ztSigns.x * sqrt(saturate(1.0 - dot(outputTangent.xy, outputTangent.xy)));
			//outputTangent.w		= ztSigns.y;
		}* /


		function DecompressNormal(inputNormal) {				// {nX, nY, nZ}//_DecompressUByte4Normal
			const fOne = 1.0;
			const outputNormal = vec3.create();

			//float2 ztSigns		= (inputNormal.xy - 128.0) < 0;				// sign bits for zs and binormal (1 or 0) set-less-than (slt) asm instruction
			const ztSigns = vec2.fromValues(Number((inputNormal[0] - 128.0) < 0), Number((inputNormal[1] - 128.0) < 0));				// sign bits for zs and binormal (1 or 0) set-less-than (slt) asm instruction
			//float2 xyAbs		= abs(inputNormal.xy - 128.0) - ztSigns;		// 0..127
			const xyAbs = vec2.fromValues(Math.abs(inputNormal[0] - 128.0) - ztSigns[0], Math.abs(inputNormal[1] - 128.0) - ztSigns[1]);		// 0..127
			//float2 xySigns		= (xyAbs - 64.0) < 0;						// sign bits for xs and ys (1 or 0)
			const xySigns = vec2.fromValues(Number((xyAbs[0] - 64.0) < 0), Number((xyAbs[1] - 64.0) < 0));						// sign bits for xs and ys (1 or 0)
			//outputNormal.xy		= (abs(xyAbs - 64.0) - xySigns) / 63.0;	// abs({nX, nY})
			outputNormal[0] = (Math.abs(xyAbs[0] - 64.0) - xySigns[0]) / 63.0;	// abs({nX, nY})
			outputNormal[1] = (Math.abs(xyAbs[1] - 64.0) - xySigns[1]) / 63.0;	// abs({nX, nY})

			//outputNormal.z		= 1.0 - outputNormal.x - outputNormal.y;		// Project onto x+y+z=1
			outputNormal[2] = 1.0 - outputNormal[0] - outputNormal[1];		// Project onto x+y+z=1
			//outputNormal.xyz	= normalize(outputNormal.xyz);				// Normalize onto unit sphere
			vec3.normalize(outputNormal, outputNormal);

			//outputNormal.xy	 *= lerp(fOne.xx, -fOne.xx, xySigns);			// Restore x and y signs
			//outputNormal.z	 *= lerp(fOne.x, -fOne.x, ztSigns.x);			// Restore z sign
			outputNormal[0] *= (1 - xySigns[0]) - xySigns[0];
			outputNormal[1] *= (1 - xySigns[1]) - xySigns[1];
			return vec3.normalize(outputNormal, outputNormal);
		}

		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const vertexBuffer = block.vertices[bufferId];
		const indexBuffer = block.indices[bufferId];
		const normals = vertexBuffer ? vertexBuffer.normals : [];
		const indices = indexBuffer ? indexBuffer.indices : [];

		const ret = [];
		const indicesLength = indices.length;
		const normalVec4 = vec4.create();
		let normalVec3;
		for (let i = 0; i < indicesLength; i++) {
			const vertexId = indices[i] * 4;
			normalVec4[0] = normals[vertexId + 0];
			normalVec4[1] = normals[vertexId + 1];
			normalVec4[2] = normals[vertexId + 2];
			normalVec4[3] = normals[vertexId + 3];

			normalVec3 = DecompressNormal(normalVec4);
			ret.push(normalVec3[0]);
			ret.push(normalVec3[1]);
			ret.push(normalVec3[2]);
			//ret.push(0);

			//ret.push(normals[vertexId + 0] / 255.0);
			//ret.push(normals[vertexId + 1] / 255.0);
			//ret.push(normals[vertexId + 2] / 255.0);
			//ret.push(normals[vertexId + 3] / 255.0);
		}
		return ret;
	}

	getCoordArray(bufferId) {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const vertexBuffer = block.vertices[bufferId];
		const indexBuffer = block.indices[bufferId];
		const coords = vertexBuffer ? vertexBuffer.coords : [];
		const indices = indexBuffer ? indexBuffer.indices : [];
		//var coords = block.vertices[bufferId].coords;
		//var indices = block.indices[bufferId].indices;

		const ret = [];
		const indicesLength = indices.length;
		for (let i = 0; i < indicesLength; i++) {
			const vertexId = indices[i] * 2;
			ret.push(coords[vertexId + 0]);
			ret.push(coords[vertexId + 1]);
		}
		return ret;
	}

	getBoneIndiceArray(bufferId) {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}


		const vertexBuffer = block.vertices[bufferId];
		const indexBuffer = block.indices[bufferId];
		const vertices = vertexBuffer ? vertexBuffer.boneIndices : [];
		const indices = indexBuffer ? indexBuffer.indices : [];
		//var vertices = block.vertices[bufferId].boneIndices;
		//var indices = block.indices[bufferId].indices;

		const ret = [];
		const indicesLength = indices.length;
		for (let i = 0; i < indicesLength; i++) {
			const vertexId = indices[i] * 4;
			ret.push(vertices[vertexId + 0]);
			ret.push(vertices[vertexId + 1]);
			ret.push(vertices[vertexId + 2]);
			//ret.push(vertices[vertexId + 3]);TODO
		}
		return ret;
	}

	getBoneWeightArray(bufferId) {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const vertexBuffer = block.vertices[bufferId];
		const indexBuffer = block.indices[bufferId];
		const vertices = vertexBuffer ? vertexBuffer.boneWeight : [];
		const indices = indexBuffer ? indexBuffer.indices : [];
		//var vertices = block.vertices[bufferId].boneWeight;
		//var indices = block.indices[bufferId].indices;

		const ret = [];
		const indicesLength = indices.length;
		for (let i = 0; i < indicesLength; i++) {
			const vertexId = indices[i] * 4;
			ret.push(vertices[vertexId + 0] / 255);//TODO: optimise
			ret.push(vertices[vertexId + 1] / 255);
			ret.push(vertices[vertexId + 2] / 255);
			//ret.push(vertices[vertexId + 3]);TODO
		}
		return ret;
	}

	getTangentArray(bufferId) {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}
		const vertexBuffer = block.vertices[bufferId];
		const indexBuffer = block.indices[bufferId];
		const vertices = vertexBuffer ? vertexBuffer.boneIndices : [];
		const indices = indexBuffer ? indexBuffer.indices : [];
		//var vertices = block.vertices[bufferId].boneIndices;
		//var indices = block.indices[bufferId].indices;

		const ret = [];
		const indicesLength = indices.length;
		for (let i = 0; i < indicesLength; i++) {
			const vertexId = indices[i] * 4;
			ret.push(vertices[vertexId + 0]);
			ret.push(vertices[vertexId + 1]);
			ret.push(vertices[vertexId + 2]);
			//ret.push(vertices[vertexId + 3]);TODO
		}
		return ret;
	}

	getBinormalArray(bufferId) {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const vertexBuffer = block.vertices[bufferId];
		const indexBuffer = block.indices[bufferId];
		const vertices = vertexBuffer ? vertexBuffer.boneIndices : [];
		const indices = indexBuffer ? indexBuffer.indices : [];
		//var vertices = block.vertices[bufferId].boneIndices;
		//var indices = block.indices[bufferId].indices;

		const ret = [];
		const indicesLength = indices.length;
		for (let i = 0; i < indicesLength; i++) {
			const vertexId = indices[i] * 4;
			ret.push(vertices[vertexId + 0]);
			ret.push(vertices[vertexId + 1]);
			ret.push(vertices[vertexId + 2]);
			//ret.push(vertices[vertexId + 3]);TODO
		}
		return ret;
	}
	*/

	getBlockStruct(block: string, path: string): Kv3ValueType | undefined {
		console.assert(path != null, 'path is null', block, path);
		console.assert(path != '', 'path is empty, use getBlockKeyValues', block, path);

		//const arr = path.split('.');
		const b = this.blocks[block];
		if (!b) {
			return null;
		}

		const value = b.getKeyValue(path);
		//console.assert(value != null, 'value is null', block, path, b);
		/*
		if ((value as (Kv3Value | undefined))?.isKv3Value) {
			return (value as Kv3Value).getValue();
		}
		*/

		return value;
		console.error('we should not go there');
		/*

		let sub;
		for (let i = 0; i < arr.length; i++) {
			sub = data[arr[i]];
			if (!sub) {
				return null;
			}
			data = sub;
		}

		return data;
		*/
		return null
	}

	getBlockStructAsArray(block: string, path: string): any[] | null {
		const prop = this.getBlockStruct(block, path);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isArray()) {
			return (prop as Kv3Value).getValue() as any[];
		}
		return null;
	}

	getBlockStructAsElement(block: string, path: string): Kv3Element | null {
		const prop = this.getBlockStruct(block, path);
		if ((prop as Kv3Element)?.isKv3Element) {
			return (prop as Kv3Element);
		}
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).getType() == Kv3Type.Element) {
			return (prop as Kv3Value).getValue() as Kv3Element;
		}
		return null;
	}

	getBlockStructAsElementArray(block: string, path: string): Kv3Element[] | null {
		const prop = this.getBlockStruct(block, path);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).getSubType() == Kv3Type.Element) {
			return (prop as Kv3Value).getValue() as Kv3Element[];
		}
		return null;
	}

	getBlockStructAsString(block: string, path: string): string | null {
		const prop = this.getBlockStruct(block, path);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).getType() == Kv3Type.String) {
			return (prop as Kv3Value).getValue() as string;
		}
		return null;
	}

	getBlockStructAsStringArray(block: string, path: string): string[] | null {
		const prop = this.getBlockStruct(block, path);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).getSubType() == Kv3Type.String) {
			return (prop as Kv3Value).getValue() as string[];
		}
		return null;
	}

	getBlockStructAsResourceArray(block: string, path: string): string[] | null {
		const prop = this.getBlockStruct(block, path);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isArray() && (prop as Kv3Value).getSubType() == Kv3Type.Resource) {
			return (prop as Kv3Value).getValue() as string[];
		}
		return null;
	}

	getBlockStructAsBigintArray(block: string, path: string): bigint[] | null {
		const prop = this.getBlockStruct(block, path);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isBigintArray()) {
			return (prop as Kv3Value).getValue() as bigint[];
		}
		return null;
	}

	getBlockStructAsNumberArray(block: string, path: string): number[] | null {
		const prop = this.getBlockStruct(block, path);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isNumberArray()) {
			return (prop as Kv3Value).getValue() as number[];
		}
		return null;
	}

	getBlockKeyValues(block: string): Kv3Element | null {
		const b = this.blocks[block];
		if (!b) {
			return null;
		}

		return b.keyValue?.root ?? null;
	}

	getPermModelData(path: string): Kv3ValueType | undefined {
		//return this.getBlockStruct('DATA.structs.PermModelData_t.' + path) || this.getBlockStruct('DATA.keyValue.root.' + path);
		return this.getBlockStruct('DATA', 'PermModelData_t.' + path) ?? this.getBlockStruct('DATA', path);
	}

	getMaterialResourceData(path: string): Kv3Element[] | null {
		return this.getBlockStructAsElementArray('DATA', 'MaterialResourceData_t' + path) ?? this.getBlockStructAsElementArray('DATA', path);// ?? this.getBlockStruct('DATA', path);
	}

	getExternalFiles(): string[] | null {
		const rerl = this.blocks['RERL'] as (Source2RerlBlock | undefined);
		return rerl?.externalFiles2 ?? [];
	}

	getExternalFile(fileIndex: number): string | null {
		const externalFiles = this.getExternalFiles();
		return externalFiles?.[fileIndex] ?? null;
	}

	getKeyValue(path: string): any/*TODO: create a type*/ {
		const dataBlock = this.blocks['DATA'] as Source2VtexBlock;
		if (dataBlock) {
			const keyValue = dataBlock.keyValue;
			if (keyValue) {
				return keyValue.getValue(path);
			}
		}
		return null;
	}

	/**
	 * @deprecated use getDisplayName() instead
	 */
	get displayName(): string {
		return this.getDisplayName();
	}

	getDisplayName(): string {
		const fileName = this.fileName;
		if (fileName) {
			const result = /(\w+)\.\w+$/.exec(fileName);
			if (result && result.length == 2) {
				return result[1];
			}
		}
		return ''
	}

	getRemappingTable(meshIndex: number): number[] | bigint[] | null {
		const remappingTableStarts = this.getBlockStructAsBigintArray('DATA', 'm_remappingTableStarts') ?? this.getBlockStructAsNumberArray('DATA', 'm_remappingTableStarts');
		if (!remappingTableStarts || meshIndex > remappingTableStarts.length) {
			return null;
		}
		const remappingTable = this.getBlockStructAsBigintArray('DATA', 'm_remappingTable') ?? this.getBlockStructAsNumberArray('DATA', 'm_remappingTable');
		if (!remappingTable) {
			return null;
		}

		const starts = remappingTableStarts[meshIndex];
		if (starts > remappingTable.length) {
			return null;
		}

		let end = Number(remappingTableStarts[meshIndex + 1]);
		if (end !== undefined) {
			end = Number(end); // Converts bigint
		}

		return remappingTable.slice(Number(starts), end);
	}

	remapBuffer(buffer: ArrayBuffer, remappingTable: number[] | bigint[] | null): Float32Array {
		const inArr = new Float32Array(buffer);
		const outArr = new Float32Array(new ArrayBuffer(buffer.byteLength));

		if (remappingTable) {
			inArr.forEach((element, index) => {
				outArr[index] = Number(remappingTable[element] ?? element);
			});
		}
		return outArr;
	}
}


function DecompressNormal(inputNormal: vec4): vec3 {				// {nX, nY, nZ}//_DecompressUByte4Normal
	const fOne = 1.0;
	const outputNormal = vec3.create();

	//float2 ztSigns		= (inputNormal.xy - 128.0) < 0;				// sign bits for zs and binormal (1 or 0) set-less-than (slt) asm instruction
	const ztSigns = vec2.fromValues(Number((inputNormal[0] - 128.0) < 0), Number((inputNormal[1] - 128.0) < 0));				// sign bits for zs and binormal (1 or 0) set-less-than (slt) asm instruction
	//float2 xyAbs		= abs(inputNormal.xy - 128.0) - ztSigns;		// 0..127
	const xyAbs = vec2.fromValues(Math.abs(inputNormal[0] - 128.0) - ztSigns[0], Math.abs(inputNormal[1] - 128.0) - ztSigns[1]);		// 0..127
	//float2 xySigns		= (xyAbs - 64.0) < 0;						// sign bits for xs and ys (1 or 0)
	const xySigns = vec2.fromValues(Number((xyAbs[0] - 64.0) < 0), Number((xyAbs[1] - 64.0) < 0));						// sign bits for xs and ys (1 or 0)
	//outputNormal.xy		= (abs(xyAbs - 64.0) - xySigns) / 63.0;	// abs({nX, nY})
	outputNormal[0] = (Math.abs(xyAbs[0] - 64.0) - xySigns[0]) / 63.0;	// abs({nX, nY})
	outputNormal[1] = (Math.abs(xyAbs[1] - 64.0) - xySigns[1]) / 63.0;	// abs({nX, nY})

	//outputNormal.z		= 1.0 - outputNormal.x - outputNormal.y;		// Project onto x+y+z=1
	outputNormal[2] = 1.0 - outputNormal[0] - outputNormal[1];		// Project onto x+y+z=1
	//outputNormal.xyz	= normalize(outputNormal.xyz);				// Normalize onto unit sphere
	vec3.normalize(outputNormal, outputNormal);

	//outputNormal.xy	 *= lerp(fOne.xx, -fOne.xx, xySigns);			// Restore x and y signs
	//outputNormal.z	 *= lerp(fOne.x, -fOne.x, ztSigns.x);			// Restore z sign
	outputNormal[0] *= (1 - xySigns[0]) - xySigns[0];
	outputNormal[1] *= (1 - xySigns[1]) - xySigns[1];
	return vec3.normalize(outputNormal, outputNormal);
}
