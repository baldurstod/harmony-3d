import { SourceEngineMaterialManager } from '../materials/sourceenginematerialmanager';
import { registerLoader } from '../../../loaders/loaderfactory';
import { KvReader } from './kvreader';
import { DEBUG } from '../../../buildoptions';
import { Repositories } from '../../../repositories/repositories';

class SourceEngineVMTLoaderClass {
	#materials = new Map();
	#extraMaterials = new Map<string, string>();

	load(repositoryName, fileName) {
		//let fullPathName = repository + fileName;
		/*
		const repository = new Repositories().getRepository(repositoryName);
		if (!repository) {
			console.error(`Unknown repository ${repositoryName} in SourceEngineVMTLoader.load`);
			return null;
		}
			*/

		let promise = new Promise(async (resolve, reject) => {
			/*
			const requestCallback = async response => {
				if (response.ok) {
					this.parse(resolve, repositoryName, fileName, await response.text());
				} else {
					reject();
				}
			}
			const requestReject = () => {
				let fileContent = this.#extraMaterials.get(fileName);
				if (fileContent) {
					this.parse(resolve, repositoryName, fileName, fileContent);
				} else {
					reject();
				}
				///() =>
			}
				*/
			//let req = customFetch(new URL(fileName, repository.base)).then(requestCallback, requestReject);
			const response = await new Repositories().getFileAsText(repositoryName, fileName);
			if (!response.error) {
				this.parse(resolve, repositoryName, fileName, response.string);
			} else {
				const fileContent = this.#extraMaterials.get(fileName);
				if (fileContent) {
					this.parse(resolve, repositoryName, fileName, fileContent);
				} else {
					reject();
				}
			}
		});
		return promise;
	}

	parse(resolve, repositoryName, fileName, fileContent) {
		this.#loadMaterial(repositoryName, fileName, fileContent).then(
			(value) => resolve(value)
		)
	}

	#loadMaterial(repositoryName, fileName, file/*, repository, texturesDir*/) {//todov3
		let loadMaterialPromise = new Promise((resolve, reject) => {
			let fileNameRemoveMe = fileName;
			fileName = fileName.replace(/\\/g, '/').toLowerCase().replace(/.vmt$/g, '');
			fileName = fileName.replace(/\\/g, '/').toLowerCase();

			const kv = new KvReader();
			kv.readText(file);

			const vmt = kv.getRootElement();
			if (!vmt) {
				if (DEBUG) {
					console.error('Error while parsing material ' + fileName);
				}
				return null;
			}
			const shaderName = kv.getRootName().toLowerCase();
			let material;
			if (shaderName === 'patch') {
				let include = vmt['include'];
				let insert = vmt['insert'];

				let patchResolve = function (material) {
					for (let insertIndex in insert) {
						material.variables.set(insertIndex, insert[insertIndex]);
						material.parameters[insertIndex] = insert[insertIndex];
					}
					//materialList[fileNameRemoveMe] = material;removeme
					resolve(material);
				};

				let patchReject = function () {
					//TODOv3: handle error
					let rejectionCount = 0;
					let patchResolve2 = function (material) {
						rejectionCount = Infinity;
						patchResolve(material);
					};
					let patchReject2 = function (fileName) {
						if (rejectionCount == 0) {
							reject(fileName);
						}
					};
				}
				let promise = SourceEngineMaterialManager.getMaterial(repositoryName, include);
				promise.then(patchResolve, patchReject);
			} else {
				let materialClass = this.#materials.get(shaderName);
				if (materialClass !== undefined) {
					material = new materialClass(repositoryName, fileName, vmt);
				} else {
					console.error('Unknown material : ' + shaderName);
				}
			}
			if (material) {
				resolve(material);
			}
		});
		return loadMaterialPromise;
	}

	setMaterial(fileName, fileContent) {
		this.#extraMaterials.set(fileName, fileContent);
	}

	registerMaterial(materialName, materialClass) {
		this.#materials.set(materialName.toLowerCase(), materialClass);
	}
}

export const SourceEngineVMTLoader = new SourceEngineVMTLoaderClass();

registerLoader('SourceEngineVMTLoader', SourceEngineVMTLoader);
