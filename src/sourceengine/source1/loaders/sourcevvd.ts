import { vec2, vec3, vec4 } from 'gl-matrix';

/**
 * VVD Model
 */
export class SourceVvdFixup {
	lod = 0;
	sourceVertexID = 0;
	numVertexes = 0;
}

class SourceVvdBoneWeight {
	weight: number[] = [];
	bone: number[] = [];
	numbones = 0;
}

export class SourceVvdVertex {
	m_BoneWeights = new SourceVvdBoneWeight();
	m_vecPosition = vec3.create();
	m_vecNormal = vec3.create();
	m_vecTexCoord = vec2.create();
	m_vecTangent = vec4.create();
}


export class SourceVvd {
	vertices: SourceVvdVertex[] = [];
	numFixups = 0;
	fixups: SourceVvdFixup[] = [];
	modelFormatID = 0;
	formatVersionID = 0;
	checkSum = 0;
	numLODs = 0;
	numLODVertexes: number[] = [];
	fixupTableStart = 0;
	vertexDataStart = 0;
	tangentDataStart = 0;

	getVertices(lodLevel: number) {
		if (this.vertices) {
			if (this.numFixups == 0) {
				return this.vertices;
			}
			/*
						if (!this.fixups) {
							this.readFixups();
						}
			*/

			if (this.fixups) {
				const vertices1 = [];

				for (let fixupIndex = 0; fixupIndex < this.fixups.length; ++fixupIndex) {
					const fixup = this.fixups[fixupIndex];
					if (fixup.lod < lodLevel) {
						continue;
					}
					const last = fixup.sourceVertexID + fixup.numVertexes;
					for (let vertexIndex = fixup.sourceVertexID; vertexIndex < last; ++vertexIndex) {
						vertices1.push(this.vertices[vertexIndex]);
					}
				}

				return vertices1;
			}
		}
		return null;
	}
}
