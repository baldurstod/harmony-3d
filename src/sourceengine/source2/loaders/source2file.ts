import { vec2, vec3, vec4 } from 'gl-matrix';
import { DEBUG } from '../../../buildoptions';
import { TEXTURE_FORMAT_COMPRESSED_RGBA_BC4, TEXTURE_FORMAT_COMPRESSED_RGBA_BC5, TEXTURE_FORMAT_COMPRESSED_RGBA_BC7, TEXTURE_FORMAT_COMPRESSED_RGBA_DXT1, TEXTURE_FORMAT_COMPRESSED_RGBA_DXT5, TEXTURE_FORMAT_UNCOMPRESSED_BGRA8888, TEXTURE_FORMAT_UNCOMPRESSED_R8, TEXTURE_FORMAT_UNCOMPRESSED_RGBA, TEXTURE_FORMAT_UNKNOWN } from '../../../textures/textureconstants';
import { VTEX_FLAG_CUBE_TEXTURE, VTEX_FORMAT_BC4, VTEX_FORMAT_BC5, VTEX_FORMAT_BC7, VTEX_FORMAT_BGRA8888, VTEX_FORMAT_DXT1, VTEX_FORMAT_DXT5, VTEX_FORMAT_R8, VTEX_FORMAT_R8G8B8A8_UINT } from '../constants';
import { Source2FileBlock } from './source2fileblock';

const VTEX_TO_INTERNAL_IMAGE_FORMAT: Record<number, number> = {};
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
	blocks: any = {};
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

		return block.indices[bufferId].indices.length;
	}

	getIndices(bufferId: number): number[] | null {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const indexBuffer = block.indices[bufferId];

		return indexBuffer ? indexBuffer.indices : [];
	}

	getVertices(bufferId: number): number[] | null {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const vertexBuffer = block.vertices[bufferId];

		return vertexBuffer ? vertexBuffer.vertices : [];
	}

	getNormals(bufferId: number): number[] | null {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const vertexBuffer = block.vertices[bufferId];
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

		const vertexBuffer = block.vertices[bufferId];

		return vertexBuffer ? vertexBuffer.coords : [];
	}

	getBoneIndices(bufferId: number): number[] | null {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const vertexBuffer = block.vertices[bufferId];

		return vertexBuffer ? vertexBuffer.boneIndices : [];
	}

	getBoneWeight(bufferId: number): number[] | null {
		const block = this.blocks.VBIB || this.blocks.MBUF;
		if (!block) {
			return null;
		}

		const vertexBuffer = block.vertices[bufferId];

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

	getWidth(): number {
		const block = this.blocks.DATA;
		if (!block) {
			return 0;
		}
		return block.width;
	}

	getHeight(): number {
		const block = this.blocks.DATA;
		if (!block) {
			return 0;
		}
		return block.height;
	}

	getDxtLevel(): number {
		const block = this.blocks.DATA;
		if (!block) {
			return 0;
		}

		switch (block.imageFormat) {
			case 1://TODO DXT1
				return 1;
			case 2://TODO DXT5
				return 5;
		}
		return 0;
	}

	isCompressed(): boolean {
		const block = this.blocks.DATA;
		if (!block) {
			return false;
		}

		return block.imageFormat <= 2;//DXT1 or DXT5
	}

	isCubeTexture(): boolean {
		const block = this.blocks.DATA;
		if (!block) {
			return false;
		}

		return (block.flags & VTEX_FLAG_CUBE_TEXTURE) == VTEX_FLAG_CUBE_TEXTURE;
	}

	getBlockStruct(path: string): any | null/*TODO: create a type*/ {
		const arr = path.split('.');
		let data = this.blocks;
		if (!data) {
			return null;
		}

		let sub;
		for (let i = 0; i < arr.length; i++) {
			sub = data[arr[i]];
			if (!sub) {
				return null;
			}
			data = sub;
		}

		return data;
	}

	getPermModelData(path: string): any/*TODO: create a type*/ {
		return this.getBlockStruct('DATA.structs.PermModelData_t.' + path) || this.getBlockStruct('DATA.keyValue.root.' + path);
	}

	getMaterialResourceData(path: string): any/*TODO: create a type*/ {
		return this.getBlockStruct('DATA.structs.MaterialResourceData_t.' + path) || this.getBlockStruct('DATA.keyValue.root.' + path);
	}

	getExternalFiles(): string[] | null {
		const externalFiles = this.getBlockStruct('RERL.externalFiles2');
		return externalFiles;
	}

	getExternalFile(fileIndex: number): string | null {
		const externalFiles = this.getBlockStruct('RERL.externalFiles2');
		if (externalFiles) {
			return externalFiles[fileIndex];
		}
		return null;
	}

	getKeyValue(path: string): any/*TODO: create a type*/ {
		const dataBlock = this.blocks['DATA'];
		if (dataBlock) {
			const keyValue = dataBlock.keyValue;
			if (keyValue) {
				return keyValue.getValue(path);
			}
		}
		return null;
	}

	get imageFormat(): number {//TODOv3 improve this
		const block = this.blocks.DATA;
		if (!block) {
			return TEXTURE_FORMAT_UNKNOWN;
		}
		const imageFormat = block.imageFormat;
		if (DEBUG) {
			const internalFormat = VTEX_TO_INTERNAL_IMAGE_FORMAT[imageFormat];
			if (internalFormat === undefined) {
				throw 'Unknown vtex format : ' + imageFormat;
			} else {
				return internalFormat;
			}
		} else {
			return VTEX_TO_INTERNAL_IMAGE_FORMAT[imageFormat];
		}
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

	getRemappingTable(meshIndex: number): number[] | null {
		const remappingTableStarts = this.getPermModelData('m_remappingTableStarts');
		if (!remappingTableStarts || meshIndex > remappingTableStarts.length) {
			return null;
		}
		const remappingTable = this.getPermModelData('m_remappingTable');
		if (!remappingTable) {
			return null;
		}

		const starts = remappingTableStarts[meshIndex];
		if (starts > remappingTable.length) {
			return null;
		}

		let end = remappingTableStarts[meshIndex + 1];
		if (end !== undefined) {
			end = Number(end); // Converts bigint
		}

		return remappingTable.slice(Number(starts), end);
	}

	remapBuffer(buffer: Float32Array, remappingTable: number[]): Float32Array {
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
