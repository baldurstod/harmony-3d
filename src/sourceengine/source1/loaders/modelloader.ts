import { VERBOSE } from '../../../buildoptions';
import { Float32BufferAttribute, Uint32BufferAttribute } from '../../../geometry/bufferattribute';
import { BufferGeometry } from '../../../geometry/buffergeometry';
import { getLoader, registerLoader } from '../../../loaders/loaderfactory';
import { SourceEngineMDLLoader } from './sourceenginemdlloader';
import { SourceEngineVTXLoader } from './sourceenginevtxloader';
import { SourceEngineVVDLoader } from './sourceenginevvdloader';
import { SourceMdl } from './sourcemdl';
import { SourceModel } from './sourcemodel';
import { SourceVtx } from './sourcevtx';
import { SourceVvd } from './sourcevvd';

export class ModelLoader {
	load(repositoryName: string, fileName: string): Promise<SourceModel | null> {
		const promise = new Promise<SourceModel | null>(async (resolve) => {
			fileName = fileName.toLowerCase().replace(/.mdl$/, '');

			// First load mdl. We need the mdl version to load the vtx
			const mdlLoader = getLoader('SourceEngineMDLLoader') as typeof SourceEngineMDLLoader;
			const mdl = await new mdlLoader().load(repositoryName, fileName + '.mdl');
			if (!mdl) {
				resolve(null);
				return;
			}

			const vvdPromise = new SourceEngineVVDLoader().load(repositoryName, fileName + '.vvd');
			const vtxPromise = new SourceEngineVTXLoader(mdl.header.formatVersionID).load(repositoryName, fileName + '.dx90.vtx');

			Promise.all([vvdPromise, vtxPromise]).then(([vvd, vtx]) => {
				if (vvd && vtx) {
					this.#fileLoaded(resolve, repositoryName, fileName, mdl, vvd, vtx);
				}
			});

		});
		return promise;
	}

	#fileLoaded(resolve: (value: SourceModel | null) => void, repositoryName: string, fileName: string, mdl: SourceMdl, vvd: SourceVvd, vtx: SourceVtx): void {
		const requiredLod = 0;
		const vertices = [];
		const normals = [];
		const tangents = [];
		const uvs = [];
		const boneWeights = [];
		const boneIds = [];

		const vertexArray = vvd.getVertices(requiredLod);//vertices;
		const bodyparts = vtx.getBodyparts();//vertices;
		if (!vertexArray || !bodyparts) {
			resolve(null);
			return;
		}
		const newSourceModel = new SourceModel(repositoryName, fileName, mdl, vvd, vtx);

		for (const i of vertexArray) {
			vertices.push(...i.m_vecPosition);
			normals.push(...i.m_vecNormal);
			tangents.push(...i.m_vecTangent);
			uvs.push(...i.m_vecTexCoord);
			boneWeights.push(...i.m_BoneWeights.weight);
			boneIds.push(...i.m_BoneWeights.bone);
		}

		const vertexPosition = new Float32BufferAttribute(vertices, 3);
		const vertexNormal = new Float32BufferAttribute(normals, 3);
		const vertexTangent = new Float32BufferAttribute(tangents, 4);
		const textureCoord = new Float32BufferAttribute(uvs, 2);
		const vertexWeights = new Float32BufferAttribute(boneWeights, 3);
		const vertexBones = new Float32BufferAttribute(boneIds, 3);
		//let material = new MeshBasicMaterial({map: 'texture'});//removeme
		//console.info('Vertex array :')
		//console.info(vertexArray);

		let bodypart = null;
		let model = null;
		let lod = null;
		let stripgroup = null;
		let cumulateVertexOffset = 0;
		let modelsname = '';
		// Iterate body parts
		for (let bodypartIndex = 0; bodypartIndex < bodyparts.length; ++bodypartIndex) {
			const bodyPart = /*bodyparts[bodypartIndex];//*/mdl.getBodyPart(bodypartIndex);
			if (bodyPart) {
				bodypart = bodyparts[bodypartIndex];
				if (VERBOSE) {
					console.info('Bodypart : ' + bodypartIndex);
				}

				const bp = bodyPart;

				// iterate models
				for (let modelIndex = 0; modelIndex < bodypart.models.length; ++modelIndex) {
					model = bodypart.models[modelIndex];
					modelsname += bodyPart.models[modelIndex].name + ', ';//TODOV2
					if (VERBOSE) {
						console.info('	Model : ' + modelIndex);
					}
					lod = model.lods[requiredLod];
					const modelTest = bodyPart.models[modelIndex];

					// iterate meshes
					for (let meshIndex = 0; meshIndex < lod.meshes.length; ++meshIndex) {
						const mesh = lod.meshes[meshIndex];
						if (VERBOSE) {
							console.info('		Mesh : ' + meshIndex);
						}

						const msh = modelTest.meshArray[meshIndex]//new SourceModel.MeshTest();

						if (!msh.initialized) {

							//msh.setMaterialId(bodyPart.models[modelIndex].meshArray[meshIndex].material);
							const vertexOffset = cumulateVertexOffset + bodyPart.models[modelIndex].meshArray[meshIndex].vertexoffset; //TODO
							const indices = [];
							for (let stripgroupIndex = 0; stripgroupIndex < mesh.stripGroups.length; ++stripgroupIndex) {
								stripgroup = mesh.stripGroups[stripgroupIndex];
								if (VERBOSE) {
									console.info('			Stripgroup : ' + stripgroupIndex + ' index : ' + stripgroup.indexes.length + ' vertices : ' + stripgroup.vertices.length);
								}

								const indexArray = stripgroup.indexes
								const stripVertexArray = stripgroup.vertices

								if (VERBOSE) {
									console.info('Offset : ' + vertexOffset);
								}

								//if (this.drawBodyPart[bodyPartName])
								for (let k = 0; k < indexArray.length; ++k) {
									const j = indexArray[k];
									const sva = stripVertexArray[j];
									if (!sva) break;
									const i = sva.origMeshVertID + vertexOffset;//TODO: rename variable i
									indices.push(i);
								}
							} // stripgroup

							// reverse triangles from CW to CCW
							for (let i = 0, l = indices.length; i < l; i += 3) {//TODOv3: optimize
								const a: number = indices[i + 1];
								indices[i + 1] = indices[i + 2];
								indices[i + 2] = a;
							}

							const geometry = new BufferGeometry();
							geometry.setIndex(new Uint32BufferAttribute(indices, 1));
							geometry.setAttribute('aVertexPosition', vertexPosition);
							geometry.setAttribute('aVertexNormal', vertexNormal);
							geometry.setAttribute('aVertexTangent', vertexTangent);
							geometry.setAttribute('aTextureCoord', textureCoord);
							geometry.setAttribute('aBoneWeight', vertexWeights);
							geometry.setAttribute('aBoneIndices', vertexBones);
							geometry.properties.set('materialId', msh.material);
							geometry.properties.set('materialType', msh.materialtype);//TODOv3 : setup a better material param
							geometry.properties.set('materialParam', msh.materialparam);//TODOv3 : setup a better material param
							geometry.properties.set('eyeballArray', msh.model.eyeballArray);//TODOv3 : setup a better material param

							geometry.count = indices.length;
							geometry.properties.set('name', modelTest.name);


							newSourceModel.addGeometry(msh, geometry, bodyPart.name, modelIndex);
						}
					} // mesh
					cumulateVertexOffset += bodyPart.models[modelIndex].numvertices;
					if (VERBOSE) {
						console.info('cumulate vertex offset : ' + cumulateVertexOffset);
					}
				} // model
			} else {
				//console.error('Bodypart not found ' + bodypartIndex);
			}
		} // body
		resolve(newSourceModel);
	}
}
registerLoader('ModelLoader', ModelLoader);
