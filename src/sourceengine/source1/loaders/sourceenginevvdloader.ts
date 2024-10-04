import { vec2, vec3 } from 'gl-matrix';
import { BinaryReader } from 'harmony-binary-reader';

import { SourceBinaryLoader } from '../../common/loaders/sourcebinaryloader';
import { SourceVVD } from './sourcevvd';
import { MAX_NUM_LODS } from './constants';

const VERTEX_SIZE = 48 // size in bytes of a vertex
const TANGENT_SIZE = 16 // size in bytes of a vertex
const FIXUP_STRUCT_SIZE = 12; // size in bytes of a vertex vertexFileFixup

const MAX_NUM_BONES_PER_VERT = 3;

function StudioBoneWeight() {
	this.weight = [];
	this.bone = [];
	this.numbones = 0;
}
function StudioVertex() {
	this.m_BoneWeights = new StudioBoneWeight();
	this.m_vecPosition = vec3.create();
	this.m_vecNormal = vec3.create();
	this.m_vecTexCoord = vec2.create();
}

export class SourceEngineVVDLoader extends SourceBinaryLoader {
	parse(repository, fileName, arrayBuffer) {
		let vvd = new SourceVVD()
		let reader = new BinaryReader(arrayBuffer);
		this.#parseHeader(reader, vvd);
		this.#parseVertices(reader, vvd);
		this.#parseFixups(reader, vvd);
		return vvd;
	}

	#parseHeader(reader, vvd) {
		reader.seek(0);
		vvd.modelFormatID = reader.getInt32();
		vvd.formatVersionID = reader.getInt32();
		vvd.checkSum = reader.getInt32();
		vvd.numLODs = reader.getInt32();

		vvd.numLODVertexes = [];
		for (let i = 0; i < MAX_NUM_LODS; ++i) {
			vvd.numLODVertexes.push(reader.getInt32());
		}

		vvd.numFixups = reader.getInt32();
		vvd.fixupTableStart = reader.getInt32();
		vvd.vertexDataStart = reader.getInt32();
		vvd.tangentDataStart = reader.getInt32();
	}

	#parseVertices(reader, vvd) {
		if (vvd.numLODVertexes) {
			if (vvd.numLODVertexes[0] === 0) {//TODO ????
				return;
			}

			vvd.vertices = [];
			for (let i = 0; i < vvd.numLODVertexes[0]; ++i) {
				// seek the start of body part
				reader.seek(vvd.vertexDataStart + i * VERTEX_SIZE);
				const vertex = this.#parseVertex(reader, vvd);
				reader.seek(vvd.tangentDataStart + i * TANGENT_SIZE);
				const m_vecTangent = reader.getVector4();//vec4.fromValues(reader.getFloat32(), reader.getFloat32(), reader.getFloat32(), reader.getFloat32());

				// Avoid a nul vector
				if ((m_vecTangent[0] == 0.0) && (m_vecTangent[1] == 0.0) && (m_vecTangent[2] == 0.0)) {
					m_vecTangent[0] = 1.0;
				}
				vertex.m_vecTangent = m_vecTangent;
			}
		}
	}

	#parseVertex(reader, vvd) {
		const vertex = new StudioVertex();

		for (let i = 0; i < MAX_NUM_BONES_PER_VERT; ++i) {
			vertex.m_BoneWeights.weight[i] = reader.getFloat32();
		}
		for (let i = 0; i < MAX_NUM_BONES_PER_VERT; ++i) {
			vertex.m_BoneWeights.bone[i] = reader.getInt8();
		}
		vertex.m_BoneWeights.numbones = reader.getInt8();

		vertex.m_vecPosition = reader.getVector3();
		vertex.m_vecNormal = reader.getVector3();
		vertex.m_vecTexCoord = reader.getVector2();

		vvd.vertices.push(vertex);
		return vertex;
	}

	#parseFixups(reader, vvd) {
		if (vvd.numFixups === 0) {
			return;
		}

		vvd.fixups = [];
		for (let i = 0; i < vvd.numFixups; ++i) {
			// seek the start of body part
			reader.seek(vvd.fixupTableStart + i * FIXUP_STRUCT_SIZE);
			this.#parseFixup(reader, vvd);
		}
	}

	#parseFixup(reader, vvd) {
		const fixup = Object.create(null);

		fixup.lod = reader.getInt32();
		fixup.sourceVertexID = reader.getInt32();
		fixup.numVertexes = reader.getInt32();

		vvd.fixups.push(fixup);
	}
}
