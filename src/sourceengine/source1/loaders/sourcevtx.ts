/**
 * VTX Model
 */


export class VTXBodyPart {
	models: Array<VTXModel> = [];
	numModels: number = 0;
}

export class VTXModel {
	lods: Array<VTXLod> = [];
	numLODs: number = 0;
}

export class VTXLod {
	meshes: Array<VTXMesh> = [];
	numMeshes: number = 0;
	switchPoint: number = 0;
}

export class VTXMesh {
	stripGroups: Array<VTXStripGroupHeader> = [];
	numStripGroups: number = 0;
}
/*
export class VTXStripGroup {
	stripGroups = [];
}
	*/

export class VTXStripGroupHeader {
	vertices: Array<MdlVertex> = [];
	indexes: Array<number> = [];
	strips: Array<MdlStripHeader> = [];

	numVerts: number = 0;
	numIndices: number = 0;
	numStrips: number = 0;
	flags: number = 0;
}


export class MdlVertex {
	boneWeightIndex: Array<number> = [];
	boneID: Array<number> = [];
	numBones: number = 0;
	origMeshVertID: number = 0;
}

export class MdlStripHeader {
	vertices = [];
	indexes = [];
	numIndices: number = 0;
	indexOffset: number = 0;
	numVerts: number = 0;
	vertOffset: number = 0;
	numBones: number = 0;
	flags: number = 0;
	numBoneStateChanges: number = 0;
	boneStateChangeOffset: number = 0;
}



export class SourceVtx {
	bodyparts: Array<VTXBodyPart> = [];
	version: number = 0;
	vertCacheSize: number = 0;
	maxBonesPerStrip: number = 0;
	maxBonesPerFace: number = 0;
	maxBonesPerVert: number = 0;
	checkSum: number = 0;
	numLODs: number = 0;
	materialReplacementListOffset: number = 0;
	numBodyParts: number = 0;
	bodyPartOffset: number = 0;

	getBodyparts() {//removeme//TODOv3
		return this.bodyparts;
	}
}
