import { vec3, vec4 } from 'gl-matrix';
import { BinaryReader } from 'harmony-binary-reader';
import { SourceBSP } from './sourcebsp';
import { KvReader } from './kvreader';

export type LumpPakFile = {
	cs: number;
	fp: number;
	cm: number;
	us: number;
}

export type LumpData = vec3[] | number[] | string[] |
	SourceBSPLumpPlane[] | SourceBSPLumpTexData[] |
{ clusterCount: number, clusterVis: Uint8Array } | SourceBSPLumpNode[] | SourceBSPLumpTexInfo[] | SourceBSPLumpFace[] | SourceBSPLumpColorRGBExp32[] |
	SourceBSPLumpLeaf[] | SourceBSPLumpEdge[] | SourceBSPLumpModel[] | SourceBSPLumpBrush[] | SourceBSPLumpBrushSide[] |
	Map<string, SourceBSPLumpGameLump> | SourceBSPLumpPropStaticDirectory | Map<string, LumpPakFile> | SourceBSPLumpOverlay[] |
	SourceBSPLumpDispInfo[] | SourceBSPLumpDispVertex[] | SourceBSPLumpEntity;

/**
 * BSP lump
 * @param {Number} type The lump type
 */
export class SEBaseBspLump {
	map: SourceBSP;
	initialized = false;
	readonly mapOffset?: number;
	readonly mapLength?: number;
	lumpOffset;
	lumpLen: number;
	lumpDataPromise = null;
	//reader;
	#lzmaReader?: BinaryReader;
	//mapLen;
	lumpVersion = 0;
	lumpData: LumpData | null = null;
	lumpType: number = 0;

	constructor(map: SourceBSP, reader: BinaryReader, offset: number, length: number) {//struct lump_t
		this.map = map;
		//this.reader = reader;//TODOv3 remove reader
		this.mapOffset = offset;
		this.mapLength = length;
		this.lumpOffset = offset;
		this.lumpLen = length;
	}

	init() {
		throw 'remove me';
		/*
		if (this.reader.getString(4, this.lumpOffset) == 'LZMA') {
			const uncompressedSize = this.reader.getUint32();
			const compressedSize = this.reader.getUint32();
			const properties = this.reader.getBytes(5);
			const compressedDatas = this.reader.getBytes(this.lumpLen - 17);

			this.lzmaReader = new jDataView(SourceEngine.Choreographies._decompress(properties, compressedDatas, uncompressedSize), undefined, undefined, true);

			this.lumpOffset = 0;
			this.lumpLen = uncompressedSize;
		} else {
			//lumpData.str = this.reader.getString(lump.getLumpLen(), startOffset);
		}
		this.initialized = true;
		*/
	}

	/**
	 * Set lump offset
	 * @param {Number} newLumpOffset The lump offset
	 */
	/*setLumpOffset(newLumpOffset) {
		this.lumpOffset = newLumpOffset;
	}*/

	/**
	 * Get lump offset
	 * @return {Number} The lump offset
	 */
	getLumpOffset() {
		return this.lumpOffset;
	}

	getMapOffset() {
		return this.mapOffset;
	}

	/**
	 * Set lump len
	 * @param {Number} newLumpLen The lump len
	 */
	/*setLumpLen(newLumpLen) {
		this.lumpLen = newLumpLen;
	}*/

	/**
	 * Get lump len
	 * @return {Number} The lump len
	 */

	getLumpLen() {
		return this.lumpLen;
	}
	/*
	getMapLen() {
		return this.mapLen;
	}
	*/

	/**
	 * Set lump Version
	 * @param {Number} newLumpVersion The lump Version
	 */
	setLumpVersion(newLumpVersion: number) {
		this.lumpVersion = newLumpVersion;
	}

	/**
	 * Get lump Version
	 * @return {Number} The lump Version
	 */
	getLumpVersion() {
		return this.lumpVersion;
	}

	/**
	 * Set lump Data
	 * @param {Object} newLumpData The lump data
	 */
	setLumpData(newLumpData: LumpData) {
		this.lumpData = newLumpData;
	}

	/**
	 * Get lump data
	 * @return {Object} The lump data
	 */
	getLumpData(): LumpData | null {
		const datas = this.lumpData;
		if (!datas) {
			this.initDatas();
		}
		return this.lumpData;
	}

	/*
	getReader() {
		if (!this.initialized) {
			this.init();
		}
		if (this.#lzmaReader) {
			this.#lzmaReader.seek(0);
			return this.#lzmaReader;
		} else {
			this.reader.seek(this.lumpOffset);
			return this.reader;
		}
	}
	*/

	initDatas() {
	}
}

/**
 * BSP lump
 * @param {Number} type The lump type
 */
export class SourceBSPLump extends SEBaseBspLump {
	constructor(map: SourceBSP, type: number, reader: BinaryReader, offset: number, length: number) {//struct lump_t
		super(map, reader, offset, length);
		this.lumpType = type;
	}
}

export const LUMP_ENTITIES = 0;
export const LUMP_PLANES = 1;
export const LUMP_TEXDATA = 2;
export const LUMP_VERTEXES = 3;
export const LUMP_VISIBILITY = 4;
export const LUMP_NODES = 5;
export const LUMP_TEXINFO = 6;
export const LUMP_FACES = 7;
export const LUMP_LIGHTING = 8;
export const LUMP_OCCLUSION = 9;
export const LUMP_LEAFS = 10;
export const LUMP_FACEIDS = 11;
export const LUMP_EDGES = 12;
export const LUMP_SURFEDGES = 13;
export const LUMP_MODELS = 14;
export const LUMP_WORLDLIGHTS = 15;
export const LUMP_LEAFFACES = 16;
export const LUMP_LEAFBRUSHES = 17;
export const LUMP_BRUSHES = 18;
export const LUMP_BRUSHSIDES = 19;
export const LUMP_AREAS = 20;
export const LUMP_AREAPORTALS = 21;
export const LUMP_UNUSED0 = 22;
export const LUMP_UNUSED1 = 23;
export const LUMP_UNUSED2 = 24;
export const LUMP_UNUSED3 = 25;
export const LUMP_DISPINFO = 26;
export const LUMP_ORIGINALFACES = 27;
export const LUMP_PHYSDISP = 28;
export const LUMP_PHYSCOLLIDE = 29;
export const LUMP_VERTNORMALS = 30;
export const LUMP_VERTNORMALINDICES = 31;
export const LUMP_DISP_LIGHTMAP_ALPHAS = 32;
export const LUMP_DISP_VERTS = 33;		// CDispVerts
export const LUMP_DISP_LIGHTMAP_SAMPLE_POSITIONS = 34;	// For each displacement
//		 For each lightmap sample
//				 byte for index
//				 if 255; then index = next byte + 255
//				 3 bytes for barycentric coordinates
// The game lump is a method of adding game-specific lumps
// FIXME: Eventually; all lumps could use the game lump system
export const LUMP_GAME_LUMP = 35;
export const LUMP_LEAFWATERDATA = 36;
export const LUMP_PRIMITIVES = 37;
export const LUMP_PRIMVERTS = 38;
export const LUMP_PRIMINDICES = 39;
// A pak file can be embedded in a .bsp now; and the file system will search the pak
//	file first for any referenced names; before deferring to the game directory
//	file system/pak files and finally the base directory file system/pak files.
export const LUMP_PAKFILE = 40;
export const LUMP_CLIPPORTALVERTS = 41;
// A map can have a number of cubemap entities in it which cause cubemap renders
// to be taken after running vrad.
export const LUMP_CUBEMAPS = 42;
export const LUMP_TEXDATA_STRING_DATA = 43;
export const LUMP_TEXDATA_STRING_TABLE = 44;
export const LUMP_OVERLAYS = 45;
export const LUMP_LEAFMINDISTTOWATER = 46;
export const LUMP_FACE_MACRO_TEXTURE_INFO = 47;
export const LUMP_DISP_TRIS = 48;
export const LUMP_PHYSCOLLIDESURFACE = 49;	// deprecated.	We no longer use win32-specific havok compression on terrain
export const LUMP_WATEROVERLAYS = 50;
export const LUMP_LEAF_AMBIENT_INDEX_HDR = 51;	// index of LUMP_LEAF_AMBIENT_LIGHTING_HDR
export const LUMP_LEAF_AMBIENT_INDEX = 52;	// index of LUMP_LEAF_AMBIENT_LIGHTING

// optional lumps for HDR
export const LUMP_LIGHTING_HDR = 53;
export const LUMP_WORLDLIGHTS_HDR = 54;
export const LUMP_LEAF_AMBIENT_LIGHTING_HDR = 55;	// NOTE: this data overrides part of the data stored in LUMP_LEAFS.
export const LUMP_LEAF_AMBIENT_LIGHTING = 56;	// NOTE: this data overrides part of the data stored in LUMP_LEAFS.

export const LUMP_XZIPPAKFILE = 57;	 // deprecated. xbox 1: xzip version of pak file
export const LUMP_FACES_HDR = 58;	// HDR maps may have different face data.
export const LUMP_MAP_FLAGS = 59;	 // extended level-wide flags. not present in all levels
export const LUMP_OVERLAY_FADES = 60;	// Fade distances for overlays

export class SourceBSPLumpPlane {
	normal: vec3;
	dist: number;
	type: number;

	constructor(normal: vec3, dist: number, type: number) {
		this.normal = vec3.clone(normal); // normal vector
		this.dist = dist; // distance from origin
		this.type = type; // plane axis identifier
	}
}

export class SourceBSPLumpEdge {
	// f: first index s: second index
	f = 0; // better than store as an array of 2 ?
	s = 0;
}

export class SourceBSPLumpFace {
	initialized = false;
	planenum = 0;
	side = 0;
	onNode = 0;
	firstedge = 0;
	numedges = 0;
	texinfo = 0;
	dispinfo = 0;
	surfaceFogVolumeID = 0;
	readonly styles: number[] = [];
	lightofs = 0;
	area = 0;
	readonly lightmapTextureMinsInLuxels: number[] = [];
	readonly lightmapTextureSizeInLuxels: number[] = [];
	origFace = 0;
	numPrims = 0;
	firstPrimID = 0;
	smoothingGroups = 0;
}
/*
unsigned short	planenum;		// the plane number
byte		side;			// faces opposite to the node's plane direction
byte		onNode;			// 1 of on node, 0 if in leaf
int		firstedge;		// index into surfedges
short		numedges;		// number of surfedges
short		texinfo;		// texture info
short		dispinfo;		// displacement info
short		surfaceFogVolumeID;	// ?
byte		styles[4];		// switchable lighting info
int		lightofs;		// offset into lightmap lump
float		area;			// face area in units^2
int		LightmapTextureMinsInLuxels[2];	// texture lighting info
int		LightmapTextureSizeInLuxels[2];	// texture lighting info
int		origFace;		// original face this was split from
unsigned short	numPrims;		// primitives
unsigned short	firstPrimID;
unsigned int	smoothingGroups;	// lightmap smoothing group
*/



export class SourceBSPLumpTexData {
	reflectivity: vec3 = vec3.create();// RGB reflectivity
	nameStringTableID = 0;// index into TexdataStringTable
	width = 0;
	height = 0;		// source image
	view_width = 0;
	view_height = 0;
}
/*
const SourceBSPLumpGameLump = function() {
	this.id = null;		// gamelump ID
	this.flags = null;		// flags
	this.version = null;	// gamelump version
	this.fileofs = null;	// offset to this gamelump
	this.filelen = null;	// length
}*/

/**
 * BSP lump
 * @param {Number} type The lump type
 */
export class SourceBSPLumpGameLump extends SEBaseBspLump {
	id = '';
	flags = 0;
	version = 0;

	//constructor(map, reader) {//struct lump_t
	//super(map, reader);//TODOv3
	/*this.lumpOffset = this.mapReader.getInt32();
	this.lumpLen = this.mapReader.getInt32();
	this.lumpVersion = this.mapReader.getInt32();
	this.fourCC = this.mapReader.getInt32();
	this.lumpData = null;*/
	//lump.setLumpOffset(this.reader.getInt32());
	//lump.setLumpLen(this.reader.getInt32());
	//lump.setLumpVersion(this.reader.getInt32());
	//this.reader.getInt32() // TODO: replace by lump fourCC

	//this.init();
	//}
}


export class SourceBSPLumpPropStaticDirectory {
	readonly name: string[] = [];
	readonly leaf: number[] = [];
	readonly props: SourceBSPLumpPropStatic[] = [];
}

class SourceBSPLumpPropDetailDirectory {
	name = [];
	leaf = [];
	props = [];
}

export class SourceBSPLumpPropStatic {
	readonly position = vec3.create();
	readonly angles = vec3.create();
	propType = 0;
	firstLeaf = 0;
	leafCount = 0;
	solid = 0;
	flags = 0;
	skin = 0;
	fadeMinDist = 0;
	fadeMaxDist = 0;
	readonly lightingOrigin = vec3.create();
	forcedFadeScale = 0;
	minDXLevel = 0;
	maxDXLevel = 0;
	minCPULevel = 0;
	maxCPULevel = 0;
	minGPULevel = 0;
	maxGPULevel = 0;
	diffuseModulation = 0;
	disableX360 = 0;

	/*// v4
	Vector		Origin;		 // origin
	QAngle		Angles;		 // orientation (pitch roll yaw)
	unsigned short	PropType;	 // index into model name dictionary
	unsigned short	FirstLeaf;	 // index into leaf array
	unsigned short	LeafCount;
	unsigned char	Solid;		 // solidity type
	unsigned char	Flags;
	int		Skin;		 // model skin numbers
	float		FadeMinDist;
	float		FadeMaxDist;
	Vector		LightingOrigin;	// for lighting
	// since v5
	float		ForcedFadeScale; // fade distance scale
	// v6 and v7 only
	unsigned short	MinDXLevel;			// minimum DirectX version to be visible
	unsigned short	MaxDXLevel;			// maximum DirectX version to be visible
	// since v8
	unsigned char	 MinCPULevel;
	unsigned char	 MaxCPULevel;
	unsigned char	 MinGPULevel;
	unsigned char	 MaxGPULevel;
	// since v7
	color32				 DiffuseModulation; // per instance color and alpha modulation
	// since v10
	float					 unknown;
	// since v9
	bool						DisableX360;		 // if true, don't show on XBox 360
	*/
}


export class SourceBSPLumpTexInfo {
	textureVecs: [vec4, vec4] = [vec4.create(), vec4.create()];	// [s/t][xyz offset]
	lightmapVecs: [vec4, vec4] = [vec4.create(), vec4.create()];		// [s/t][xyz offset] - length is in units of texels/area
	flags = 0;			// miptex flags	overrides
	texdata = 0;
}

export class SourceBSPLumpDispInfo {
	readonly startPosition = vec3.create();
	dispVertStart = 0;
	dispTriStart = 0;
	power = 0;
	minTess = 0;
	smoothingAngle = 0;
	contents = 0;
	mapFace = 0;
	lightmapAlphaStart = 0;
	lightmapSamplePositionStart = 0;
	readonly allowedVerts: number[] = [];

	/*Vector			startPosition;		// start position used for orientation
	int			DispVertStart;		// Index into LUMP_DISP_VERTS.
	int			DispTriStart;		// Index into LUMP_DISP_TRIS.
	int			power;			// power - indicates size of surface (2^power	1)
	int			minTess;		// minimum tesselation allowed
	float			smoothingAngle;		// lighting smoothing angle
	int			contents;		// surface contents
	unsigned short		MapFace;		// Which map face this displacement comes from.
	int			LightmapAlphaStart;	// Index into ddisplightmapalpha.
	int			LightmapSamplePositionStart;	// Index into LUMP_DISP_LIGHTMAP_SAMPLE_POSITIONS.
	CDispNeighbor		EdgeNeighbors[4];	// Indexed by NEIGHBOREDGE_ defines.
	CDispCornerNeighbors	CornerNeighbors[4];	// Indexed by CORNER_ defines.
	unsigned int		AllowedVerts[10];	// active verticies*/
}

export class SourceBSPLumpDispNeighbor {
	subNeighbors: SourceBSPLumpDispSubNeighbor[] = [];

	//CDispSubNeighbor	m_SubNeighbors[2];
	//this.subNeighbors = [];
}

export class SourceBSPLumpDispSubNeighbor {
	iNeighbor = 0;
	orientation = 0;
	span = 0;
	neighSpan = 0;
	/*	unsigned short		m_iNeighbor;		// This indexes into ddispinfos.
												// 0xFFFF if there is no neighbor here.

		unsigned char		m_NeighborOrientation;		// (CCW) rotation of the neighbor wrt this displacement.

		// These use the NeighborSpan type.
		unsigned char		m_Span;						// Where the neighbor fits onto this side of our displacement.
		unsigned char		m_NeighborSpan;				// Where we fit onto our neighbor.								 */
}

/*TODO
const SourceBSPLumpDispSubNeighbor
{
};*/

export class SourceBSPLumpDispVertex {
	readonly vec = vec3.create();
	dist = 0;
	alpha = 0;

	/*	Vector	vec;	// Vector field defining displacement volume.
		float	dist;	// Displacement distances.
		float	alpha;	// 'per vertex' alpha values.*/
}

export class SourceBSPLumpColorRGBExp32 {
	readonly color = vec4.create();
	/*	Vector	vec;	// Vector field defining displacement volume.
		float	dist;	// Displacement distances.
		float	alpha;	// 'per vertex' alpha values.*/
}


export class SourceBSPLumpBrush {
	firstside = 0;
	numsides = 0;
	contents = 0;
}

export class SourceBSPLumpBrushSide {
	planenum = 0;
	texinfo = 0;
	dispinfo = 0;
	bevel = 0;
}

export class SourceBSPLumpModel {
	//readonly mins = vec3.create();
	//readonly maxs = vec3.create();
	readonly position = vec3.create();
	headnode = 0;
	firstface = 0;
	numfaces = 0;
}

/*const SourceBSPLumpLeaf = function() {
/*

	DECLARE_BYTESWAP_DATADESC();
	int				contents;			// OR of all brushes (not needed?)

	short			cluster;

	BEGIN_BITFIELD(bf);
	short			area:9;
	short			flags:7;			// Per leaf flags.
	END_BITFIELD();

	short			mins[3];			// for frustum culling
	short			maxs[3];

	unsigned short	firstleafface;
	unsigned short	numleaffaces;

	unsigned short	firstleafbrush;
	unsigned short	numleafbrushes;
	* /
	this.contents = null;
	this.cluster = null;
	this.areaflags = null;
	this.mins = null;
	this.maxs = null;
	this.firstleafface = null;
	this.numleaffaces = null;
	this.firstleafbrush = null;
	this.numleafbrushes = null;
	this.leafWaterDataID = null;
}*/


export class SourceBSPLumpLeaf {
	contents = 0;
	cluster = -1;
	areaflags = 0;
	readonly mins = vec3.create();
	readonly maxs = vec3.create();
	firstleafface = 0;
	numleaffaces = 0;
	firstleafbrush = 0;
	numleafbrushes = 0;
	leafWaterDataID = 0;

	contains(position: vec3) {
		const mins = this.mins;
		const maxs = this.maxs;
		if (
			mins[0] <= position[0]
			&& mins[1] <= position[1]
			&& mins[2] <= position[2]
			&& maxs[0] >= position[0]
			&& maxs[1] >= position[1]
			&& maxs[2] >= position[2]
		) {
			return true;
		}
		return false;
	}
}
/*const SourceBSPLumpNode = function() {
/*
int			planenum;
int			children[2];	// negative numbers are -(leafs+1), not nodes
short		mins[3];		// for frustom culling
short		maxs[3];
unsigned short	firstface;
unsigned short	numfaces;	// counting both sides
short			area;		// If all leaves below this node are in the same area, then
							// this is the area index. If not, this is -1.
	* /
	this.planenum = null;
	this.children = null;
	this.mins = null;
	this.maxs = null;
	this.firstface = null;
	this.numfaces = null;
	this.area = null;
}*/

export class SourceBSPLumpNode {
	planenum = 0;
	readonly children: [number, number] = [0, 0];
	readonly mins = vec3.create();
	readonly maxs = vec3.create();
	firstface = -1;
	numfaces = -1;
	area = 0;

	contains(position: vec3) {
		const mins = this.mins;
		const maxs = this.maxs;
		if (
			mins[0] <= position[0]
			&& mins[1] <= position[1]
			&& mins[2] <= position[2]
			&& maxs[0] >= position[0]
			&& maxs[1] >= position[1]
			&& maxs[2] >= position[2]
		) {
			return true;
		}
		return false;
	}
}


export const OVERLAY_BSP_FACE_COUNT = 64;
export class SourceBSPLumpOverlay {
	id = 0;
	texInfo = 0;
	FaceCountAndRenderOrder = 0;
	readonly faces = new Int32Array(OVERLAY_BSP_FACE_COUNT);
	readonly u: [number, number] = [0, 0];
	readonly v: [number, number] = [0, 0];
	readonly uvPoint0 = vec3.create();
	readonly uvPoint1 = vec3.create();
	readonly uvPoint2 = vec3.create();
	readonly uvPoint3 = vec3.create();
	readonly origin = vec3.create();
	readonly basisNormal = vec3.create();
}

export class SourceBSPLumpEntity {
	str = '';
	kv!: KvReader;
}


//TODO: put somewhere else
function parseVector(str: string) {
	const regex = / *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) */i;

	const result = regex.exec(str);
	if (result) {
		return vec3.fromValues(Number(result[1]), Number(result[3]), Number(result[5]));
	}
	return null;
}

//TODO: put somewhere else
function parseAngles(str: string) {
	const angles = parseVector(str)
	if (angles) {
		return vec3.scale(angles, angles, Math.PI / 180);
	}
	return null;
}

//angles[PITCH, YAW, ROLL]
function AngleVectors(angles: vec3, forward: vec3) {
	const sy = Math.sin(angles[1]);
	const cy = Math.cos(angles[1]);
	const sp = Math.sin(angles[0]);
	const cp = Math.cos(angles[0]);

	forward[0] = cp * cy;
	forward[1] = cp * sy;
	forward[2] = -sp;
}
