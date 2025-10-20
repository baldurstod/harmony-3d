import { quat, vec3, vec4 } from 'gl-matrix';
import { BinaryReader } from 'harmony-binary-reader';
import { LOG, WARN } from '../../../buildoptions';
import { DEG_TO_RAD } from '../../../math/constants';
import { SourceBinaryLoader } from '../../common/loaders/sourcebinaryloader';
import { DecompressLZMA, stringStrip } from '../utils/utils';
import { KvReader } from './kvreader';
import { Source1VmtLoader } from './source1vmtloader';
import { SourceBSP } from './sourcebsp';
import {
	LUMP_BRUSHES, LUMP_BRUSHSIDES,
	LUMP_DISP_TRIS,
	LUMP_DISP_VERTS,
	LUMP_DISPINFO,
	LUMP_EDGES,
	LUMP_ENTITIES,
	LUMP_FACES,
	LUMP_FACES_HDR,
	LUMP_GAME_LUMP,
	LUMP_LEAFBRUSHES,
	LUMP_LEAFFACES,
	LUMP_LEAFS,
	LUMP_LIGHTING,
	LUMP_LIGHTING_HDR,
	LUMP_MODELS,
	LUMP_NODES,
	LUMP_ORIGINALFACES,
	LUMP_OVERLAYS,
	LUMP_PAKFILE,
	LUMP_PLANES,
	LUMP_SURFEDGES,
	LUMP_TEXDATA,
	LUMP_TEXDATA_STRING_DATA, LUMP_TEXDATA_STRING_TABLE,
	LUMP_TEXINFO,
	LUMP_VERTEXES, LUMP_VISIBILITY,
	LumpPakFile,
	OVERLAY_BSP_FACE_COUNT,
	SEBaseBspLump,
	SourceBSPLump,
	SourceBSPLumpBrush, SourceBSPLumpBrushSide,
	SourceBSPLumpColorRGBExp32,
	SourceBSPLumpDispInfo, SourceBSPLumpDispNeighbor, SourceBSPLumpDispSubNeighbor,
	SourceBSPLumpDispVertex,
	SourceBSPLumpEdge,
	SourceBSPLumpEntity,
	SourceBSPLumpFace,
	SourceBSPLumpGameLump,
	SourceBSPLumpLeaf,
	SourceBSPLumpModel,
	SourceBSPLumpNode,
	SourceBSPLumpOverlay,
	SourceBSPLumpPlane,
	SourceBSPLumpPropStatic,
	SourceBSPLumpPropStaticDirectory,
	SourceBSPLumpTexData,
	SourceBSPLumpTexInfo
} from './sourcebsplump';

const BSP_HEADER_LUMPS_COUNT = 64;
const BYTES_PER_LUMP_HEADER = 16;

function initLZMALump(reader: BinaryReader, lump: SourceBSPLump) {
	if (reader.getString(4, lump.lumpOffset) === 'LZMA') {
		const uncompressedSize = reader.getUint32();
		const compressedSize = reader.getUint32();
		const properties = reader.getBytes(5);
		const compressedDatas = reader.getBytes(compressedSize);// 4 + 4 + 4 + 5

		const result = DecompressLZMA(properties, compressedDatas, uncompressedSize)

		if (result) {
			reader = new BinaryReader(result);
		}

		lump.lumpOffset = 0;
		lump.lumpLen = uncompressedSize;
	}
	return reader;
}

export class Source1BspLoader extends SourceBinaryLoader {
	parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer) {
		const bsp = new SourceBSP({ repository: repository, name: fileName });
		//bsp.loader = this;
		const reader = new BinaryReader(arrayBuffer);

		this.#parseHeader(reader, bsp);
		this.#parseLumps(reader, bsp);

		return bsp;
	}

	#parseHeader(reader: BinaryReader, bsp: SourceBSP) {
		reader.seek(4); //skip first 4 char TODO: check == 'VBSP' ?

		bsp.bspFileVersion = reader.getInt32();
		this.#parseLumpDirectory(reader, bsp);
		bsp.mapRevision = reader.getInt32();
	}

	#parseLumpDirectory(reader: BinaryReader, bsp: SourceBSP) {
		const startOffset = reader.tell();

		for (let lumpIndex = 0; lumpIndex < BSP_HEADER_LUMPS_COUNT; ++lumpIndex) {
			reader.seek(startOffset + lumpIndex * 16);

			const lumpOffset = reader.getInt32();
			const lumpLen = reader.getInt32();

			const lump = new SourceBSPLump(bsp, lumpIndex, reader, lumpOffset, lumpLen);//lump type is the index in lump directory
			//lump.setLumpOffset(reader.getInt32());
			//lump.setLumpLen(reader.getInt32());
			lump.setLumpVersion(reader.getInt32());
			//reader.getInt32() // TODO: replace by lump fourCC
			//lump.init();
			bsp.addLump(lump);
		}
	}

	#parseLumps(reader: BinaryReader, bsp: SourceBSP) {
		for (const lump of bsp.lumps) {
			this.#parseLump(reader, lump, bsp);//TODOv3: lzma
			//console.error(lump);
		}
	}

	#parseLump(reader: BinaryReader, lump: SourceBSPLump, bsp: SourceBSP) {
		const lumpData = null;
		if (lump.lumpLen !== 0) {
			/*if (reader.getString(4, lump.lumpOffset) === 'LZMA') {
				const uncompressedSize = reader.getUint32();
				const compressedSize = reader.getUint32();
				const properties = reader.getBytes(5);
				const compressedDatas = reader.getBytes(lump.lumpLen - 17);// 4 + 4 + 4 + 5

				reader = new BinaryReader(DecompressLZMA(properties, compressedDatas, uncompressedSize));

				lump.lumpOffset = 0;
				lump.lumpLen = uncompressedSize;
			}*/
			reader = initLZMALump(reader, lump);
			switch (lump.lumpType) {
				case LUMP_ENTITIES:
					this.#parseLumpEntities(reader, lump);
					break;
				case LUMP_PLANES:
					this.#parseLumpPlanes(reader, lump);
					break;
				case LUMP_VERTEXES:
					this.#parseLumpVertices(reader, lump);
					break;
				case LUMP_VISIBILITY:
					this.#parseLumpVisibility(reader, lump);
					break;
				case LUMP_EDGES:
					this.#parseLumpEdges(reader, lump);
					break;
				case LUMP_SURFEDGES:
					this.#parseLumpSurfEdges(reader, lump);
					break;
				case LUMP_FACES:
				case LUMP_ORIGINALFACES://TODO: remove if useless
				case LUMP_FACES_HDR:
					this.#parseLumpFaces(reader, lump);
					break;
				case LUMP_TEXDATA:
					this.#parseLumpTexdata(reader, lump);
					break;
				case LUMP_TEXDATA_STRING_DATA:
					this.#parseLumpTexdataStringData(reader, lump);
					break;
				case LUMP_TEXDATA_STRING_TABLE:
					this.#parseLumpTexdataStringTable(reader, lump);
					break;
				case LUMP_GAME_LUMP:
					this.#parseLumpGameDirectory(reader, lump, bsp);
					break;
				case LUMP_TEXINFO:
					this.#parseLumpTexInfo(reader, lump);
					break;
				case LUMP_DISPINFO:
					this.#parseLumpDispInfo(reader, lump);
					break;
				case LUMP_DISP_VERTS:
					this.#parseLumpDispVerts(reader, lump);
					break;
				case LUMP_DISP_TRIS:
					//this._parseLumpDispTris(reader, lump);//TODOv3
					break;
				case LUMP_LIGHTING:
				case LUMP_LIGHTING_HDR:
					this.#parseLumpLighting(reader, lump);
					break;
				case LUMP_BRUSHES:
					this.#parseLumpBrushes(reader, lump);
					break;
				case LUMP_BRUSHSIDES:
					this.#parseLumpBrushSides(reader, lump);
					break;
				case LUMP_MODELS:
					this.#parseLumpModels(reader, lump);
					break;
				case LUMP_LEAFS:
					this.#parseLumpLeafs(reader, lump);
					break;
				case LUMP_LEAFFACES:
					this.#parseLumpLeafFaces(reader, lump);
					break;
				case LUMP_LEAFBRUSHES:
					this.#parseLumpLeafbrushes(reader, lump);
					break;
				case LUMP_NODES:
					this.#parseLumpNodes(reader, lump);
					break;
				case LUMP_PAKFILE:
					this.#parseLumpPakFile(reader, lump);
					break;
				case LUMP_OVERLAYS:
					this.#parseLumpOverlays(reader, lump);
					break;
				default:
					if (WARN) {
						console.warn('Unknown lump type ', lump.lumpType);
					}
					break;
			}
		}
	}

	#parseLumpEntities(reader: BinaryReader, lump: SourceBSPLump) {
		const lumpData = new SourceBSPLumpEntity();
		lumpData.str = reader.getString(lump.getLumpLen(), lump.lumpOffset);

		const kv = new KvReader();
		kv.readText(lumpData.str);
		lumpData.kv = kv;
		if (LOG) {
			console.log(kv);
		}

		lump.setLumpData(lumpData);
	}

	#parseLumpPlanes(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_PLANE = 20;
		const planesCount = lump.getLumpLen() / BYTES_PER_PLANE;
		const lumpData: SourceBSPLumpPlane[] = [];
		for (let planeIndex = 0; planeIndex < planesCount; planeIndex++) {
			const plane = new SourceBSPLumpPlane(reader.getVector3()/*TODO: optimize*/, reader.getFloat32(), reader.getInt32());
			lumpData.push(plane);
		}
		lump.setLumpData(lumpData);
	}

	#parseLumpTexdata(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_TEXDATA = 32;
		const texdataCount = lump.getLumpLen() / BYTES_PER_TEXDATA;

		const lumpData = [];
		for (let texdataIndex = 0; texdataIndex < texdataCount; ++texdataIndex) {
			const texdata = new SourceBSPLumpTexData();
			reader.getVector3(undefined, undefined, texdata.reflectivity as Float32Array);
			texdata.nameStringTableID = reader.getInt32();
			texdata.width = reader.getInt32();
			texdata.height = reader.getInt32();
			texdata.view_width = reader.getInt32();
			texdata.view_height = reader.getInt32();

			lumpData.push(texdata);
		}
		lump.setLumpData(lumpData);
	}

	#parseLumpVertices(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_VERTEX = 12;
		const verticesCount = lump.getLumpLen() / BYTES_PER_VERTEX;
		const lumpData: vec3[] = [];

		for (let vertexIndex = 0; vertexIndex < verticesCount; ++vertexIndex) {
			lumpData.push(reader.getVector3());
		}

		lump.setLumpData(lumpData);
	}

	#parseLumpVisibility(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const offset = reader.tell();
		const clusterCount = reader.getInt32();
		const visOffsets = [];

		for (let clusterIndex = 0; clusterIndex < clusterCount; clusterIndex++) {
			visOffsets.push([reader.getInt32(), reader.getInt32()]);
		}

		const numBytes = Math.ceil(clusterCount / 8);
		const clusterVis = new Uint8Array(clusterCount * clusterCount);
		for (let i = 0; i < clusterCount; ++i) {
			const rleVis = new Uint8Array(reader.buffer, offset + visOffsets[i]![0]!, numBytes);//TODOv3 ???
			const clusterOfs = i * clusterCount;
			let v = 0;

			// Unpack the RLE visibility bitfield
			// See code at: http://www.flipcode.com/archives/Quake_2_BSP_File_Format.shtml
			for (let c = 0; c < clusterCount; v++) {
				if (rleVis[v] === 0) {
					v++;
					c += 8 * rleVis[v]/*TODO: actually check*/!;
				} else {
					for (let bit = 1; bit < 256; bit *= 2, c++) {
						if (rleVis[v]/*TODO: actually check*/! & bit) {
							clusterVis[clusterOfs + c] = 1;
						}
					}
				}
			}
		}

		const lumpData = { clusterCount: clusterCount, clusterVis: clusterVis };
		lump.setLumpData(lumpData);
	}

	#parseLumpNodes(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_NODE = 32;
		const nodeCount = lump.getLumpLen() / BYTES_PER_NODE;
		const lumpData = [];

		for (let nodeIndex = 0; nodeIndex < nodeCount; ++nodeIndex) {
			const node = new SourceBSPLumpNode();
			node.planenum = reader.getInt32();
			node.children[0] = reader.getInt32();
			node.children[1] = reader.getInt32();
			vec3.set(node.mins, reader.getInt16(), reader.getInt16(), reader.getInt16());
			vec3.set(node.maxs, reader.getInt16(), reader.getInt16(), reader.getInt16());
			node.firstface = reader.getUint16();
			node.numfaces = reader.getUint16();
			node.area = reader.getInt16();
			reader.getInt16();
			//console.log(node);
			lumpData.push(node);
		}

		lump.setLumpData(lumpData);
	}

	#parseLumpTexInfo(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_TEXINFO = 72;
		const texInfoCount = lump.getLumpLen() / BYTES_PER_TEXINFO;

		const lumpData = [];

		for (let texinfoIndex = 0; texinfoIndex < texInfoCount; ++texinfoIndex) {
			const texinfo = new SourceBSPLumpTexInfo();
			reader.getVector4(undefined, undefined, texinfo.textureVecs[0] as Float32Array);
			reader.getVector4(undefined, undefined, texinfo.textureVecs[1] as Float32Array);
			reader.getVector4(undefined, undefined, texinfo.lightmapVecs[0] as Float32Array);
			reader.getVector4(undefined, undefined, texinfo.lightmapVecs[1] as Float32Array);
			texinfo.flags = reader.getInt32();
			texinfo.texdata = reader.getInt32();

			lumpData.push(texinfo);
		}

		lump.setLumpData(lumpData);
	}

	#parseLumpFaces(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_FACE = 56;
		const faceCount = lump.getLumpLen() / BYTES_PER_FACE;

		const lumpData = [];

		for (let faceIndex = 0; faceIndex < faceCount; ++faceIndex) {
			const face = new SourceBSPLumpFace();
			face.planenum = reader.getInt16();
			face.side = reader.getInt8();
			face.onNode = reader.getInt8();

			face.firstedge = reader.getInt32();
			face.numedges = reader.getInt16();

			face.texinfo = reader.getInt16();
			face.dispinfo = reader.getInt16();
			face.surfaceFogVolumeID = reader.getInt16();

			for (let styleIndex = 0; styleIndex < 4; ++styleIndex) {
				const style = reader.getUint8();
				face.styles.push(style);
				/*
				if (style != 255) {
					face.styleCount = styleIndex + 1;
				}
				*/
			}

			face.lightofs = reader.getInt32() / 4;
			face.area = reader.getFloat32();

			face.lightmapTextureMinsInLuxels.push(reader.getInt32(), reader.getInt32());
			face.lightmapTextureSizeInLuxels.push(reader.getInt32(), reader.getInt32());

			//face.LightmapTextureSizeInLuxels = (face.LightmapTextureSizeInLuxels[0] + 1) * (face.LightmapTextureSizeInLuxels[1] + 1);

			face.origFace = reader.getInt32();
			face.numPrims = reader.getUint16();
			face.firstPrimID = reader.getUint16();
			face.smoothingGroups = reader.getInt32();

			lumpData.push(face);
		}

		lump.setLumpData(lumpData);
	}

	#parseLumpLighting(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_LIGHTING = 4;
		const lightingCount = lump.getLumpLen() / BYTES_PER_LIGHTING;

		const lumpData = [];
		for (let lightingIndex = 0; lightingIndex < lightingCount; ++lightingIndex) {
			const lighting = new SourceBSPLumpColorRGBExp32();
			vec4.set(lighting.color, reader.getUint8(), reader.getUint8(), reader.getUint8(), reader.getUint8());
			lumpData.push(lighting);
		}

		lump.setLumpData(lumpData);
	}

	#parseLumpLeafs(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_LEAF = 32;
		const brushSidesCount = lump.getLumpLen() / BYTES_PER_LEAF;
		const lumpData = [];

		for (let brushSideIndex = 0; brushSideIndex < brushSidesCount; ++brushSideIndex) {
			const brushSide = new SourceBSPLumpLeaf();
			brushSide.contents = reader.getInt32();
			brushSide.cluster = reader.getInt16();
			brushSide.areaflags = reader.getInt16();
			vec3.set(brushSide.mins, reader.getInt16(), reader.getInt16(), reader.getInt16());
			vec3.set(brushSide.maxs, reader.getInt16(), reader.getInt16(), reader.getInt16());
			brushSide.firstleafface = reader.getUint16();
			brushSide.numleaffaces = reader.getUint16();
			brushSide.firstleafbrush = reader.getUint16();
			brushSide.numleafbrushes = reader.getUint16();
			brushSide.leafWaterDataID = reader.getInt16();
			reader.getInt16();
			lumpData.push(brushSide);
		}

		for (const leaf of lumpData) {
			//const leaf = lumpData[brushSideIndex];
			if (leaf.numleaffaces) {
				//console.log(brushSideIndex, leaf.firstleafface, leaf.numleaffaces);
				///TODOv3
			}

		}
		lump.setLumpData(lumpData);
	}

	#parseLumpEdges(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_EDGE = 4;
		const edgesCount = lump.getLumpLen() / BYTES_PER_EDGE;

		const lumpData = [];
		for (let edgeIndex = 0; edgeIndex < edgesCount; ++edgeIndex) {
			const edge = new SourceBSPLumpEdge();
			edge.f = reader.getUint16();
			edge.s = reader.getUint16();
			lumpData.push(edge);
		}

		lump.setLumpData(lumpData);
	}

	#parseLumpSurfEdges(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_SURFEDGE = 4;
		const surfedgesCount = lump.getLumpLen() / BYTES_PER_SURFEDGE;

		const lumpData = [];
		for (let surfedgeIndex = 0; surfedgeIndex < surfedgesCount; ++surfedgeIndex) {
			lumpData.push(reader.getInt32());
		}

		lump.setLumpData(lumpData);
	}

	#parseLumpModels(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_MODEL = 48;
		const brushSidesCount = lump.getLumpLen() / BYTES_PER_MODEL;
		const lumpData = [];

		for (let brushSideIndex = 0; brushSideIndex < brushSidesCount; ++brushSideIndex) {
			const brushSide = new SourceBSPLumpModel();
			//brushSide.planenum = reader.getUint16();
			//brushSide.texinfo = reader.getInt16();
			//brushSide.dispinfo = reader.getInt16();
			reader.skip(24);
			reader.getVector3(undefined, undefined, brushSide.position as Float32Array);
			brushSide.headnode = reader.getInt32();
			brushSide.firstface = reader.getInt32();
			brushSide.numfaces = reader.getInt32();
			lumpData.push(brushSide);
		}
		lump.setLumpData(lumpData);
	}

	#parseLumpLeafFaces(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_LEAFFACE = 2;
		const brushSidesCount = lump.getLumpLen() / BYTES_PER_LEAFFACE;
		const lumpData = [];

		for (let brushSideIndex = 0; brushSideIndex < brushSidesCount; ++brushSideIndex) {
			lumpData.push(reader.getUint16());
		}

		lump.setLumpData(lumpData);
	}

	#parseLumpLeafbrushes(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_LEAFBRUSH = 2;
		const brushSidesCount = lump.getLumpLen() / BYTES_PER_LEAFBRUSH;
		const lumpData = [];

		for (let brushSideIndex = 0; brushSideIndex < brushSidesCount; ++brushSideIndex) {
			lumpData.push(reader.getUint16());
		}
		lump.setLumpData(lumpData);
	}

	#parseLumpBrushes(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_BRUSH = 12;
		const brushesCount = lump.getLumpLen() / BYTES_PER_BRUSH;
		const lumpData = [];

		for (let brushIndex = 0; brushIndex < brushesCount; ++brushIndex) {
			const brush = new SourceBSPLumpBrush();
			brush.firstside = reader.getInt32();
			brush.numsides = reader.getInt32();
			brush.contents = reader.getInt32();
			lumpData.push(brush);
		}

		lump.setLumpData(lumpData);
	}

	#parseLumpBrushSides(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_BRUSH_SIDE = 8;
		const brushSidesCount = lump.getLumpLen() / BYTES_PER_BRUSH_SIDE;
		const lumpData = [];

		for (let brushSideIndex = 0; brushSideIndex < brushSidesCount; ++brushSideIndex) {
			const brushSide = new SourceBSPLumpBrushSide();
			brushSide.planenum = reader.getUint16();
			brushSide.texinfo = reader.getInt16();
			brushSide.dispinfo = reader.getInt16();
			brushSide.bevel = reader.getInt16();
			lumpData.push(brushSide);
		}

		lump.setLumpData(lumpData);
	}

	#parseLumpGameDirectory(reader: BinaryReader, lump: SourceBSPLump, bsp: SourceBSP) {
		reader.seek(lump.lumpOffset);
		const gameCount = reader.getInt32();
		const lumpData = new Map<string, SourceBSPLumpGameLump>();//Object.create(null);

		for (let gameIndex = 0; gameIndex < gameCount; ++gameIndex) {
			const gamelump = new SourceBSPLumpGameLump(bsp, reader, 0, 0);
			gamelump.id = reader.getString(4)//Four CC
			gamelump.flags = reader.getUint16();
			gamelump.version = reader.getUint16();
			gamelump.lumpOffset = reader.getInt32();
			gamelump.lumpLen = reader.getInt32();
			lumpData.set(gamelump.id, gamelump);
		}
		for (const [_, lump] of lumpData) {
			//const lump = lumpData[gameIndex];
			const lumpReader = initLZMALump(reader, lump);
			this.#parseLumpGame(lumpReader, lump);
		}

		lump.setLumpData(lumpData);
	}

	#parseLumpGame(reader: BinaryReader, lump: SourceBSPLumpGameLump) {
		reader.seek(lump.lumpOffset);
		switch (lump.id) {
			case 'prps':
				this.#parseLumpGamePropStatic(reader, lump);
				break;
			case 'prpd':
				//this._parseLumpGamePropDetail(lump);
				break;
			default:
				if (LOG) {
					console.log('Unknown game lump ' + lump.id);
				}
				break;
		}
	}

	#parseLumpGamePropStatic(reader: BinaryReader, lump: SourceBSPLumpGameLump) {
		reader.seek(lump.lumpOffset);
		const STATIC_PROP_NAME_LENGTH = 128;
		const lumpData = [];
		const staticDir = new SourceBSPLumpPropStaticDirectory();
		//lump.map.map.staticDirRemoveMe = staticDir;//TODOv3 removeme
		const lumpVersion = lump.version;

		const nameCount = reader.getInt32();
		for (let nameIndex = 0; nameIndex < nameCount; ++nameIndex) {
			const name = stringStrip(reader.getString(STATIC_PROP_NAME_LENGTH));
			staticDir.name.push(name);
		}

		const leafCount = reader.getInt32();
		for (let leafIndex = 0; leafIndex < leafCount; ++leafIndex) {
			staticDir.leaf.push(reader.getUint16());
		}

		const propCount = reader.getInt32();

		// This is bullshit, but the structure size is not sturdy
		const propsStartOffset = reader.tell();
		const propsTotalLength = lump.getLumpLen() - (propsStartOffset - lump.getLumpOffset());
		const byteSizePerProp = Math.floor(propsTotalLength / propCount);// Should be int anyway

		for (let propIndex = 0; propIndex < propCount; ++propIndex) {
			reader.seek(propsStartOffset + propIndex * byteSizePerProp);
			const prop = new SourceBSPLumpPropStatic();
			reader.getVector3(undefined, undefined, prop.position as Float32Array);
			const angles = reader.getVector3();//TODO: memory
			prop.propType = reader.getUint16();
			if (angles[0] != 0) {
				if (LOG) { console.log(angles[0], angles[2], angles[2], staticDir.name[prop.propType]); }//TODOv3
			}
			prop.angles[0] = DEG_TO_RAD * angles[0]!;
			prop.angles[1] = DEG_TO_RAD * angles[1]!;
			prop.angles[2] = DEG_TO_RAD * angles[2]!;

			prop.firstLeaf = reader.getUint16();
			prop.leafCount = reader.getUint16();
			prop.solid = reader.getUint8();
			prop.flags = reader.getUint8();
			prop.skin = reader.getInt32();
			prop.fadeMinDist = reader.getFloat32();
			prop.fadeMaxDist = reader.getFloat32();
			reader.getVector3(undefined, undefined, prop.lightingOrigin as Float32Array);
			if (lumpVersion >= 5) {
				prop.forcedFadeScale = reader.getFloat32();
			}
			if (lumpVersion == 6 || lumpVersion == 7) {
				prop.minDXLevel = reader.getUint16();
				prop.maxDXLevel = reader.getUint16();
			}
			//TODO
			if (lumpVersion >= 7) {
				reader.skip(4);
			}
			if (lumpVersion >= 8) {
				reader.skip(4)
			}
			if (lumpVersion >= 10) {
				//reader.skip(4)
				// since v10
				//float					 unknown;
			}
			if (lumpVersion >= 9) {
				reader.skip(4)
			}
			staticDir.props.push(prop);
		}

		const q = quat.create();
		/*
		for (let propIndex = 0; propIndex < propCount * 0; ++propIndex) {//todov3removeme
			const prop = staticDir.props[propIndex];
			let name = staticDir.name[prop.propType];
			if (name) {
				name = name.replace(/\.mdl$/g, '');
				const model = this._createStaticProp(name);
				model.visible = true;
				if (model) {
					model.setSkin(prop.skin);
					model.position = prop.position;
					if (Math.abs(prop.position[0]) < 1) {
						if (LOG) { console.log(prop.position); }
						if (LOG) { console.log(name); }
					}
					AngleQuaternion(prop.angles, q);
					model.quaternion = q;
					prop.model = model;

					lump.map.addStaticProp(prop);
				}
			}
		}
			*/

		if (LOG) { console.log(staticDir); }
		lump.lumpData = staticDir;
	}

	#parseLumpPakFile(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_FILEHEADER = 46;
		const startOffset = lump.lumpOffset;

		let offset = reader.byteLength - 22;//sizeof ZIP_EndOfCentralDirRecord
		for (let sO = offset; (offset >= 0) && (offset <= sO); --offset) {
			reader.seek(offset);
			if (reader.getUint32() == 101010256) {//PK56
				break;
			}
		}
		if (offset <= 0) {
			lump.setLumpData(Object.create(null));
			return;
		}

		reader.seek(offset);
		reader.skip(4);//signature
		reader.skip(2);//numberOfThisDisk
		reader.skip(2);//numberOfTheDiskWithStartOfCentralDirectory
		reader.skip(2);//nCentralDirectoryEntries_ThisDisk
		const nCentralDirectoryEntries_Total = reader.getUint16();
		const centralDirectorySize = reader.getUint32();
		const startOfCentralDirOffset = reader.getUint32();

		const lumpData = new Map<string, LumpPakFile>();

		reader.seek(startOffset + startOfCentralDirOffset);
		for (let i = 0; i < nCentralDirectoryEntries_Total; ++i) {
			reader.skip(4);//signature
			reader.skip(2);//versionMadeBy
			reader.skip(2);//versionNeededToExtract
			reader.skip(2);//flags
			const compressionMethod = reader.getUint16();
			reader.skip(2);//lastModifiedTime
			reader.skip(2);//lastModifiedDate
			reader.skip(4);//crc32
			const compressedSize = reader.getUint32();
			const uncompressedSize = reader.getUint32();
			const fileNameLength = reader.getUint16();
			const extraFieldLength = reader.getUint16();
			const fileCommentLength = reader.getUint16();
			const diskNumberStart = reader.getUint16();
			const internalFileAttribs = reader.getUint16();
			const externalFileAttribs = reader.getUint32();
			const relativeOffsetOfLocalHeader = reader.getUint32();
			const fileName = reader.getString(fileNameLength);

			const filepos = startOffset + relativeOffsetOfLocalHeader + fileNameLength + extraFieldLength + 30; //sizeof ZIP_LocalFileHeader

			reader.skip(extraFieldLength + fileCommentLength);
			const file = { cs: compressedSize, fp: filepos, cm: compressionMethod, us: uncompressedSize };
			lumpData.set(fileName, file);
		}

		for (const [fileName, file] of lumpData) {
			if (fileName.match(/^materials\/.*\.vmt$/)) {
				const fileContent = this.#getFileData(reader, file);
				if (fileContent) {
					Source1VmtLoader.setMaterial(fileName, fileContent);
				}
			}
		}
		lump.setLumpData(lumpData);
	}

	#getFileData(reader: BinaryReader, file: LumpPakFile) {
		if (file) {
			if (file.cm == 14) {//LZMA
				const lzmaProperties = reader.getBytes(5, file.fp + 4);
				const compressedDatas = reader.getBytes(file.cs, file.fp + 9);
				const uncompressedDatas = DecompressLZMA(lzmaProperties, compressedDatas, file.us);
				if (uncompressedDatas) {
					const lzmaReader = new BinaryReader(uncompressedDatas);
					return lzmaReader.getString(file.us);
				}
			}
			return reader.getString(file.cs, file.fp);
		}
	}

	#parseLumpTexdataStringData(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const startOffset = lump.getLumpOffset();
		const endOffset = startOffset + lump.getLumpLen();
		const lumpData = [];

		while (reader.tell() < endOffset) {
			lumpData.push(reader.getNullString());
		}
		lump.setLumpData(lumpData);
	}

	#parseLumpTexdataStringTable(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const texdataCount = lump.getLumpLen() / 4; /* size of int */
		const lumpData = [];
		for (let texdataIndex = 0; texdataIndex < texdataCount; ++texdataIndex) {
			lumpData.push(reader.getInt32());
		}

		lump.setLumpData(lumpData);
	}

	#parseLumpOverlays(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_OVERLAY = 352;
		const overlayCount = lump.getLumpLen() / BYTES_PER_OVERLAY;
		const lumpData = [];

		for (let overlayIndex = 0; overlayIndex < overlayCount; ++overlayIndex) {
			const overlay = new SourceBSPLumpOverlay();
			overlay.id = reader.getInt32();
			overlay.texInfo = reader.getInt16();
			overlay.FaceCountAndRenderOrder = reader.getUint16();

			//overlay.faces = new Int32Array(OVERLAY_BSP_FACE_COUNT);
			for (let i = 0; i < OVERLAY_BSP_FACE_COUNT; ++i) {
				overlay.faces[i] = reader.getInt32();
			}

			overlay.u[0] = reader.getFloat32();
			overlay.u[1] = reader.getFloat32();
			overlay.v[0] = reader.getFloat32();
			overlay.v[1] = reader.getFloat32();

			vec3.set(overlay.uvPoint0, reader.getFloat32(), reader.getFloat32(), reader.getFloat32());
			vec3.set(overlay.uvPoint1, reader.getFloat32(), reader.getFloat32(), reader.getFloat32());
			vec3.set(overlay.uvPoint2, reader.getFloat32(), reader.getFloat32(), reader.getFloat32());
			vec3.set(overlay.uvPoint3, reader.getFloat32(), reader.getFloat32(), reader.getFloat32());

			vec3.set(overlay.origin, reader.getFloat32(), reader.getFloat32(), reader.getFloat32());

			vec3.set(overlay.basisNormal, reader.getFloat32(), reader.getFloat32(), reader.getFloat32());
			vec3.normalize(overlay.basisNormal, overlay.basisNormal);
			lumpData.push(overlay);
		}

		lump.setLumpData(lumpData);
	}

	#parseLumpDispInfo(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_DISPINFO = 176;
		const dispInfoCount = lump.getLumpLen() / BYTES_PER_DISPINFO;

		const lumpData = [];

		for (let dispinfoIndex = 0; dispinfoIndex < dispInfoCount; ++dispinfoIndex) {
			const dispinfo = new SourceBSPLumpDispInfo();
			reader.getVector3(undefined, undefined, dispinfo.startPosition as Float32Array);
			dispinfo.dispVertStart = reader.getInt32();
			dispinfo.dispTriStart = reader.getInt32();
			dispinfo.power = reader.getInt32();
			dispinfo.minTess = reader.getInt32();
			dispinfo.smoothingAngle = reader.getFloat32();
			dispinfo.contents = reader.getInt32();
			dispinfo.mapFace = reader.getUint16();
			dispinfo.lightmapAlphaStart = reader.getInt32();
			dispinfo.lightmapSamplePositionStart = reader.getInt32();
			reader.getUint16();// Spare bytes
			this.#parseEdgeNeighbors(reader);
			reader.skip(40);//skip CornerNeighbors
			//dispinfo.allowedVerts = [];

			for (let i = 0; i < 10; ++i) {//TODO : variable
				dispinfo.allowedVerts.push(reader.getInt32());
			}
			lumpData.push(dispinfo);
		}
		lump.setLumpData(lumpData);
	}

	#parseEdgeNeighbors(reader: BinaryReader) {//TODOv3
		const neighbors = [];

		for (let edgeIndex = 0; edgeIndex < 4; ++edgeIndex) {
			const neighbor = new SourceBSPLumpDispNeighbor();
			neighbors.push(neighbor);
			for (let neighborIndex = 0; neighborIndex < 2; ++neighborIndex) {
				const subneighbor = new SourceBSPLumpDispSubNeighbor();
				neighbor.subNeighbors.push(subneighbor);

				subneighbor.iNeighbor = reader.getUint16();
				subneighbor.orientation = reader.getUint8();
				subneighbor.span = reader.getUint8();
				subneighbor.neighSpan = reader.getUint8();
				reader.skip(1); // read spare byte;
			}
		}
	}

	#parseLumpDispVerts(reader: BinaryReader, lump: SourceBSPLump) {
		reader.seek(lump.lumpOffset);
		const BYTES_PER_DISPVERT = 20;
		const dispVertCount = lump.getLumpLen() / BYTES_PER_DISPVERT;

		const lumpData = [];

		for (let dispvertIndex = 0; dispvertIndex < dispVertCount; ++dispvertIndex) {
			const dispvert = new SourceBSPLumpDispVertex();
			reader.getVector3(undefined, undefined, dispvert.vec as Float32Array);
			dispvert.dist = reader.getFloat32();
			dispvert.alpha = reader.getFloat32();
			lumpData.push(dispvert);
		}

		lump.setLumpData(lumpData);
	}
}
