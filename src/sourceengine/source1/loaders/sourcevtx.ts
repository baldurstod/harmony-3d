/**
 * VTX Model
 */


export class VTXBodyPart {
	models: VTXModel[] = [];
	numModels = 0;
}

export class VTXModel {
	lods: VTXLod[] = [];
	numLODs = 0;
}

export class VTXLod {
	meshes: VTXMesh[] = [];
	numMeshes = 0;
	switchPoint = 0;
}

export class VTXMesh {
	stripGroups: VTXStripGroupHeader[] = [];
	numStripGroups = 0;
}
/*
export class VTXStripGroup {
	stripGroups = [];
}
	*/

export class VTXStripGroupHeader {
	vertices: MdlVertex[] = [];
	indexes: number[] = [];
	strips: MdlStripHeader[] = [];

	numVerts = 0;
	numIndices = 0;
	numStrips = 0;
	flags = 0;
}


export class MdlVertex {
	boneWeightIndex: number[] = [];
	boneID: number[] = [];
	numBones = 0;
	origMeshVertID = 0;
}

export class MdlStripHeader {
	vertices = [];
	indexes = [];
	numIndices = 0;
	indexOffset = 0;
	numVerts = 0;
	vertOffset = 0;
	numBones = 0;
	flags = 0;
	numBoneStateChanges = 0;
	boneStateChangeOffset = 0;
}



export class SourceVtx {
	bodyparts: VTXBodyPart[] = [];
	version = 0;
	vertCacheSize = 0;
	maxBonesPerStrip = 0;
	maxBonesPerFace = 0;
	maxBonesPerVert = 0;
	checkSum = 0;
	numLODs = 0;
	materialReplacementListOffset = 0;
	numBodyParts = 0;
	bodyPartOffset = 0;

	getBodyparts() {//removeme//TODOv3
		return this.bodyparts;
	}
}
