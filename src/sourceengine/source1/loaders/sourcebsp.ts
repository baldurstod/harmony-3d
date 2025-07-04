import { quat, vec3, vec4 } from 'gl-matrix';
import { ERROR, LOG } from '../../../buildoptions';
import { Float32BufferAttribute, Uint16BufferAttribute } from '../../../geometry/bufferattribute';
import { BufferGeometry } from '../../../geometry/buffergeometry';
import { Vec3Middle } from '../../../math/functions';
import { Group } from '../../../objects/group';
import { Mesh } from '../../../objects/mesh';
import { World } from '../../../objects/world';
import { MapEntities } from '../maps/mapentities';
import { AngleQuaternion } from '../maps/mapentity';
import { SourceEngineMaterialManager } from '../materials/sourceenginematerialmanager';
import { Source1ModelManager } from '../models/source1modelmanager';
import { LUMP_DISP_VERTS, LUMP_DISPINFO, LUMP_EDGES, LUMP_ENTITIES, LUMP_FACES, LUMP_GAME_LUMP, LUMP_LEAFFACES, LUMP_LEAFS, LUMP_LIGHTING, LUMP_MODELS, LUMP_SURFEDGES, LUMP_TEXDATA, LUMP_TEXDATA_STRING_DATA, LUMP_TEXINFO, LUMP_VERTEXES } from './sourcebsplump';
import { SourceEngineBspTree } from './sourceenginebsptree';
import { SELightMapNode } from './sourcelightmap';

const DISPLACEMENT_DELTA = 1.0; // max distance from start position

const LIGTH_MAP_TEXTURE_SIZE = 1024;

export class SourceBSP extends World {
	repository: string;
	bspFileVersion = null;
	lumps = [];
	mapRevision = null;
	loaded = false;
	bufferInitialized = false;
	staticGeometry = {};
	skyBoxStaticGeometry = {};
	skyboxGeometry = {};
	overlayVerticesByTexture = {};
	mainLightMap = new SELightMapNode(0, 0, LIGTH_MAP_TEXTURE_SIZE, LIGTH_MAP_TEXTURE_SIZE);
	lightMapTexture = null;
	skyCamera = null;
	skyName = null;
	entities = [];
	connections = [];
	mapSpawn = true;
	lastLeaf = undefined;
	bspTree: SourceEngineBspTree;
	frameCount = 0;
	mustParseHeader = true;
	funcBrushesRemoveMe = [];
	partialLoading = false;
	eventTarget = new EventTarget();//TODOv3
	staticProps = new Group({ name: 'Static props' });
	dynamicProps = new Group({ name: 'Dynamic props' });
	mapFaces = new Group({ name: 'World geometry' });
	characterSpawn;
	#geometries;
	loader;
	constructor(params?: any) {
		super(params);
		this.repository = params.repository;
		//this.staticProps = [];
		this.bspTree = new SourceEngineBspTree(this);

		//this.loadFile(root, fileName);
		//BspMap.defaultMaterial = BspMap.defaultMaterial ||	SourceEngine.Materials.MaterialManager._loadMaterial('', SourceEngine.Settings.Materials.defaultLightMappedMaterial).then(function(material){BspMap.defaultMaterial = material;});TODOv3


		this.addChild(this.staticProps);
		this.addChild(this.dynamicProps);
		this.addChild(this.mapFaces);
	}

	initMap() {
		this.initGeometry();
		this._createEntities();
		this._createStaticProps();
	}

	_createEntities() {
		const lumpEntities = this.getLumpData(LUMP_ENTITIES);
		if (lumpEntities) {
			this.createDynamicEntities(lumpEntities.kv);
			/*new Promise((resolve) => {
				this.createDynamicEntities(entities.kv);
				this.eventTarget.dispatchEvent(new CustomEvent('entitiescreated'));//TODOv3
				resolve();
			});*/
		}
	}

	_createStaticProps() {
		const lumpGameDatas = this.getLumpData(LUMP_GAME_LUMP);
		if (lumpGameDatas && lumpGameDatas.prps && lumpGameDatas.prps.lumpData) {
			const propsStatic = lumpGameDatas.prps.lumpData;
			const propNames = propsStatic.name;
			const props = propsStatic.props;
			const tempQuaternion = quat.create();

			for (const prop of props) {
				Source1ModelManager.createInstance(this.repository, propNames[prop.propType], true).then(
					(model) => {
						this.staticProps.addChild(model);
						model.position = prop.position;
						model.quaternion = AngleQuaternion(prop.angles, tempQuaternion);
						model.skin = prop.skin;
					}
				);
			}
		}
	}

	createDynamicEntities(kv) {
		const list = Object.keys(kv.rootElements);

		for (let i = 0; i < list.length; ++i) {
			const entity = kv.rootElements[list[i]];

			if (entity.classname) {
				const e = MapEntities.createEntity(this, entity.classname);
				if (e) {
					e.setKeyValues(entity);
					this.addEntity(e);
				} else {
					console.error('Unknown classname : %s', entity.classname);
				}

				if (entity.classname == 'sky_camera') {
					this.skyCamera = e;
					//this.renderBuffer = false;
				}

				if (entity.classname == 'worldspawn' && entity.skyname) {
					//console.log(entity.skyname);
					this.skyName = entity.skyname;
				}
				if (entity.classname == 'info_player_teamspawn') {
					if (!this.characterSpawn) {
						this.characterSpawn = vec3.scale(vec3.create(), entity.origin.split(' '), 1);
					}
				}
			}
		}
	}



	addLump(lump) {
		this.lumps.push(lump)
	}

	getLumpData(lumpType) {
		const lump = this.lumps[lumpType];
		if (lump) {
			return lump.getLumpData();
		}
		return null;
	}

	initFaceGeometry(face, position?) {
		if (face.initialized) {//TODOv3
			return;
		}
		face.initialized = true;
		const lumpFaces = this.getLumpData(LUMP_FACES);
		const lumpTexInfo = this.getLumpData(LUMP_TEXINFO);
		const lumpTexData = this.getLumpData(LUMP_TEXDATA);
		const lumpTexDataStringData = this.getLumpData(LUMP_TEXDATA_STRING_DATA);
		const lumpSurfEdges = this.getLumpData(LUMP_SURFEDGES);
		const lumpEdges = this.getLumpData(LUMP_EDGES);
		const lumpVertices = this.getLumpData(LUMP_VERTEXES);


		const texInfo = lumpTexInfo[face.texinfo];
		const texData = lumpTexData[texInfo.texdata];

		const texName = lumpTexDataStringData[texData.nameStringTableID];
		//console.log(face);
		let buffer = this.#geometries[texName];
		if (!buffer) {
			buffer = {
				lastIndice: 0,
				vertices: [], indices: [], coords: [], alphas: [],
				triangleArray: [], alphaArray: [], textureCoord: [], lightMaps: [], textureVecs: lumpTexInfo.textureVecs, height: lumpTexData.height, width: lumpTexData.width
			};//TODOv3
			this.#geometries[texName] = buffer;
		}

		const textureVecsU = texInfo.textureVecs[0];
		const textureVecsV = texInfo.textureVecs[1];
		const firstEdge = face.firstedge;
		const lastEdge = firstEdge + face.numedges;
		const firstIndice = buffer.lastIndice;
		for (let surfEdgeIndex = firstEdge; surfEdgeIndex < lastEdge; ++surfEdgeIndex) {
			const surfedge = lumpSurfEdges[surfEdgeIndex];
			const edge = lumpEdges[Math.abs(surfedge)];//TODOv3 ? why abs
			let vertice1, vertice2;
			if (surfedge <= 0) {
				vertice1 = lumpVertices[edge.f];
				vertice2 = lumpVertices[edge.s];
			} else {
				vertice2 = lumpVertices[edge.f];
				vertice1 = lumpVertices[edge.s];
			}
			if (vertice1 && vertice2) {
				if (position) {
					buffer.vertices.push(vertice1[0] + position[0]);//TODOv3: optimize
					buffer.vertices.push(vertice1[1] + position[1]);
					buffer.vertices.push(vertice1[2] + position[2]);
					buffer.vertices.push(vertice2[0] + position[0]);
					buffer.vertices.push(vertice2[1] + position[1]);
					buffer.vertices.push(vertice2[2] + position[2]);
				} else {
					buffer.vertices.push(vertice1[0]);//TODOv3: optimize
					buffer.vertices.push(vertice1[1]);
					buffer.vertices.push(vertice1[2]);
					buffer.vertices.push(vertice2[0]);
					buffer.vertices.push(vertice2[1]);
					buffer.vertices.push(vertice2[2]);
				}

				buffer.coords.push((vertice1[0] * textureVecsU[0] + vertice1[1] * textureVecsU[1] + vertice1[2] * textureVecsU[2] + textureVecsU[3]) / texData.width);
				buffer.coords.push((vertice1[0] * textureVecsV[0] + vertice1[1] * textureVecsV[1] + vertice1[2] * textureVecsV[2] + textureVecsV[3]) / texData.height);
				buffer.coords.push((vertice2[0] * textureVecsU[0] + vertice2[1] * textureVecsU[1] + vertice2[2] * textureVecsU[2] + textureVecsU[3]) / texData.width);
				buffer.coords.push((vertice2[0] * textureVecsV[0] + vertice2[1] * textureVecsV[1] + vertice2[2] * textureVecsV[2] + textureVecsV[3]) / texData.height);

				buffer.indices.push(firstIndice);//TODOv3: optimize
				buffer.indices.push(buffer.lastIndice++);//TODOv3: optimize
				buffer.indices.push(buffer.lastIndice++);//TODOv3: optimize
			} else {
				if (ERROR) {
					console.error('Vertice1 or vertice2 is null', vertice1, vertice2);
				}
			}
		}
	}

	initDispGeometry(dispInfo, face) {
		if (face.initialized) {//TODOv3
			return;
		}
		face.initialized = true;
		const lumpFaces = this.getLumpData(LUMP_FACES);
		const lumpTexInfo = this.getLumpData(LUMP_TEXINFO);
		const lumpTexData = this.getLumpData(LUMP_TEXDATA);
		const lumpTexDataStringData = this.getLumpData(LUMP_TEXDATA_STRING_DATA);
		const lumpSurfEdges = this.getLumpData(LUMP_SURFEDGES);
		const lumpEdges = this.getLumpData(LUMP_EDGES);
		const lumpVertices = this.getLumpData(LUMP_VERTEXES);


		const texInfo = lumpTexInfo[face.texinfo];
		const texData = lumpTexData[texInfo.texdata];

		const texName = lumpTexDataStringData[texData.nameStringTableID];
		//console.log(face);
		let buffer = this.#geometries[texName];
		if (!buffer) {
			buffer = {
				lastIndice: 0,
				vertices: [], indices: [], coords: [], alphas: [],
				triangleArray: [], alphaArray: [], textureCoord: [], lightMaps: [], textureVecs: lumpTexInfo.textureVecs, height: lumpTexData.height, width: lumpTexData.width
			};//TODOv3
			this.#geometries[texName] = buffer;
		}

		const textureVecsU = texInfo.textureVecs[0];
		const textureVecsV = texInfo.textureVecs[1];
		const firstEdge = face.firstedge;
		const lastEdge = firstEdge + face.numedges;

		const origVertices = [];
		for (let surfEdgeIndex = firstEdge; surfEdgeIndex < lastEdge; ++surfEdgeIndex) {
			const surfedge = lumpSurfEdges[surfEdgeIndex];
			const edge = lumpEdges[Math.abs(surfedge)];//TODOv3 ? why abs
			let vertice1, vertice2;
			if (surfedge <= 0) {
				vertice1 = lumpVertices[edge.f];
				vertice2 = lumpVertices[edge.s];
			} else {
				vertice2 = lumpVertices[edge.f];
				vertice1 = lumpVertices[edge.s];
			}
			if (vertice1) {
				origVertices.push(vertice1);
			} else {
				if (ERROR) {
					console.error('Vertice1 is null', vertice1);
				}
			}
		}

		const origVertices2 = [[origVertices[0], origVertices[1]], [origVertices[2], origVertices[3]]];//TODOv3removeme
		let foundRemoveme = false;
		for (let testremoveme = 0; testremoveme < 4; testremoveme++) {
			const vvremoveme = origVertices[0];
			if (Math.abs(vvremoveme[0] - dispInfo.startPosition[0]) < DISPLACEMENT_DELTA
				&& Math.abs(vvremoveme[1] - dispInfo.startPosition[1]) < DISPLACEMENT_DELTA
				&& Math.abs(vvremoveme[2] - dispInfo.startPosition[2]) < DISPLACEMENT_DELTA
			) {
				foundRemoveme = true;
				break;
			}
			origVertices.push(origVertices.shift());
		}

		const verticesPerSide = Math.pow(2, dispInfo.power) + 1;
		const tesselateVertices = [];
		/* create tesslate array */
		for (let i = 0; i < verticesPerSide; ++i) {
			const row = [];
			tesselateVertices.push(row);
			for (let j = 0; j < verticesPerSide; ++j) {
				row[j] = null;
			}
		}
		tesselateVertices[0][0] = vec4.clone(origVertices[0]);
		tesselateVertices[0][verticesPerSide - 1] = vec4.clone(origVertices[3]);
		tesselateVertices[verticesPerSide - 1][verticesPerSide - 1] = vec4.clone(origVertices[2]);
		tesselateVertices[verticesPerSide - 1][0] = vec4.clone(origVertices[1]);

		let subdiv = Math.pow(2, dispInfo.power);
		for (let level = 0; level < dispInfo.power; ++level) {
			const squares = Math.pow(2, level);
			const levelVerts2 = Math.pow(2, level) + 1;
			const subdiv2 = subdiv / 2;
			for (let i = 0; i < squares; ++i) {
				for (let j = 0; j < squares; ++j) {
					const iMin = subdiv * i;
					const iMax = iMin + subdiv;
					const jMin = subdiv * j;
					const jMax = jMin + subdiv;
					const v1 = tesselateVertices[iMin][jMin];
					const v2 = tesselateVertices[iMax][jMin];
					const v3 = tesselateVertices[iMin][jMax];
					const v4 = tesselateVertices[iMax][jMax];

					const iMid = iMin + subdiv2;
					const jMid = jMin + subdiv2;

					if (v1 && v2 && v3 && v4) {
						const s1 = Vec3Middle((vec4.create() as vec3), v1, v2);
						const s2 = Vec3Middle((vec4.create() as vec3), v3, v4);
						const s3 = Vec3Middle((vec4.create() as vec3), v1, v3);
						const s4 = Vec3Middle((vec4.create() as vec3), v2, v4);
						const s5 = Vec3Middle((vec4.create() as vec3), s3, s4);

						tesselateVertices[iMid][jMin] = s1;
						tesselateVertices[iMid][jMax] = s2;
						tesselateVertices[iMin][jMid] = s3;
						tesselateVertices[iMax][jMid] = s4;
						tesselateVertices[iMid][jMid] = s5;
					} else {
						if (LOG) { console.log(v1, v2, v3, v4); }
					}
				}
			}
			subdiv = subdiv2;
		}

		/* displace vertices */
		const lumpDispVerts = this.lumps[LUMP_DISP_VERTS].getLumpData();
		let vertexIndex = dispInfo.dispVertStart;
		for (let i = 0; i < verticesPerSide; ++i) {
			for (let j = 0; j < verticesPerSide; ++j) {
				const dispVert = lumpDispVerts[vertexIndex];
				if (dispVert) {
					const v = tesselateVertices[i][j];
					if (dispVert.dist > 0) {
						vec3.scaleAndAdd(v, v, dispVert.vec, dispVert.dist);
					}
					v[3] = dispVert.alpha;
				}
				++vertexIndex;
			}
		}

		const verticesCount = 0;
		subdiv = Math.pow(2, dispInfo.power);
		for (let i = 0; i < subdiv; ++i) {
			for (let j = 0; j < subdiv; ++j) {
				const firstIndice = buffer.lastIndice;
				const v1 = tesselateVertices[i][j];
				const v2 = tesselateVertices[i + 1][j];
				const v3 = tesselateVertices[i + 1][j + 1];
				const v4 = tesselateVertices[i][j + 1];

				if (v1 && v2 && v3 && v4) {
					buffer.vertices.push(v1[0], v1[1], v1[2]);//TODOv3: optimize
					buffer.vertices.push(v2[0], v2[1], v2[2]);//TODOv3: optimize
					buffer.vertices.push(v3[0], v3[1], v3[2]);//TODOv3: optimize
					buffer.vertices.push(v4[0], v4[1], v4[2]);//TODOv3: optimize

					buffer.alphas.push(v1[3] / 255.0, v2[3] / 255.0, v3[3] / 255.0, v4[3] / 255.0);

					buffer.coords.push((v1[0] * textureVecsU[0] + v1[1] * textureVecsU[1] + v1[2] * textureVecsU[2] + textureVecsU[3]) / texData.width);
					buffer.coords.push((v1[0] * textureVecsV[0] + v1[1] * textureVecsV[1] + v1[2] * textureVecsV[2] + textureVecsV[3]) / texData.height);
					buffer.coords.push((v2[0] * textureVecsU[0] + v2[1] * textureVecsU[1] + v2[2] * textureVecsU[2] + textureVecsU[3]) / texData.width);
					buffer.coords.push((v2[0] * textureVecsV[0] + v2[1] * textureVecsV[1] + v2[2] * textureVecsV[2] + textureVecsV[3]) / texData.height);
					buffer.coords.push((v3[0] * textureVecsU[0] + v3[1] * textureVecsU[1] + v3[2] * textureVecsU[2] + textureVecsU[3]) / texData.width);
					buffer.coords.push((v3[0] * textureVecsV[0] + v3[1] * textureVecsV[1] + v3[2] * textureVecsV[2] + textureVecsV[3]) / texData.height);
					buffer.coords.push((v4[0] * textureVecsU[0] + v4[1] * textureVecsU[1] + v4[2] * textureVecsU[2] + textureVecsU[3]) / texData.width);
					buffer.coords.push((v4[0] * textureVecsV[0] + v4[1] * textureVecsV[1] + v4[2] * textureVecsV[2] + textureVecsV[3]) / texData.height);

					if (true || (i + j) % 2 == 0) {//TODOv3
						buffer.indices.push(firstIndice);//TODOv3: optimize
						buffer.indices.push(firstIndice + 2);
						buffer.indices.push(firstIndice + 1);
						buffer.indices.push(firstIndice + 3);
						buffer.indices.push(firstIndice + 2);
						buffer.indices.push(firstIndice);
					} else {
						buffer.indices.push(firstIndice);//TODOv3: optimize
						buffer.indices.push(firstIndice + 1);
						buffer.indices.push(firstIndice + 2);
						buffer.indices.push(firstIndice + 2);
						buffer.indices.push(firstIndice + 3);
						buffer.indices.push(firstIndice);
					}
					buffer.lastIndice += 4;
				}
			}
		}
	}

	initGeometry() {
		this.#geometries = {};
		const lumpFaces = this.getLumpData(LUMP_FACES);
		const lumpLeafs = this.getLumpData(LUMP_LEAFS);
		const lumpLeafFaces = this.getLumpData(LUMP_LEAFFACES);
		//const lumpNodes = this.getLumpData(LUMP_NODES);
		const lumpTexLighting = this.getLumpData(LUMP_LIGHTING);
		const lumpTexInfo = this.getLumpData(LUMP_TEXINFO);
		const lumpTexData = this.getLumpData(LUMP_TEXDATA);
		const lumpTexDataStringData = this.getLumpData(LUMP_TEXDATA_STRING_DATA);
		const lumpSurfEdges = this.getLumpData(LUMP_SURFEDGES);
		const lumpEdges = this.getLumpData(LUMP_EDGES);
		const lumpVertices = this.getLumpData(LUMP_VERTEXES);
		const lumpModels = this.getLumpData(LUMP_MODELS);
		const lumpDispInfos = this.getLumpData(LUMP_DISPINFO);



		if (lumpFaces && lumpLeafs && lumpLeafFaces && /*lumpNodes && */lumpTexLighting && lumpTexInfo && lumpTexData && lumpTexDataStringData && lumpSurfEdges && lumpEdges && lumpVertices) {
			if (lumpModels) {
				for (let i = 0; i < this.funcBrushesRemoveMe.length; ++i) {
					const funcBrushesRemove = this.funcBrushesRemoveMe[i];
					const modelIndex = funcBrushesRemove.model;

					const model = lumpModels[modelIndex];
					if (model) {
						const firstFace = model.firstface;
						const lastFace = firstFace + model.numfaces;
						for (let j = firstFace; j < lastFace; ++j) {
							const face = lumpFaces[j];
							//this.renderLeafFace(renderContext, face, funcBrushesRemove.position, 0/*leafId TODO*/);
							this.initFaceGeometry(face, funcBrushesRemove.origin);
						}
					}
				}
			}

			/* Init displacement buffer */
			if (lumpDispInfos) {
				for (let i = 0; i < lumpDispInfos.length; ++i) {//TODO
					const dispInfo = lumpDispInfos[i];
					const face = lumpFaces[dispInfo.mapFace];
					if (face) {
						this.initDispGeometry(dispInfo, face);
					}
				}
			}


			for (let leafIndex = 0, l = lumpLeafs.length; leafIndex < l; ++leafIndex) {
				const leaf = lumpLeafs[leafIndex];

				const firstFace = leaf.firstleafface;
				const lastFace = leaf.firstleafface + leaf.numleaffaces;

				for (let faceIndex = firstFace; faceIndex < lastFace; ++faceIndex) {
					const face = lumpFaces[lumpLeafFaces[faceIndex]];
					this.initFaceGeometry(face);
				}
			}
		}

		for (const textureName in this.#geometries) {
			const geometry = this.#geometries[textureName];

			if (textureName.toLowerCase().substring(0, 5) == 'tools') {//TODOV3
				continue;
				if (
				//((lumpTexInfo.flags & 4) == 4) // SURF_SKY
				/*|| */((lumpTexInfo.flags & 40) == 40) // SURF_TRIGGER
					|| ((lumpTexInfo.flags & 200) == 200) // SURF_SKIP
					//((lumpTexInfo.flags & 400) == 400) // SURF_NOLIGHT
					//|| true
				) {
					continue;
				}
				//continue;
			}

			const bufferGeometry = new BufferGeometry();

			const vertexPosition = new Float32BufferAttribute(geometry.vertices, 3);
			const vertexAlpha = new Float32BufferAttribute(geometry.alphas, 1);
			const textureCoord = new Float32BufferAttribute(geometry.coords, 2);

			bufferGeometry.setIndex(new Uint16BufferAttribute(geometry.indices, 1));
			bufferGeometry.setAttribute('aVertexPosition', vertexPosition);
			bufferGeometry.setAttribute('aVertexAlpha', vertexAlpha);
			bufferGeometry.setAttribute('aTextureCoord', textureCoord);

			bufferGeometry.count = geometry.indices.length;

			const staticMesh = new Mesh(bufferGeometry, null);
			staticMesh.name = textureName;
			SourceEngineMaterialManager.getMaterial(this.repository, textureName).then(
				(material) => staticMesh.setMaterial(material)
			).catch(
				() => console.error('unable to find material ' + textureName)
			);

			this.mapFaces.addChild(staticMesh);
		}
	}

	addEntity(entity) {
		if (entity) {
			this.entities.push(entity);
		}
	}

	addConnection(connection) {
		if (connection) {
			this.connections.push(connection);
		}
	}

	getOBBSize(modelIndex) {
		const lumpModels = this.getLumpData(LUMP_MODELS);
		const lumpFaces = this.getLumpData(LUMP_FACES);
		const lumpSurfEdges = this.getLumpData(LUMP_SURFEDGES);
		const lumpEdges = this.getLumpData(LUMP_EDGES);
		const lumpVertices = this.getLumpData(LUMP_VERTEXES);

		if (lumpModels && lumpFaces && lumpSurfEdges && lumpEdges && lumpVertices) {
			const model = lumpModels[modelIndex];
			if (model) {
				if (model.numfaces == 0) {
					return vec3.create();
				}
				function compare(v) {
					for (let i = 0; i < 3; i++) {
						if (v[i] < min[i]) {
							min[i] = v[i];
						}
						if (v[i] > max[i]) {
							max[i] = v[i];
						}
					}
				}
				const min = vec3.fromValues(Infinity, Infinity, Infinity);
				const max = vec3.fromValues(-Infinity, -Infinity, -Infinity);

				const firstFace = model.firstface;
				const lastFace = firstFace + model.numfaces;

				for (let j = firstFace; j < lastFace; j++) {
					const face = lumpFaces[j];
					if (face) {
						const firstEdge = face.firstedge;
						const lastEdge = firstEdge + face.numedges;

						for (let surfEdgeIndex = firstEdge; surfEdgeIndex < lastEdge; surfEdgeIndex++) {
							const surfedge = lumpSurfEdges[surfEdgeIndex];
							const edge = lumpEdges[Math.abs(surfedge)];
							const vertice1 = lumpVertices[edge.f];
							const vertice2 = lumpVertices[edge.s];

							compare(vertice1);
							compare(vertice2);
						}
					}
				}
				return vec3.sub(vec3.create(), max, min);
			}
		}
		return null;
	}

	static getEntityName() {
		return 'BSP Map';
	}
}
