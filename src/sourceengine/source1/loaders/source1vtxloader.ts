import { BinaryReader } from 'harmony-binary-reader';
import { SourceBinaryLoader } from '../../common/loaders/sourcebinaryloader';
import { MdlStripHeader, MdlVertex, SourceVtx, VTXBodyPart, VTXLod, VTXMesh, VTXModel, VTXStripGroupHeader } from './sourcevtx';

const BODYPART_HEADER_SIZE = 8; // Size in bytes of a BodyPartHeader_t
const MODEL_HEADER_SIZE = 8;
const LOD_HEADER_SIZE = 12;
const MESH_HEADER_SIZE = 9;
const STRIP_GROUP_HEADER_SIZE = 25;
const STRIP_HEADER_SIZE = 27;

export class Source1VtxLoader extends SourceBinaryLoader {
	#mdlVersion: number;

	constructor(mdlVersion: number) {
		super();
		this.#mdlVersion = mdlVersion;
	}

	async load(repository: string, path: string): Promise<SourceVtx | null> {
		return super.load(repository, path) as Promise<SourceVtx | null>;
	}

	parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer): SourceVtx {
		const vtx = new SourceVtx()
		const reader = new BinaryReader(arrayBuffer);
		this.#parseHeader(reader, vtx);
		this.#parseBodyParts(reader, vtx);
		return vtx;
	}

	#parseHeader(reader: BinaryReader, vtx: SourceVtx): void {
		reader.seek(0);
		vtx.version = reader.getInt32();
		vtx.vertCacheSize = reader.getInt32();
		vtx.maxBonesPerStrip = reader.getUint16();
		vtx.maxBonesPerFace = reader.getUint16();
		vtx.maxBonesPerVert = reader.getInt32();
		vtx.checkSum = reader.getInt32();
		vtx.numLODs = reader.getInt32();
		vtx.materialReplacementListOffset = reader.getInt32();

		vtx.numBodyParts = reader.getInt32();
		vtx.bodyPartOffset = reader.getInt32();
	}

	#parseBodyParts(reader: BinaryReader, vtx: SourceVtx): void {
		const bodyparts = vtx.bodyparts;
		for (let i = 0; i < vtx.numBodyParts; ++i) {
			// seek the start of body part
			reader.seek(vtx.bodyPartOffset + i * BODYPART_HEADER_SIZE);
			const bodypart = this.#parseBodyPartHeader(reader, vtx);
			if (bodypart) {
				bodyparts.push(bodypart);
			}
		}
	}

	#parseBodyPartHeader(reader: BinaryReader, vtx: SourceVtx): VTXBodyPart {
		const bodypart = new VTXBodyPart();

		const baseOffset = reader.tell();

		bodypart.numModels = reader.getInt32();
		const modelOffset = reader.getInt32();

		for (let i = 0; i < bodypart.numModels; ++i) {
			reader.seek(baseOffset + modelOffset + i * MODEL_HEADER_SIZE);
			bodypart.models.push(this.#parseModelHeader(reader, vtx));
		}
		return bodypart;
	}

	#parseModelHeader(reader: BinaryReader, vtx: SourceVtx): VTXModel {
		const model = new VTXModel();

		const baseOffset = reader.tell();

		model.numLODs = reader.getInt32();
		const lodOffset = reader.getInt32();

		for (let i = 0; i < model.numLODs; ++i) {
			reader.seek(baseOffset + lodOffset + i * LOD_HEADER_SIZE);
			model.lods.push(this.#parseLODHeader(reader, vtx));
		}
		return model;
	}

	#parseLODHeader(reader: BinaryReader, vtx: SourceVtx): VTXLod {
		const lod = new VTXLod();

		const baseOffset = reader.tell();

		lod.numMeshes = reader.getInt32();
		const meshOffset = reader.getInt32();
		lod.switchPoint = reader.getFloat32();

		for (let i = 0; i < lod.numMeshes; ++i) {
			reader.seek(baseOffset + meshOffset + i * MESH_HEADER_SIZE);
			lod.meshes.push(this.#parseMeshHeader(reader, vtx));
		}
		return lod;
	}

	#parseMeshHeader(reader: BinaryReader, vtx: SourceVtx): VTXMesh {
		const mesh = new VTXMesh();

		const baseOffset = reader.tell();

		mesh.numStripGroups = reader.getInt32();
		const stripGroupHeaderOffset = reader.getInt32();
		const headerSize = STRIP_GROUP_HEADER_SIZE + Number(this.#mdlVersion >= 49) * 8

		for (let i = 0; i < mesh.numStripGroups; ++i) {
			reader.seek(baseOffset + stripGroupHeaderOffset + i * headerSize);
			mesh.stripGroups.push(this.#parseStripGroupHeader(reader, vtx));
		}
		return mesh;
	}

	#parseStripGroupHeader(reader: BinaryReader, vtx: SourceVtx): VTXStripGroupHeader {
		const stripGroup = new VTXStripGroupHeader();

		const baseOffset = reader.tell();

		stripGroup.numVerts = reader.getInt32();
		const vertOffset = reader.getInt32();

		stripGroup.numIndices = reader.getInt32();
		const indexOffset = reader.getInt32();

		stripGroup.numStrips = reader.getInt32();
		const stripOffset = reader.getInt32();

		stripGroup.flags = reader.getUint8();


		const vertexSize = vtx.maxBonesPerVert * 2 + 3;
		for (let i = 0; i < stripGroup.numVerts; ++i) {
			reader.seek(baseOffset + vertOffset + i * vertexSize);
			stripGroup.vertices.push(this.#parseVertex(reader, vtx));
		}
		for (let i = 0; i < stripGroup.numIndices; ++i) {
			reader.seek(baseOffset + indexOffset + i * 2);
			stripGroup.indexes.push(reader.getInt16());
		}

		for (let i = 0; i < stripGroup.numStrips; ++i) {
			reader.seek(baseOffset + stripOffset + i * STRIP_HEADER_SIZE);
			stripGroup.strips.push(this.#parseStripHeader(reader, vtx));
		}
		return stripGroup;
	}

	#parseStripHeader(reader: BinaryReader, vtx: SourceVtx): MdlStripHeader {
		const stripHeader = new MdlStripHeader();

		//const baseOffset = reader.tell();removeme

		stripHeader.numIndices = reader.getInt32();
		stripHeader.indexOffset = reader.getInt32();

		stripHeader.numVerts = reader.getInt32();
		stripHeader.vertOffset = reader.getInt32();

		stripHeader.numBones = reader.getInt16();
		stripHeader.flags = reader.getUint8();

		stripHeader.numBoneStateChanges = reader.getInt32();
		stripHeader.boneStateChangeOffset = reader.getInt32();

		return stripHeader;
	}

	#parseVertex(reader: BinaryReader, vtx: SourceVtx): MdlVertex {
		const vertex = new MdlVertex();

		for (let i = 0; i < vtx.maxBonesPerVert; ++i) {
			vertex.boneWeightIndex.push(reader.getUint8());
		}
		vertex.numBones = reader.getUint8();
		vertex.origMeshVertID = reader.getUint16();

		for (let i = 0; i < vtx.maxBonesPerVert; ++i) {
			vertex.boneID.push(reader.getInt8());
		}

		return vertex;
	}
}
