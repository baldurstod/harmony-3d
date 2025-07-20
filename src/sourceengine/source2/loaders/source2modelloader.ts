import { VERBOSE } from '../../../buildoptions';
import { Entity } from '../../../entities/entity';
import { Float32BufferAttribute, Uint32BufferAttribute } from '../../../geometry/bufferattribute';
import { BufferGeometry } from '../../../geometry/buffergeometry';
import { MeshBasicMaterial } from '../../../materials/meshbasicmaterial';
import { Mesh } from '../../../objects/mesh';
import { Property, PropertyType } from '../../../utils/properties';
import { FileNameFromPath } from '../../../utils/utils';
import { Kv3Value } from '../../common/keyvalue/kv3value';
import { Source2MaterialManager } from '../materials/source2materialmanager';
import { MeshManager } from '../models/meshmanager';
import { Source2Model } from '../models/source2model';
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

	async testProcess2(vmdl: Source2File, model: Source2Model, repository: string): Promise<Entity> {
		const group = new Entity();
		const ctrlRoot = vmdl.getBlockKeyValues('CTRL');
		const m_refLODGroupMasks = vmdl.getBlockStructAsBigintArray('DATA', 'm_refLODGroupMasks') ?? vmdl.getBlockStructAsNumberArray('DATA', 'm_refLODGroupMasks');// ?? vmdl.getBlockStruct('DATA.keyValue.root.m_refLODGroupMasks');
		const m_refMeshGroupMasks = vmdl.getBlockStructAsNumberArray('DATA', 'm_refMeshGroupMasks');// ?? vmdl.getBlockStruct('DATA.keyValue.root.m_refMeshGroupMasks');
		const embeddedMeshes = ctrlRoot?.getValueAsElementArray('embedded_meshes');
		if (ctrlRoot && m_refLODGroupMasks && embeddedMeshes) {
			for (let meshIndex = 0; meshIndex < embeddedMeshes.length; ++meshIndex) {
				const lodGroupMask = Number(m_refLODGroupMasks[meshIndex]);
				const meshGroupMask = m_refMeshGroupMasks?.[meshIndex];
				const embeddedMesh = embeddedMeshes[meshIndex];

				const dataBlockId = embeddedMesh.getValueAsNumber('data_block');
				const vbibBlockId = embeddedMesh.getValueAsNumber('vbib_block');

				if (dataBlockId === null || vbibBlockId === null) {
					console.error('missing dataBlockId / vbibBlockId', embeddedMesh);
					continue;
				}

				const dataBlock = vmdl.getBlockById(dataBlockId);
				const vbibBlock = vmdl.getBlockById(vbibBlockId);

				if (dataBlock === null || vbibBlock === null) {
					console.error('missing dataBlock / vbibBlock', embeddedMesh, dataBlock, vbibBlock);
					continue;
				}

				this.#loadMesh(repository, model, group, dataBlock, vbibBlock, lodGroupMask, vmdl, meshIndex, meshGroupMask);

				/*data_block: 1
				mesh_index: 0
				morph_block: 0
				morph_texture: "models/heroes/antimage_female/antimage_female/antimage_female_base_vmorf.vtex"
				name: "antimage_female_base"
				vbib_block: 2*/
			}
		}
		await this.#loadExternalMeshes(group, vmdl, model, repository);
		return group;
	}

	#loadMesh(repository: string, model: Source2Model, group: Entity, dataBlock: Source2FileBlock, vbibBlock: Source2FileBlock, lodGroupMask: number, vmdl: Source2File, meshIndex: number, meshGroupMask: number | undefined) {
		const remappingTable = vmdl.getRemappingTable(meshIndex);

		const attachments = dataBlock.getKeyValueAsElementArray('m_attachments');
		if (attachments) {
			model._addAttachments(attachments);
		}
		const drawCalls = dataBlock.getKeyValueAsElementArray('m_sceneObjects.0.m_drawCalls');// ?? dataBlock.getKeyValue('root.m_drawCalls');
		if (drawCalls) {
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
		const callback = (mesh, lodGroupMask, meshIndex, meshGroupMask: number | undefined) => {
			//TODO: only load highest LOD
			this.#loadMesh(repository, model, group, mesh.getBlockByType('DATA'), mesh.getBlockByType('VBIB'), lodGroupMask, vmdl, meshIndex, meshGroupMask);
		}
		await this.loadMeshes(vmdl, callback);
	}

	async loadMeshes(vmdl: Source2File, callback) {
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
