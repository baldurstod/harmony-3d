import { vec3 } from 'gl-matrix';
import { SourceBSP } from './sourcebsp';

/**
 * BSP lump
 * @param {Number} type The lump type
 */
class SEBaseBspLump {
	map: SourceBSP;
	initialized = false;
	mapOffset;
	mapLength;
	lumpOffset;
	lumpLen;
	lumpDataPromise = null;
	reader;
	lzmaReader;
	mapLen;
	lumpVersion;
	lumpData;
	lumpType;
	constructor(map: SourceBSP, reader, offset?, length?) {//struct lump_t
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
	getMapLen() {
		return this.mapLen;
	}

	/**
	 * Set lump Version
	 * @param {Number} newLumpVersion The lump Version
	 */
	setLumpVersion(newLumpVersion) {
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
	setLumpData(newLumpData) {
		this.lumpData = newLumpData;
	}

	/**
	 * Get lump data
	 * @return {Object} The lump data
	 */
	getLumpData() {
		const datas = this.lumpData;
		if (!datas) {
			this.initDatas();
		}
		return this.lumpData;
	}

	getReader() {
		if (!this.initialized) {
			this.init();
		}
		if (this.lzmaReader) {
			this.lzmaReader.seek(0);
			return this.lzmaReader;
		} else {
			this.reader.seek(this.lumpOffset);
			return this.reader;
		}
	}

	initDatas() {
	}
}

/**
 * BSP lump
 * @param {Number} type The lump type
 */
export class SourceBSPLump extends SEBaseBspLump {
	constructor(map, type, reader, offset, length) {//struct lump_t
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

export const SourceBSPLumpPlane = function () {
	this.normal = null; // normal vector
	this.dist = null; // distance from origin
	this.type = null; // plane axis identifier
}
export const SourceBSPLumpEdge = function () {
	// f: first index s: second index
	this.f = null; // better than store as an array of 2 ?
	this.s = null;
}
export const SourceBSPLumpFace = function () {
	this.planenum = null;
	this.side = null;
	this.onNode = null;
	this.firstedge = null;
	this.numedges = null;
	this.texinfo = null;
	this.dispinfo = null;
	this.surfaceFogVolumeID = null;
	this.styles = [];
	this.lightofs = null;
	this.area = null;
	this.LightmapTextureMinsInLuxels = null;
	this.LightmapTextureSizeInLuxels = null;
	this.origFace = null;
	this.numPrims = null;
	this.firstPrimID = null;
	this.smoothingGroups = null;
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



export const SourceBSPLumpTexData = function () {
	this.reflectivity = null;// RGB reflectivity
	this.nameStringTableID = null;// index into TexdataStringTable
	this.width = null;
	this.height = null;		// source image
	this.view_width = null;
	this.view_height = null;

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
	id;
	flags;
	version;
	constructor(map, reader) {//struct lump_t
		super(map, reader);//TODOv3
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
	}
}


export const SourceBSPLumpPropStaticDirectory = function () {
	this.name = [];
	this.leaf = [];
	this.props = [];
}

const SourceBSPLumpPropDetailDirectory = function () {
	this.name = [];
	this.leaf = [];
	this.props = [];
}

export const SourceBSPLumpPropStatic = function () {
	this.position = null;
	this.angles = vec3.create();
	this.propType = null;
	this.firstLeaf = null;
	this.leafCount = null;
	this.solid = null;
	this.flags = null;
	this.skin = null;
	this.fadeMinDist = null;
	this.fadeMaxDist = null;
	this.lightingOrigin = null;
	this.forcedFadeScale = null;
	this.minDXLevel = null;
	this.maxDXLevel = null;
	this.minCPULevel = null;
	this.maxCPULevel = null;
	this.minGPULevel = null;
	this.maxGPULevel = null;
	this.diffuseModulation = null;
	this.disableX360 = null;

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


export const SourceBSPLumpTexInfo = function () {
	this.textureVecs = [];	// [s/t][xyz offset]
	this.lightmapVecs = [];	// [s/t][xyz offset] - length is in units of texels/area
	this.flags;			// miptex flags	overrides
	this.texdata;
}

export const SourceBSPLumpDispInfo = function () {
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

export const SourceBSPLumpDispNeighbor = function () {
	//CDispSubNeighbor	m_SubNeighbors[2];
	this.subNeighbors = [];
}

export const SourceBSPLumpDispSubNeighbor = function () {
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

export const SourceBSPLumpDispVertex = function () {
	/*	Vector	vec;	// Vector field defining displacement volume.
		float	dist;	// Displacement distances.
		float	alpha;	// 'per vertex' alpha values.*/
};

export const SourceBSPLumpColorRGBExp32 = function () {
	/*	Vector	vec;	// Vector field defining displacement volume.
		float	dist;	// Displacement distances.
		float	alpha;	// 'per vertex' alpha values.*/
};


export const SourceBSPLumpBrush = function () {
	this.firstside = null;
	this.numsides = null;
	this.contents = null;
}

export const SourceBSPLumpBrushSide = function () {
	this.planenum = null;
	this.texinfo = null;
	this.dispinfo = null;
	this.bevel = null;
}

export const SourceBSPLumpModel = function () {
	this.mins = null;
	this.maxs = null;
	this.position = null;
	this.headnode = null;
	this.firstface = null;
	this.numfaces = null;
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
	contents = null;
	cluster = null;
	areaflags = null;
	mins = null;
	maxs = null;
	firstleafface = null;
	numleaffaces = null;
	firstleafbrush = null;
	numleafbrushes = null;
	leafWaterDataID = null;

	contains(position) {
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
	planenum = null;
	children = null;
	mins = null;
	maxs = null;
	firstface = null;
	numfaces = null;
	area = null;

	contains(position) {
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


export class SourceBSPLumpOverlay {
	id;
	texInfo;
	FaceCountAndRenderOrder;
	faces
	U;
	V;
	UVPoint0;
	UVPoint1;
	UVPoint2;
	UVPoint3;
	Origin;
	BasisNormal;
}


//TODO: put somewhere else
function parseVector(str) {
	const regex = / *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) */i;

	const result = regex.exec(str);
	if (result) {
		return vec3.fromValues(Number(result[1]), Number(result[3]), Number(result[5]));
	}
	return null;
}

//TODO: put somewhere else
function parseAngles(str) {
	const angles = parseVector(str)
	if (angles) {
		return vec3.scale(angles, angles, Math.PI / 180);
	}
	return null;
}

//angles[PITCH, YAW, ROLL]
function AngleVectors(angles, forward) {
	const sy = Math.sin(angles[1]);
	const cy = Math.cos(angles[1]);
	const sp = Math.sin(angles[0]);
	const cp = Math.cos(angles[0]);

	forward[0] = cp * cy;
	forward[1] = cp * sy;
	forward[2] = -sp;
}
