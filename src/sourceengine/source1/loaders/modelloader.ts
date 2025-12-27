import { VERBOSE } from '../../../buildoptions';
import { Float32BufferAttribute, Uint32BufferAttribute } from '../../../geometry/bufferattribute';
import { BufferGeometry } from '../../../geometry/buffergeometry';
import { getLoader, registerLoader } from '../../../loaders/loaderfactory';
import { Property, PropertyType } from '../../../utils/properties';
import { Source1MdlLoader } from './source1mdlloader';
import { Source1VtxLoader } from './source1vtxloader';
import { Source1VvdLoader } from './source1vvdloader';
import { SourceMdl } from './sourcemdl';
import { SourceModel } from './sourcemodel';
import { SourceVtx } from './sourcevtx';
import { SourceVvd } from './sourcevvd';

export class ModelLoader {
	load(repositoryName: string, fileName: string): Promise<SourceModel | null> {
		const promise = new Promise<SourceModel | null>(async (resolve) => {
			fileName = fileName.toLowerCase().replace(/\.mdl$/, '');

			// First load mdl. We need the mdl version to load the vtx
			const mdlLoader = getLoader('Source1MdlLoader') as typeof Source1MdlLoader;
			const mdl = await new mdlLoader().load(repositoryName, fileName + '.mdl');
			if (!mdl) {
				resolve(null);
				return;
			}

			const vvdPromise = new Source1VvdLoader().load(repositoryName, fileName + '.vvd');
			const vtxPromise = new Source1VtxLoader(mdl.header.formatVersionID).load(repositoryName, fileName + '.dx90.vtx');

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

		const vertexPosition = new Float32BufferAttribute(vertices, 3, 'position');
		const vertexNormal = new Float32BufferAttribute(normals, 3, 'normal');
		const vertexTangent = new Float32BufferAttribute(tangents, 4, 'tangent');
		const textureCoord = new Float32BufferAttribute(uvs, 2, 'texCoord');
		const vertexWeights = new Float32BufferAttribute(boneWeights, 3, 'boneWeights');
		const vertexBones = new Uint32BufferAttribute(boneIds, 3, 'boneIndices');
		//let material = new MeshBasicMaterial({map: 'texture'});//removeme
		//console.info('Vertex array :')
		//console.info(vertexArray);

		let stripgroup = null;
		let cumulateVertexOffset = 0;
		let modelsname = '';
		// Iterate body parts
		for (let bodypartIndex = 0; bodypartIndex < bodyparts.length; ++bodypartIndex) {
			const bodyPart = /*bodyparts[bodypartIndex];//*/mdl.getBodyPart(bodypartIndex);
			if (bodyPart) {
				const vtxBodyPart = bodyparts[bodypartIndex];
				if (!vtxBodyPart) {
					continue;
				}
				if (VERBOSE) {
					console.info('Bodypart : ' + bodypartIndex);
				}

				// iterate models
				for (let modelIndex = 0; modelIndex < vtxBodyPart.models.length; ++modelIndex) {
					const modelTest = bodyPart.models[modelIndex];
					if (!modelTest) {
						continue;
					}

					const model = vtxBodyPart.models[modelIndex];
					if (!model) {
						continue;
					}

					modelsname += modelTest.name + ', ';//TODOV2
					if (VERBOSE) {
						console.info('	Model : ' + modelIndex);
					}
					const lod = model.lods[requiredLod];
					if (!lod) {
						continue;
					}

					// iterate meshes
					for (let meshIndex = 0; meshIndex < lod.meshes.length; ++meshIndex) {
						const mesh = lod.meshes[meshIndex];
						if (!mesh) {
							continue;
						}
						if (VERBOSE) {
							console.info('		Mesh : ' + meshIndex);
						}

						const msh = modelTest.meshArray[meshIndex];//new SourceModel.MeshTest();
						if (!msh) {
							continue;
						}

						if (!msh.initialized) {
							//msh.setMaterialId(msh.material);
							const vertexOffset = cumulateVertexOffset + msh.vertexoffset; //TODO
							const indices = [];
							for (let stripgroupIndex = 0; stripgroupIndex < mesh.stripGroups.length; ++stripgroupIndex) {
								stripgroup = mesh.stripGroups[stripgroupIndex];
								if (!stripgroup) {
									continue;
								}
								if (VERBOSE) {
									console.info('			Stripgroup : ' + stripgroupIndex + ' index : ' + stripgroup.indexes.length + ' vertices : ' + stripgroup.vertices.length);
								}

								const indexArray = stripgroup.indexes
								const stripVertexArray = stripgroup.vertices

								if (VERBOSE) {
									console.info('Offset : ' + vertexOffset);
								}

								//if (this.drawBodyPart[bodyPartName])
								for (const j of indexArray) {
									const sva = stripVertexArray[j];
									if (!sva) break;
									const i = sva.origMeshVertID + vertexOffset;//TODO: rename variable i
									indices.push(i);
								}
							} // stripgroup

							// reverse triangles from CW to CCW
							for (let i = 0, l = indices.length; i < l; i += 3) {//TODOv3: optimize
								const a: number = indices[i + 1]!;
								indices[i + 1] = indices[i + 2];
								indices[i + 2] = a;
							}

							const geometry = new BufferGeometry();
							geometry.setIndex(new Uint32BufferAttribute(indices, 1, 'index'));
							geometry.setAttribute('aVertexPosition', vertexPosition);
							geometry.setAttribute('aVertexNormal', vertexNormal);
							geometry.setAttribute('aVertexTangent', vertexTangent);
							geometry.setAttribute('aTextureCoord', textureCoord);
							geometry.setAttribute('aBoneWeight', vertexWeights);
							geometry.setAttribute('aBoneIndices', vertexBones);
							geometry.properties.set('materialId', new Property(PropertyType.Number, msh.material));
							geometry.properties.set('materialType', new Property(PropertyType.Number, msh.materialtype));//TODOv3 : setup a better material param
							geometry.properties.set('materialParam', new Property(PropertyType.Number, msh.materialparam));//TODOv3 : setup a better material param
							geometry.properties.set('eyeballArray', new Property(PropertyType.Array, msh.model.eyeballArray));//TODOv3 : setup a better material param

							geometry.count = indices.length;
							geometry.properties.set('name', new Property(PropertyType.String, modelTest.name));


							newSourceModel.addGeometry(msh, geometry, bodyPart.name, modelIndex);
						}
					} // mesh
					cumulateVertexOffset += modelTest.numvertices;
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
