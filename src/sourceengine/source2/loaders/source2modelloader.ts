import { MeshManager } from '../models/meshmanager'
import { Source2Model } from '../models/source2model';
import { Source2FileLoader } from './source2fileloader';

import { Uint32BufferAttribute, Float32BufferAttribute } from '../../../geometry/bufferattribute';
import { BufferGeometry } from '../../../geometry/buffergeometry';
import { Mesh } from '../../../objects/mesh';
import { MeshBasicMaterial } from '../../../materials/meshbasicmaterial';
import { Entity } from '../../../entities/entity';
import { FileNameFromPath } from '../../../utils/utils';
import { Source2MaterialManager } from '../materials/source2materialmanager';
import { VERBOSE } from '../../../buildoptions';

const defaultMaterial = new MeshBasicMaterial();

export class Source2ModelLoader {
	static #loadPromisesPerRepo = {};

	static {
		defaultMaterial.addUser(Source2ModelLoader);
	}

	load(repositoryName, fileName) {
		// Cleanup filename
		fileName = fileName.replace(/.vmdl_c$/, '').replace(/.vmdl$/, '');

		let repoPromises = Source2ModelLoader.#loadPromisesPerRepo[repositoryName];
		if (!repoPromises) {
			repoPromises = {};
			Source2ModelLoader.#loadPromisesPerRepo[repositoryName] = repoPromises;
		}

		let promise = repoPromises[fileName];
		if (promise) {
			return promise;
		}

		promise = new Promise((resolve, reject) => {
			const vmdlPromise = new Source2FileLoader().load(repositoryName, fileName + '.vmdl_c');
			vmdlPromise.then(
				async (source2File) => {
					if (VERBOSE) {
						console.log(source2File);
					}
					const newSourceModel = new Source2Model(repositoryName, source2File);
					this.#loadIncludeModels(newSourceModel);
					const mesh = await this.testProcess2(source2File, newSourceModel, repositoryName);
					newSourceModel.loadAnimGroups();
					resolve(newSourceModel);
				}
			).catch(
				(error) => reject(error)
			)
			return;
		});
		repoPromises[fileName] = promise;
		return promise;
	}

	async testProcess2(vmdl, model, repository) {
		const group = new Entity();
		const ctrlRoot = vmdl.getBlockStruct('CTRL.keyValue.root');
		const m_refLODGroupMasks = vmdl.getBlockStruct('DATA.structs.PermModelData_t.m_refLODGroupMasks') || vmdl.getBlockStruct('DATA.keyValue.root.m_refLODGroupMasks');
		const m_refMeshGroupMasks = vmdl.getBlockStruct('DATA.structs.PermModelData_t.m_refMeshGroupMasks') || vmdl.getBlockStruct('DATA.keyValue.root.m_refMeshGroupMasks');
		if (ctrlRoot && m_refLODGroupMasks) {
			const embeddedMeshes = ctrlRoot.embedded_meshes;
			for (let meshIndex = 0; meshIndex < embeddedMeshes.length; ++meshIndex) {
				const lodGroupMask = Number(m_refLODGroupMasks[meshIndex]);
				const meshGroupMask = m_refMeshGroupMasks?.[meshIndex];
				const embeddedMesh = embeddedMeshes[meshIndex];
				this.#loadMesh(repository, model, group, vmdl.getBlockById(embeddedMesh.data_block), vmdl.getBlockById(embeddedMesh.vbib_block), lodGroupMask, vmdl, meshIndex, meshGroupMask);

				/*data_block: 1
				mesh_index: 0
				morph_block: 0
				morph_texture: "models/heroes/antimage_female/antimage_female/antimage_female_base_vmorf.vtex"
				name: "antimage_female_base"
				vbib_block: 2*/

			}

		}
		await this._loadExternalMeshes(group, vmdl, model, repository);
		return group;
	}

	#loadMesh(repository, model, group, dataBlock, vbibBlock, lodGroupMask, vmdl, meshIndex, meshGroupMask: number | undefined) {
		const remappingTable = vmdl.getRemappingTable(meshIndex);

		model._addAttachements(dataBlock.getKeyValue('m_attachments'));
		const drawCalls = dataBlock.getKeyValue('m_sceneObjects.0.m_drawCalls') || dataBlock.getKeyValue('root.m_drawCalls');
		if (drawCalls) {
			for (let drawCallIndex = 0, l = drawCalls.length; drawCallIndex < l; ++drawCallIndex) {//TODOv3: mutualize buffer if used by multiple drawcalls
				const drawCall = drawCalls[drawCallIndex];
				const useCompressedNormalTangent = drawCall.m_bUseCompressedNormalTangent ?? drawCall.m_nFlags?.includes('MESH_DRAW_FLAGS_USE_COMPRESSED_NORMAL_TANGENT');

				const vertexBuffers = drawCall.m_vertexBuffers[0];//TODOv3 why 0 ?
				if (!vertexBuffers) {
					continue;
				}
				const bufferIndex = vertexBuffers.m_hBuffer;
				const indices = new Uint32BufferAttribute(vbibBlock.getIndices(bufferIndex), 1, Number(drawCall.m_nStartIndex) * 4, Number(drawCall.m_nIndexCount));//NOTE: number is here to convert bigint TODO: see if we can do better
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
				geometry.properties.set('lodGroupMask', lodGroupMask);
				geometry.properties.set('mesh_group_mask', meshGroupMask ?? 0xFFFFFFFFFFFFFFFFn);
				geometry.setIndex(indices);
				geometry.setAttribute('aVertexPosition', vertexPosition);
				geometry.setAttribute('aVertexNormal', vertexNormal);
				geometry.setAttribute('aVertexTangent', vertexTangent);
				geometry.setAttribute('aTextureCoord', textureCoord);
				geometry.setAttribute('aBoneWeight', vertexWeights);
				geometry.setAttribute('aBoneIndices', vertexBones);
				geometry.count = Number(drawCall.m_nIndexCount);//NOTE: number is here to convert bigint TODO: see if we can do better
				geometry.properties.set('materialPath', drawCall.m_material);
				geometry.properties.set('bones', dataBlock.getKeyValue('m_skeleton.m_bones'));

				const material = defaultMaterial;
				const staticMesh = new Mesh(geometry, material);
				group.addChild(staticMesh);
				const materialPath = geometry.properties.get('materialPath');
				Source2MaterialManager.getMaterial(repository, materialPath).then(
					(material) => staticMesh.setMaterial(material)
				).catch(
					(error) => console.error('unable to find material ' + materialPath, error)
				);

				model.addGeometry(geometry, FileNameFromPath(drawCall.m_material), 0/*TODOv3*/);
			}
		}
	}

	async _loadExternalMeshes(group, vmdl, model, repository) {
		const callback = (mesh, lodGroupMask, meshIndex, meshGroupMask: number | undefined) => {
			//TODO: only load highest LOD
			this.#loadMesh(repository, model, group, mesh.getBlockByType('DATA'), mesh.getBlockByType('VBIB'), lodGroupMask, vmdl, meshIndex, meshGroupMask);
		}
		await this.loadMeshes(vmdl, callback);
	}

	async loadMeshes(vmdl, callback) {
		const promises = new Set();
		const m_refMeshes = vmdl.getBlockStruct('DATA.structs.PermModelData_t.m_refMeshes') || vmdl.getBlockStruct('DATA.keyValue.root.m_refMeshes');
		const m_refLODGroupMasks = vmdl.getBlockStruct('DATA.structs.PermModelData_t.m_refLODGroupMasks') || vmdl.getBlockStruct('DATA.keyValue.root.m_refLODGroupMasks');
		const m_refMeshGroupMasks = vmdl.getBlockStruct('DATA.structs.PermModelData_t.m_refMeshGroupMasks') || vmdl.getBlockStruct('DATA.keyValue.root.m_refMeshGroupMasks');
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

	async #loadIncludeModels(model) {
		const includeModels = model.getIncludeModels();
		for (const includeModel of includeModels) {
			const refModel = await new Source2ModelLoader().load(model.repository, includeModel);
			if (refModel) {
				model.addIncludeModel(refModel);
			}
		}
	}
}
