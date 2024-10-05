/**
 * VVD Model
 */
export class SourceVVD {
	vertices;
	numFixups;
	fixups;

	getVertices(lodLevel) {
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

				for (let fixupIndex = 0; fixupIndex < this.fixups.length; ++fixupIndex){
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
