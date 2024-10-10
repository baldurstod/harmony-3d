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

		//const repository = Repositories.getRepository(repositoryName).base;
		promise = new Promise((resolve, reject) => {
			let vmdlPromise = new Source2FileLoader().load(repositoryName, fileName + '.vmdl_c');
			vmdlPromise.then(
				async (source2File) => {
					if (VERBOSE) {
						console.log(source2File);
					}
					let newSourceModel = new Source2Model(repositoryName, source2File);
					this.#loadIncludeModels(newSourceModel);
					let mesh = await this.testProcess2(source2File, newSourceModel, repositoryName);
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

	async testProcess_removeme(vmdl, model, repository) {//TODOv3: removeme
		let group = new Entity();
		let drawCalls = vmdl.getBlockStruct('MDAT.keyValue.root.m_sceneObjects.0.m_drawCalls') || vmdl.getBlockStruct('MDAT.keyValue.root.m_drawCalls');//TODOv3 process multiple objects
		if (drawCalls) {
			for (let drawCallIndex = 0, l = drawCalls.length; drawCallIndex < l; ++drawCallIndex) {//TODOv3: mutualize buffer if used by multiple drawcalls
				let drawCall = drawCalls[drawCallIndex];
				let vertexBuffers = drawCall.m_vertexBuffers[0];//TODOv3 why 0 ?
				if (!vertexBuffers) {
					continue;
				}
				let bufferIndex = vertexBuffers.m_hBuffer;
				//			for(let meshIndex = 0; meshIndex < 12/*TODOv3*/; ++meshIndex) {
				let indices = new Uint32BufferAttribute(vmdl.getIndices(bufferIndex), 1, drawCall.m_nStartIndex * 4, drawCall.m_nIndexCount);
				let vertexPosition = new Float32BufferAttribute(vmdl.getVertices(bufferIndex), 3);
				let vertexNormal = new Float32BufferAttribute(vmdl.getNormals(bufferIndex), 3);
				let textureCoord = new Float32BufferAttribute(vmdl.getCoords(bufferIndex), 2);
				let vertexWeights = new Float32BufferAttribute(vmdl.getBoneWeight(bufferIndex), 4);
				let vertexBones = new Float32BufferAttribute(vmdl.getBoneIndices(bufferIndex), 4);

				let geometry = new BufferGeometry();
				geometry.setIndex(indices);//, drawCall.m_nStartIndex, drawCall.m_nIndexCount);
				geometry.setAttribute('aVertexPosition', vertexPosition);
				geometry.setAttribute('aVertexNormal', vertexNormal);
				geometry.setAttribute('aTextureCoord', textureCoord);
				geometry.setAttribute('aBoneWeight', vertexWeights);
				geometry.setAttribute('aBoneIndices', vertexBones);
				geometry.count = drawCall.m_nIndexCount;
				geometry.properties.set('materialPath', drawCall.m_material);//"models/characters/alyx/materials/alyx_body.vmat"
				geometry.properties.set('bones', vmdl.getBlockStruct('MDAT.keyValue.root.m_skeleton.m_bones'));//mesh.getKeyValue('m_skeleton.m_bones');

				let material = new MeshBasicMaterial();//removemeTODOv3
				let staticMesh = new Mesh(geometry, material);
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
		await this._loadExternalMeshes(group, vmdl, model, repository);
		//vmdl.loadAnimGroups();//TODOv3
		return group;
	}

	async testProcess2(vmdl, model, repository) {
		let group = new Entity();
		let ctrlRoot = vmdl.getBlockStruct('CTRL.keyValue.root');
		let m_refLODGroupMasks = vmdl.getBlockStruct('DATA.structs.PermModelData_t.m_refLODGroupMasks') || vmdl.getBlockStruct('DATA.keyValue.root.m_refLODGroupMasks');
		if (ctrlRoot && m_refLODGroupMasks) {
			let embeddedMeshes = ctrlRoot.embedded_meshes;
			for (let meshIndex = 0; meshIndex < embeddedMeshes.length; ++meshIndex) {
				let lodGroupMask = Number(m_refLODGroupMasks[meshIndex]);
				let embeddedMesh = embeddedMeshes[meshIndex];
				this.#loadMesh(repository, model, group, vmdl.getBlockById(embeddedMesh.data_block), vmdl.getBlockById(embeddedMesh.vbib_block), lodGroupMask, vmdl, meshIndex);

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

	#loadMesh(repository, model, group, dataBlock, vbibBlock, lodGroupMask, vmdl, meshIndex) {
		const remappingTable = vmdl.getRemappingTable(meshIndex);

		model._addAttachements(dataBlock.getKeyValue('m_attachments'));
		let drawCalls = dataBlock.getKeyValue('m_sceneObjects.0.m_drawCalls') || dataBlock.getKeyValue('root.m_drawCalls');
		if (drawCalls) {
			for (let drawCallIndex = 0, l = drawCalls.length; drawCallIndex < l; ++drawCallIndex) {//TODOv3: mutualize buffer if used by multiple drawcalls
				let drawCall = drawCalls[drawCallIndex];
				let useCompressedNormalTangent = drawCall.m_bUseCompressedNormalTangent ?? drawCall.m_nFlags?.includes('MESH_DRAW_FLAGS_USE_COMPRESSED_NORMAL_TANGENT');

				let vertexBuffers = drawCall.m_vertexBuffers[0];//TODOv3 why 0 ?
				if (!vertexBuffers) {
					continue;
				}
				let bufferIndex = vertexBuffers.m_hBuffer;
				let indices = new Uint32BufferAttribute(vbibBlock.getIndices(bufferIndex), 1, Number(drawCall.m_nStartIndex) * 4, Number(drawCall.m_nIndexCount));//NOTE: number is here to convert bigint TODO: see if we can do better
				let vertexPosition = new Float32BufferAttribute(vbibBlock.getVertices(bufferIndex), 3);

				let vertexNormal, vertexTangent;
				if (useCompressedNormalTangent) {
					let [normal, tangent] = vbibBlock.getNormalsTangents(bufferIndex);
					vertexNormal = new Float32BufferAttribute(normal, 3);
					vertexTangent = new Float32BufferAttribute(tangent, 4);
				} else {
					vertexNormal = new Float32BufferAttribute(vbibBlock.getNormal(bufferIndex), 4);
					vertexTangent = new Float32BufferAttribute(vbibBlock.getTangent(bufferIndex), 4);

				}
				let textureCoord = new Float32BufferAttribute(vbibBlock.getCoords(bufferIndex), 2);
				let vertexWeights = new Float32BufferAttribute(vbibBlock.getBoneWeight(bufferIndex), 4);
				let vertexBones = new Float32BufferAttribute(vmdl.remapBuffer(vbibBlock.getBoneIndices(bufferIndex), remappingTable), 4);

				let geometry = new BufferGeometry();
				geometry.properties.set('lodGroupMask', lodGroupMask);
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

				let material = defaultMaterial;
				let staticMesh = new Mesh(geometry, material);
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
		let callback = (mesh, lodGroupMask, meshIndex) => {
			//TODO: only load highest LOD
			this.#loadMesh(repository, model, group, mesh.getBlockByType('DATA'), mesh.getBlockByType('VBIB'), lodGroupMask, vmdl, meshIndex);
		}
		await this.loadMeshes(vmdl, callback);
	}

	async loadMeshes(vmdl, callback) {
		let promises = new Set();
		let m_refMeshes = vmdl.getBlockStruct('DATA.structs.PermModelData_t.m_refMeshes') || vmdl.getBlockStruct('DATA.keyValue.root.m_refMeshes');
		let m_refLODGroupMasks = vmdl.getBlockStruct('DATA.structs.PermModelData_t.m_refLODGroupMasks') || vmdl.getBlockStruct('DATA.keyValue.root.m_refLODGroupMasks');
		if (m_refMeshes && m_refLODGroupMasks) {
			for (let meshIndex = 0; meshIndex < m_refMeshes.length; meshIndex++) {//TODOv3
				let meshName = m_refMeshes[meshIndex];
				let lodGroupMask = Number(m_refLODGroupMasks[meshIndex]);
				if (meshName) {
					let promise = MeshManager.getMesh(vmdl.repository, meshName);
					promises.add(promise);
					promise.then(
						(mesh) => {
							if (VERBOSE) {
								console.error(mesh);
							}
							callback(mesh, lodGroupMask, meshIndex);
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
