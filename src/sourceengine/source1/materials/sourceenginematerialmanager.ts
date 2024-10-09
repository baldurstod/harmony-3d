import { getLoader } from '../../../loaders/loaderfactory';
import { customFetch } from '../../../utils/customfetch';
import { SourceEngineMaterial } from './sourceenginematerial';

function cleanSource1MaterialName(name) {
	name = name.replace(/\\/g, '/').toLowerCase().replace(/.vmt$/g, '').replace(/^materials\//g, '');

	name = name + '.vmt';
	//name = 'materials/' + name;
	return name;
}

export class SourceEngineMaterialManager {
	static #fileListPerRepository = new Map();
	static #materialList = new Map();
	static #materialList2 = new Set();
	static #materialListPerRepository = {};

	static getMaterial(repositoryName, fileName, searchPaths?): Promise<SourceEngineMaterial> {
		fileName = cleanSource1MaterialName(fileName);
		if (searchPaths) {
			let promises = [];
			for (let searchPath of searchPaths) {
				promises.push(this.#getMaterial(repositoryName, 'materials/' + searchPath + fileName));
			}
			let promise = new Promise<SourceEngineMaterial>((resolve, reject) => {
				Promise.allSettled(promises).then(
					(promises) => {
						for (let promise of promises) {
							if (promise.status == 'fulfilled') {
								resolve(promise.value);
								return;
							}
						}
						this.#getMaterial(repositoryName, 'materials/' + fileName).then(
							(material) => resolve(material),
							() => reject(null)
						);
					}
				)
			});
			return promise;
		} else {
			return this.#getMaterial(repositoryName, 'materials/' + fileName);
		}
	}

	static #getMaterial(repositoryName, fileName): Promise<SourceEngineMaterial> {
		let material = this.#materialList.get(fileName);
		if (material instanceof Promise) {
			let promise = new Promise<SourceEngineMaterial>((resolve, reject) => {
				material.then((material) => {
					let newMaterial = material.clone();
					this.#materialList2.add(newMaterial);
					resolve(newMaterial);
				}
				).catch(
					(value) => reject(value)
				);
			});
			return promise;
		}

		if (material !== undefined) {
			return new Promise((resolve, reject) => {
				let newMaterial = material.clone();
				this.#materialList2.add(newMaterial);
				resolve(newMaterial);
			});
		} else {
			let promise = new Promise<SourceEngineMaterial>((resolve, reject) => {
				let vmtLoader = getLoader('SourceEngineVMTLoader');
				vmtLoader.load(repositoryName, fileName).then(
					(material) => {
						this.#materialList.set(fileName, material);
						let newMaterial = material.clone();
						this.#materialList2.add(newMaterial);
						resolve(newMaterial);
					}
				).catch(
					(value) => reject(value)
				);
			});
			this.#materialList.set(fileName, promise);
			return promise;
		}
	}

	static async copyMaterial(repositoryName, sourcePath, destPath, searchPaths) {
		let material: SourceEngineMaterial = await this.getMaterial(repositoryName, sourcePath, searchPaths);
		this.#materialList.set(destPath, material.clone());
	}

	static addRepository(repositoryPath) {
		this.#fileListPerRepository.set(repositoryPath, null);
	}

	/*async pickMaterial(materialName, materialClass, callback) {
		//Note: if loaded from a vmt, you are not guaranted to have this exact materialClass
		console.log(await this.getMaterialList());
		show(SceneExplorer.htmlFileSelector);


		Interaction.selectFile(SceneExplorer.htmlFileSelector, await this.getMaterialList(), async (repository, materialName) => {
			console.error(materialName);
			let material = await this.getMaterial(repository, materialName.replace(/^materials\//g, ''));
			console.error(material);
			callback(material);
		});
	}*/

	static async getMaterialList() {
		let repoList = [];
		for (let [repositoryName, repository] of this.#fileListPerRepository) {
			console.error(repositoryName, repository);
			if (repository == null) {
				repository = new Promise(async resolve => {
					try {
						let manifestUrl = repositoryName + 'materials_manifest.json';//todo variable
						let response = await customFetch(manifestUrl);
						resolve(await response.json());
					} catch (e) {
						resolve({ files: [] });
					}
				});
				this.#fileListPerRepository.set(repositoryName, repository);
			}
			repoList.push({ name: repositoryName, files: [await repository] });
		}
		return { files: repoList };
	}
}
