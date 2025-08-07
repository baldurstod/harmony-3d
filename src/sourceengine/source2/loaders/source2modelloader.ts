import { vec2, vec3, vec4 } from 'gl-matrix';
import { BinaryReader } from 'harmony-binary-reader';
import { MeshoptDecoder } from 'meshoptimizer';
import { VERBOSE } from '../../../buildoptions';
import { Entity } from '../../../entities/entity';
import { Float32BufferAttribute, Uint32BufferAttribute } from '../../../geometry/bufferattribute';
import { BufferGeometry } from '../../../geometry/buffergeometry';
import { MeshBasicMaterial } from '../../../materials/meshbasicmaterial';
import { Mesh } from '../../../objects/mesh';
import { Property, PropertyType } from '../../../utils/properties';
import { FileNameFromPath } from '../../../utils/utils';
import { Kv3Element } from '../../common/keyvalue/kv3element';
import { Source2MaterialManager } from '../materials/source2materialmanager';
import { MeshManager } from '../models/meshmanager';
import { Source2Model } from '../models/source2model';
import { DXGI_FORMAT_R16G16_FLOAT, DXGI_FORMAT_R16G16_SINT, DXGI_FORMAT_R16G16_SNORM, DXGI_FORMAT_R16G16B16A16_SINT, DXGI_FORMAT_R32_FLOAT, DXGI_FORMAT_R32_UINT, DXGI_FORMAT_R32G32_FLOAT, DXGI_FORMAT_R32G32B32_FLOAT, DXGI_FORMAT_R32G32B32A32_FLOAT, DXGI_FORMAT_R8G8B8A8_UINT, DXGI_FORMAT_R8G8B8A8_UNORM } from './dxgiformat';
import { BYTES_PER_VERTEX_BONE_INDICE, BYTES_PER_VERTEX_BONE_WEIGHT, BYTES_PER_VERTEX_COORD, BYTES_PER_VERTEX_NORMAL, BYTES_PER_VERTEX_POSITION, BYTES_PER_VERTEX_TANGENT, defaultValuesBoneIndice, defaultValuesBoneWeight, defaultValuesCoord, defaultValuesNormal, defaultValuesPosition, defaultValuesTangent, sNormUint16, VERTEX_BONE_INDICE_LEN, VERTEX_BONE_WEIGHT_LEN, VERTEX_COORD_LEN, VERTEX_NORMAL_LEN, VERTEX_POSITION_LEN, VERTEX_TANGENT_LEN } from './source2blockloader';
import { Source2File } from './source2file';
import { Source2FileBlock } from './source2fileblock';
import { Source2FileLoader } from './source2fileloader';

const defaultMaterial = new MeshBasicMaterial();

export class Source2ModelLoader {
	static #loadPromisesPerRepo: Record<string, any> = {};//TODO: create map

	static {
		defaultMaterial.addUser(Source2ModelLoader);
	}

	async load(repository: string, path: string): Promise<Source2Model | null> {
		// Cleanup filename
		path = path.replace(/.vmdl_c$/, '').replace(/.vmdl$/, '');

		let repoPromises = Source2ModelLoader.#loadPromisesPerRepo[repository];
		if (!repoPromises) {
			repoPromises = {};
			Source2ModelLoader.#loadPromisesPerRepo[repository] = repoPromises;
		}

		let promise = repoPromises[path];
		if (promise) {
			return promise;
		}

		promise = new Promise((resolve) => {
			const vmdlPromise = new Source2FileLoader().load(repository, path + '.vmdl_c') as Promise<Source2File | null>;
			vmdlPromise.then(
				async (source2File: Source2File | null) => {
					if (VERBOSE) {
						console.log(source2File);
					}
					if (!source2File) {
						return;
					}
					const newSourceModel = new Source2Model(repository, source2File);
					this.#loadIncludeModels(newSourceModel);
					const mesh = await this.testProcess2(source2File, newSourceModel, repository);
					newSourceModel.loadAnimGroups();
					resolve(newSourceModel);
				}
			)
			return;
		});
		repoPromises[path] = promise;
		return promise;
	}

	async testProcess2/*TODO: rename*/(vmdl: Source2File, model: Source2Model, repository: string): Promise<Entity> {
		const group = new Entity();
		const ctrlRoot = vmdl.getBlockKeyValues('CTRL');
		const m_refLODGroupMasks = vmdl.getBlockStructAsBigintArray('DATA', 'm_refLODGroupMasks') ?? vmdl.getBlockStructAsNumberArray('DATA', 'm_refLODGroupMasks');// ?? vmdl.getBlockStruct('DATA.keyValue.root.m_refLODGroupMasks');
		const m_refMeshGroupMasks = vmdl.getBlockStructAsNumberArray('DATA', 'm_refMeshGroupMasks');// ?? vmdl.getBlockStruct('DATA.keyValue.root.m_refMeshGroupMasks');
		const embeddedMeshes = ctrlRoot?.getValueAsElementArray('embedded_meshes');
		if (ctrlRoot && m_refLODGroupMasks && embeddedMeshes) {
			for (const [meshIndex, embeddedMesh] of embeddedMeshes.entries()) {
				const vbibBlockId = embeddedMesh.getValueAsNumber('vbib_block');
				if (vbibBlockId != null) {//TODO: use  m_nVBIBBlock ?
					this.#loadEmbeddedMeshesFromVbib(vmdl, model, repository, group, meshIndex, m_refLODGroupMasks, m_refMeshGroupMasks, embeddedMesh);
				} else {
					this.#loadEmbeddedMeshesFromVtxIdx(vmdl, model, repository, group, meshIndex, m_refLODGroupMasks, m_refMeshGroupMasks, embeddedMesh);
				}
			}
		}
		await this.#loadExternalMeshes(group, vmdl, model, repository);
		return group;
	}

	#loadEmbeddedMeshesFromVbib(vmdl: Source2File, model: Source2Model, repository: string, group: Entity, meshIndex: number, m_refLODGroupMasks: bigint[] | number[], m_refMeshGroupMasks: number[] | null, embeddedMesh: Kv3Element): void {
		const lodGroupMask = Number(m_refLODGroupMasks[meshIndex]);
		const meshGroupMask = m_refMeshGroupMasks?.[meshIndex];
		//const embeddedMesh = embeddedMeshes[meshIndex]!;

		const dataBlockId = embeddedMesh.getValueAsNumber('data_block');
		const vbibBlockId = embeddedMesh.getValueAsNumber('vbib_block') ?? embeddedMesh.getValueAsNumber('m_nVBIBBlock');

		if (dataBlockId === null || vbibBlockId === null) {
			console.error('missing dataBlockId / vbibBlockId', embeddedMesh);
			return;
		}

		const dataBlock = vmdl.getBlockById(dataBlockId);
		const vbibBlock = vmdl.getBlockById(vbibBlockId);

		if (dataBlock === null || vbibBlock === null) {
			console.error('missing dataBlock / vbibBlock', embeddedMesh, dataBlockId, vbibBlockId, vmdl);
			return;
		}

		this.#loadMesh(repository, model, group, dataBlock, vbibBlock, lodGroupMask, vmdl, meshIndex, meshGroupMask);

		/*data_block: 1
		mesh_index: 0
		morph_block: 0
		morph_texture: "models/heroes/antimage_female/antimage_female/antimage_female_base_vmorf.vtex"
		name: "antimage_female_base"
		vbib_block: 2*/
	}

	#loadEmbeddedMeshesFromVtxIdx(vmdl: Source2File, model: Source2Model, repository: string, group: Entity, meshIndex: number, m_refLODGroupMasks: bigint[] | number[], m_refMeshGroupMasks: number[] | null, embeddedMesh: Kv3Element): void {
		const dataBlockId = embeddedMesh.getValueAsNumber('m_nDataBlock') ?? -1;
		if (dataBlockId < 0) {
			return;
		}
		const dataBlock = vmdl.getBlockById(dataBlockId);
		if (!dataBlock) {
			return;
		}
		//const vbibBlockId = embeddedMesh.getValueAsNumber('m_nVBIBBlock');

		const lodGroupMask = Number(m_refLODGroupMasks[meshIndex]);
		const meshGroupMask = m_refMeshGroupMasks?.[meshIndex];

		//vmdl.vertices = [];
		//vmdl.indices = [];

		// Load vertex buffers
		this.#loadBuffer('m_vertexBuffers', vmdl, embeddedMesh, true);
		this.#loadBuffer('m_indexBuffers', vmdl, embeddedMesh, false);
		this.#loadMesh(repository, model, group, dataBlock, new Source2FileBlock(vmdl, 'VBIB', new BinaryReader(''), 0, 0)/*TODO: remove*/, lodGroupMask, vmdl, meshIndex, meshGroupMask);

		//console.error(vertexBuffers);
	}

	#loadBuffer(bufferName: string, vmdl: Source2File, embeddedMesh: Kv3Element, isVertex: boolean): void {
		const buffers = embeddedMesh.getValueAsElementArray(bufferName);
		if (!buffers) {
			return;
		}

		for (const buffer of buffers) {
			const blockIndex = buffer.getValueAsNumber('m_nBlockIndex') ?? -1;
			if (blockIndex < 0) {
				continue;
			}

			const sourceBlock = vmdl.blocksArray[blockIndex];
			if (!sourceBlock) {
				continue;
			}

			const elementCount = buffer.getValueAsNumber('m_nElementCount') ?? 0;
			const elementSizeInBytes = buffer.getValueAsNumber('m_nElementSizeInBytes') ?? 0;
			const inputLayoutFields = buffer.getValueAsElementArray('m_inputLayoutFields') ?? [];
			const meshoptCompressed = buffer.getValueAsBool('m_bMeshoptCompressed');
			// TODO: also use m_bCompressedZSTD

			const fieldsCount = inputLayoutFields.length;
			const fields: VertexField[] = [];

			for (const inputLayoutField of inputLayoutFields) {
				//const semanticIndex = inputLayoutField.getValueAsNumber('m_nSemanticIndex') ?? 0;
				const semanticName = inputLayoutField.getValueAsString('m_pSemanticName') ?? '';
				const format = inputLayoutField.getValueAsNumber('m_Format') ?? 0;
				const offset = inputLayoutField.getValueAsNumber('m_nOffset') ?? 0;
				const slot = inputLayoutField.getValueAsNumber('m_nSlot') ?? 0;
				const slotType = inputLayoutField.getValueAsString('m_nSlotType') ?? '';/*TODO: create enum*/
				fields.push({ name: semanticName, format: format, offset: offset, slot: slot, slotType: slotType });
			}

			let reader = sourceBlock.reader;
			if (meshoptCompressed) {
				const decompressBuffer = new Uint8Array(new ArrayBuffer(elementCount * elementSizeInBytes));
				if (isVertex) {
					MeshoptDecoder.decodeVertexBuffer(decompressBuffer, elementCount, elementSizeInBytes, new Uint8Array(sourceBlock.reader.buffer.slice(sourceBlock.offset, sourceBlock.offset + sourceBlock.length)));
				} else {
					MeshoptDecoder.decodeIndexBuffer(decompressBuffer, elementCount, elementSizeInBytes, new Uint8Array(sourceBlock.reader.buffer.slice(sourceBlock.offset, sourceBlock.offset + sourceBlock.length)));

				}
				reader = new BinaryReader(decompressBuffer);
			}

			const s1: any/*TODO: fix typer*/ = { vertexCount: elementCount };
			s1.vertices = new ArrayBuffer(elementCount * BYTES_PER_VERTEX_POSITION);
			s1.normals = new ArrayBuffer(elementCount * BYTES_PER_VERTEX_NORMAL);
			s1.tangents = new ArrayBuffer(elementCount * BYTES_PER_VERTEX_TANGENT);
			s1.coords = new ArrayBuffer(elementCount * BYTES_PER_VERTEX_COORD);
			s1.boneIndices = new ArrayBuffer(elementCount * BYTES_PER_VERTEX_BONE_INDICE);
			s1.boneWeight = new ArrayBuffer(elementCount * BYTES_PER_VERTEX_BONE_WEIGHT);

			//TODO: optimize, we only need either s1 or s2
			const s2: any/*TODO: fix typer*/ = { bytesPerIndex: 4/*elementSizeInBytes*//*TODO: fix that: loadMesh only accept uint32*/ };
			s2.indexCount = elementCount;
			//s2.bytesPerIndex = reader.getInt32();
			//s2.headerOffset = reader.tell() + reader.getInt32();
			//s2.headerCount = reader.getInt32();
			//s2.dataOffset = reader.tell() + reader.getInt32();
			//s2.dataLength = reader.getInt32();

			const s1Vertices = new Float32Array(s1.vertices);
			const s1Normals = new Float32Array(s1.normals);
			const s1Tangents = new Float32Array(s1.tangents);
			const s1Coords = new Float32Array(s1.coords);
			const s1BoneIndices = new Float32Array(s1.boneIndices);
			const s1BoneWeight = new Float32Array(s1.boneWeight);

			s2.indices = new ArrayBuffer(s2.indexCount * s2.bytesPerIndex);
			const s2Indices = s2.bytesPerIndex == 4 ? new Uint32Array(s2.indices) : new Uint16Array(s2.indices);

			for (let elementIndex = 0; elementIndex < elementCount; elementIndex++) {
				const startOffset = elementIndex * elementSizeInBytes;
				if (isVertex) {
					let tempValue: number[] | vec2 | vec3 | vec4;

					let positionFilled = false;//TODOv3: remove this
					let normalFilled = false;
					let tangentFilled = false;
					let texCoordFilled = false;
					let blendIndicesFilled = false;
					let blendWeightFilled = false;

					for (let fieldIndex = 0; fieldIndex < fieldsCount; fieldIndex++) {
						const field = fields[fieldIndex]!;
						sourceBlock.reader.seek(startOffset + field.offset);

						switch (field.format) {
							case DXGI_FORMAT_R32G32B32A32_FLOAT:
								tempValue = vec4.create();//TODO: optimize
								tempValue[0] = reader.getFloat32();
								tempValue[1] = reader.getFloat32();
								tempValue[2] = reader.getFloat32();
								tempValue[3] = reader.getFloat32();
								break;
							case DXGI_FORMAT_R32G32B32_FLOAT:// 3 * float32
								tempValue = vec3.create();//TODO: optimize
								tempValue[0] = reader.getFloat32();
								tempValue[1] = reader.getFloat32();
								tempValue[2] = reader.getFloat32();
								break;
							case DXGI_FORMAT_R16G16B16A16_SINT:
								tempValue = vec4.create();//TODO: optimize
								tempValue[0] = reader.getInt16();
								tempValue[1] = reader.getInt16();
								tempValue[2] = reader.getInt16();
								tempValue[3] = reader.getInt16();
								break;
							case DXGI_FORMAT_R32G32_FLOAT:// 2 * float32
								tempValue = vec2.create();//TODO: optimize
								tempValue[0] = reader.getFloat32();
								tempValue[1] = reader.getFloat32();
								break;
							case DXGI_FORMAT_R8G8B8A8_UNORM:
								tempValue = vec4.create();//TODO: optimize
								tempValue[0] = reader.getUint8() / 255;
								tempValue[1] = reader.getUint8() / 255;
								tempValue[2] = reader.getUint8() / 255;
								tempValue[3] = reader.getUint8() / 255;
								//reader.getUint8();
								break;
							case DXGI_FORMAT_R8G8B8A8_UINT:// 4 * uint8
								tempValue = vec4.create();//TODO: optimize
								tempValue[0] = reader.getUint8();
								tempValue[1] = reader.getUint8();
								tempValue[2] = reader.getUint8();
								tempValue[3] = reader.getUint8();
								break;
							case DXGI_FORMAT_R16G16_FLOAT:// 2 * float16
								tempValue = vec2.create();//TODO: optimize
								tempValue[0] = reader.getFloat16();
								tempValue[1] = reader.getFloat16();
								break;
							case DXGI_FORMAT_R16G16_SNORM://New with battlepass 2022
								tempValue = vec2.create();//TODO: optimize
								tempValue[0] = sNormUint16(reader.getInt16());
								tempValue[1] = sNormUint16(reader.getInt16());
								break;
							case DXGI_FORMAT_R16G16_SINT:
								tempValue = vec2.create();//TODO: optimize
								tempValue[0] = reader.getInt16();
								tempValue[1] = reader.getInt16();
								break;
							case DXGI_FORMAT_R32_FLOAT:// single float32 ??? new in half-life Alyx
								tempValue = [];
								tempValue[0] = reader.getFloat32();
								break;
							case DXGI_FORMAT_R32_UINT: // single uint32 ??? new since DOTA2 2023_08_30
								tempValue = [];
								tempValue[0] = reader.getUint32();
								s1.decompressTangentV2 = true;
								break;
							default:
								//TODO add types when needed. see DxgiFormat.js
								console.error('Warning: unknown type ' + field.format + ' for value ' + field.name);
								tempValue = vec4.create();//TODO: optimize
								tempValue[0] = 0;
								tempValue[1] = 0;
								tempValue[2] = 0;
								tempValue[3] = 0;
						}

						switch (field.name) {
							case 'POSITION':
								s1Vertices.set(tempValue, elementIndex * VERTEX_POSITION_LEN);
								positionFilled = true;
								break;
							case 'NORMAL':
								s1Normals.set(tempValue, elementIndex * VERTEX_NORMAL_LEN);//TODOv3
								normalFilled = true;
								break;
							case 'TANGENT':
								s1Tangents.set(tempValue, elementIndex * VERTEX_TANGENT_LEN);//TODOv3
								tangentFilled = true;
								break;
							case 'TEXCOORD':
								if (!texCoordFilled) {//TODO: handle 2 TEXCOORD
									const test = vec2.clone(tempValue as vec2);//todov3: fixme see //./Alyx/models/props_industrial/hideout_doorway.vmdl_c
									s1Coords.set(test/*tempValue*/, elementIndex * VERTEX_COORD_LEN);
									texCoordFilled = true;
								}
								break;
							case 'BLENDINDICES':
								/*s1.boneIndices.push(tempValue[0]);
								s1.boneIndices.push(tempValue[1]);
								s1.boneIndices.push(tempValue[2]);
								s1.boneIndices.push(tempValue[3]);*/
								s1BoneIndices.set(tempValue, elementIndex * VERTEX_BONE_INDICE_LEN);
								blendIndicesFilled = true;
								break;
							case 'BLENDWEIGHT':
								/*s1.boneWeight.push(tempValue[0]);
								s1.boneWeight.push(tempValue[1]);
								s1.boneWeight.push(tempValue[2]);
								s1.boneWeight.push(tempValue[3]);*/
								//vec4.scale(tempValue, tempValue, 1 / 255.0);
								s1BoneWeight.set(tempValue, elementIndex * VERTEX_BONE_WEIGHT_LEN);
								blendWeightFilled = true;
								break;
							//TODOv3: add "texcoord" lowercase maybe a z- tex coord ?
						}
					}

					if (!positionFilled) {
						/*s1.vertices.push(0);
						s1.vertices.push(0);
						s1.vertices.push(0);*/
						s1Vertices.set(defaultValuesPosition, elementIndex * VERTEX_POSITION_LEN);
					}
					if (!normalFilled) {
						/*s1.normals.push(0);
						s1.normals.push(0);
						s1.normals.push(0);*/
						s1Normals.set(defaultValuesNormal, elementIndex * VERTEX_NORMAL_LEN);
					}
					if (!tangentFilled) {
						s1Tangents.set(defaultValuesTangent, elementIndex * VERTEX_TANGENT_LEN);
					}
					if (!texCoordFilled) {
						/*s1.coords.push(0);
						s1.coords.push(0);*/
						s1Coords.set(defaultValuesCoord, elementIndex * VERTEX_COORD_LEN);
					}
					if (!blendIndicesFilled) {
						/*s1.boneIndices.push(0);
						s1.boneIndices.push(0);
						s1.boneIndices.push(0);
						s1.boneIndices.push(0);*/
						s1BoneIndices.set(defaultValuesBoneIndice, elementIndex * VERTEX_BONE_INDICE_LEN);
					}
					if (!blendWeightFilled) {
						/*s1.boneWeight.push(255);
						s1.boneWeight.push(0);
						s1.boneWeight.push(0);
						s1.boneWeight.push(0);*/
						s1BoneWeight.set(defaultValuesBoneWeight, elementIndex * VERTEX_BONE_WEIGHT_LEN);
					}

				} else {
					sourceBlock.reader.seek(startOffset);
					var vertex = {};
					//s2.indices.push(indexReader.getUint16());
					if (elementSizeInBytes == 2) {
						s2Indices[elementIndex] = reader.getUint16();
					} else {
						s2Indices[elementIndex] = reader.getUint32();
					}
				}
			}

			if (isVertex) {
				vmdl.vertices?.push(s1);
			} else {
				vmdl.indices?.push(s2);
			}
		}
	}

	#loadMesh(repository: string, model: Source2Model, group: Entity, dataBlock: Source2FileBlock, vbibBlock: Source2FileBlock, lodGroupMask: number, vmdl: Source2File, meshIndex: number, meshGroupMask: number | undefined) {
		// TODO: remove vbibBlock
		const remappingTable = vmdl.getRemappingTable(meshIndex);

		const attachments = dataBlock.getKeyValueAsElementArray('m_attachments');
		if (attachments) {
			model._addAttachments(attachments);
		}
		const drawCalls = dataBlock.getKeyValueAsElementArray('m_sceneObjects.0.m_drawCalls');// ?? dataBlock.getKeyValue('root.m_drawCalls');
		if (drawCalls) {
			// TODO: use m_nPrimitiveType
			for (const drawCall of drawCalls) {//TODOv3: mutualize buffer if used by multiple drawcalls
				//const drawCall = drawCalls[drawCallIndex];
				const useCompressedNormalTangent = drawCall.getValueAsBool('m_bUseCompressedNormalTangent') //drawCall.m_nFlags?.includes('MESH_DRAW_FLAGS_USE_COMPRESSED_NORMAL_TANGENT');

				console.assert(useCompressedNormalTangent !== null, 'missing m_bUseCompressedNormalTangent', drawCall);


				const vertexBuffers = drawCall.getValueAsElementArray('m_vertexBuffers')?.[0]//TODOv3 why 0 ?
				if (!vertexBuffers) {
					continue;
				}
				const bufferIndex = vertexBuffers.getValueAsNumber('m_hBuffer');
				const startIndex = drawCall.getValueAsNumber('m_nStartIndex');
				const indexCount = drawCall.getValueAsNumber('m_nIndexCount');
				if (bufferIndex === null || startIndex === null || indexCount === null) {
					console.error('missing vertexBuffers in loadMesh', vertexBuffers, bufferIndex, startIndex, indexCount);
					continue;
				}
				const indices = new Uint32BufferAttribute(vbibBlock.getIndices(bufferIndex), 1, startIndex * 4, indexCount);//NOTE: number is here to convert bigint TODO: see if we can do better
				const vertexPosition = new Float32BufferAttribute(vbibBlock.getVertices(bufferIndex), 3);

				let vertexNormal, vertexTangent;
				if (useCompressedNormalTangent) {
					const [normal, tangent] = vbibBlock.getNormalsTangents(bufferIndex);
					vertexNormal = new Float32BufferAttribute(normal, 3);
					vertexTangent = new Float32BufferAttribute(tangent, 4);
				} else {
					vertexNormal = new Float32BufferAttribute(vbibBlock.getNormal(bufferIndex), 4);
					vertexTangent = new Float32BufferAttribute(vbibBlock.getTangent(bufferIndex), 4);

				}
				const textureCoord = new Float32BufferAttribute(vbibBlock.getCoords(bufferIndex), 2);
				const vertexWeights = new Float32BufferAttribute(vbibBlock.getBoneWeight(bufferIndex), 4);
				const vertexBones = new Float32BufferAttribute(vmdl.remapBuffer(vbibBlock.getBoneIndices(bufferIndex), remappingTable), 4);

				const geometry = new BufferGeometry();
				geometry.properties.setNumber('lodGroupMask', lodGroupMask);
				geometry.properties.setBigint('mesh_group_mask', BigInt(meshGroupMask ?? 0xFFFFFFFFFFFFFFFFn));
				geometry.setIndex(indices);
				geometry.setAttribute('aVertexPosition', vertexPosition);
				geometry.setAttribute('aVertexNormal', vertexNormal);
				geometry.setAttribute('aVertexTangent', vertexTangent);
				geometry.setAttribute('aTextureCoord', textureCoord);
				geometry.setAttribute('aBoneWeight', vertexWeights);
				geometry.setAttribute('aBoneIndices', vertexBones);
				geometry.count = indexCount//Number(drawCall.m_nIndexCount);//NOTE: number is here to convert bigint TODO: see if we can do better


				const bones = dataBlock.getKeyValueAsElementArray('m_skeleton.m_bones');
				if (bones) {
					geometry.properties.set('bones', new Property(PropertyType.Array, bones));
				} else {
					console.error('unable to find m_skeleton.m_bones in DATA block', dataBlock);
				}

				const material = defaultMaterial;
				const staticMesh = new Mesh(geometry, material);
				group.addChild(staticMesh);

				const materialPath = drawCall.getValueAsResource('m_material');
				if (materialPath !== null) {
					geometry.properties.setString('materialPath', materialPath);
					Source2MaterialManager.getMaterial(repository, materialPath).then(
						material => {
							if (material) {
								staticMesh.setMaterial(material)
							} else {
								console.error('unable to find material ' + materialPath);
							}
						}
					);
					model.addGeometry(geometry, FileNameFromPath(materialPath), 0/*TODOv3*/);
				} else {
					console.error('missing property m_material in draw call', drawCall);
				}
				//const materialPath = geometry.properties.getString('materialPath');

			}
		}
	}

	async #loadExternalMeshes(group: Entity, vmdl: Source2File, model: Source2Model, repository: string) {
		const callback = (mesh: Source2File, lodGroupMask: number, meshIndex: number, meshGroupMask: number | undefined) => {
			//TODO: only load highest LOD
			const dataBlock = mesh.getBlockByType('DATA');
			const vbibBlock = mesh.getBlockByType('VBIB');
			if (dataBlock && vbibBlock) {
				this.#loadMesh(repository, model, group, dataBlock, vbibBlock, lodGroupMask, vmdl, meshIndex, meshGroupMask);
			}
		}
		await this.#loadMeshes(vmdl, callback);
	}

	async #loadMeshes(vmdl: Source2File, callback: (arg1: Source2File, arg2: number, arg3: number, arg4: number | undefined) => void/*TODO: remove callback*/) {
		const promises = new Set<Promise<Source2File>>();
		//const m_refMeshes = vmdl.getBlockStruct('DATA.structs.PermModelData_t.m_refMeshes') || vmdl.getBlockStruct('DATA.keyValue.root.m_refMeshes');
		//const m_refLODGroupMasks = vmdl.getBlockStruct('DATA.structs.PermModelData_t.m_refLODGroupMasks') || vmdl.getBlockStruct('DATA.keyValue.root.m_refLODGroupMasks');
		//const m_refMeshGroupMasks = vmdl.getBlockStruct('DATA.structs.PermModelData_t.m_refMeshGroupMasks') || vmdl.getBlockStruct('DATA.keyValue.root.m_refMeshGroupMasks');
		const m_refMeshes = vmdl.getBlockStructAsResourceArray('DATA', 'm_refMeshes');
		const m_refLODGroupMasks = vmdl.getBlockStructAsBigintArray('DATA', 'm_refLODGroupMasks') ?? vmdl.getBlockStructAsNumberArray('DATA', 'm_refLODGroupMasks');
		const m_refMeshGroupMasks = vmdl.getBlockStructAsNumberArray('DATA', 'm_refMeshGroupMasks');
		if (m_refMeshes && m_refLODGroupMasks) {
			for (let meshIndex = 0; meshIndex < m_refMeshes.length; meshIndex++) {//TODOv3
				const meshName = m_refMeshes[meshIndex];
				const lodGroupMask = Number(m_refLODGroupMasks[meshIndex]);
				const meshGroupMask = m_refMeshGroupMasks?.[meshIndex];
				if (meshName) {
					const promise = MeshManager.getMesh(vmdl.repository, meshName);
					promises.add(promise);
					promise.then(
						(mesh) => {
							if (VERBOSE) {
								console.error(mesh);
							}
							callback(mesh, lodGroupMask, meshIndex, meshGroupMask);
						}
					);
				}
			}
		}
		await Promise.all(promises);
	}

	async #loadIncludeModels(model: Source2Model) {
		const includeModels = model.getIncludeModels();
		for (const includeModel of includeModels) {
			const refModel = await new Source2ModelLoader().load(model.repository, includeModel);
			if (refModel) {
				model.addIncludeModel(refModel);
			}
		}
	}
}


type VertexField = {
	name: string;
	format: number;
	offset: number;
	slot: number;
	slotType: string/*TODO: enum*/;
}
