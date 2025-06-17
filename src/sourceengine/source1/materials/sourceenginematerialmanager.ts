import { getLoader } from '../../../loaders/loaderfactory';
import { JSONObject } from '../../../types';
import { customFetch } from '../../../utils/customfetch';
import { SourceEngineMaterial } from './sourceenginematerial';

function cleanSource1MaterialName(name) {
	name = name.replace(/\\/g, '/').toLowerCase().replace(/.vmt$/g, '').replace(/^materials\//g, '');

	name = name + '.vmt';
	//name = 'materials/' + name;
	return name;
}

export class SourceEngineMaterialManager {
	static #fileListPerRepository = new Map<string, JSONObject | Promise<JSONObject>/*TODO: remove alternative*/>();
	static #materialList = new Map<string, SourceEngineMaterial | Promise<SourceEngineMaterial>/*TODO: remove alternative*/>();
	static #materialList2 = new Set<SourceEngineMaterial>();
	static #materialListPerRepository = {};

	static getMaterial(repositoryName, fileName, searchPaths?): Promise<SourceEngineMaterial> {
		fileName = cleanSource1MaterialName(fileName);
		if (searchPaths) {
			const promises = [];
			for (const searchPath of searchPaths) {
				promises.push(this.#getMaterial(repositoryName, 'materials/' + searchPath + fileName));
			}
			const promise = new Promise<SourceEngineMaterial>((resolve, reject) => {
				Promise.allSettled(promises).then(
					(promises) => {
						for (const promise of promises) {
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
		const material = this.#materialList.get(fileName);
		if (material instanceof Promise) {
			const promise = new Promise<SourceEngineMaterial>((resolve, reject) => {
				material.then((material) => {
					const newMaterial = material.clone();
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
				const newMaterial = material.clone();
				this.#materialList2.add(newMaterial);
				resolve(newMaterial);
			});
		} else {
			const promise = new Promise<SourceEngineMaterial>((resolve, reject) => {
				const vmtLoader = getLoader('SourceEngineVMTLoader');
				vmtLoader.load(repositoryName, fileName).then(
					(material) => {
						this.#materialList.set(fileName, material);
						const newMaterial = material.clone();
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
		const material: SourceEngineMaterial = await this.getMaterial(repositoryName, sourcePath, searchPaths);
		this.#materialList.set(destPath, material.clone());
	}

	static addRepository(repositoryPath) {
		this.#fileListPerRepository.set(repositoryPath, null);
	}

	static async getMaterialList() {
		const repoList = [];
		for (let [repositoryName, repository] of this.#fileListPerRepository) {
			console.error(repositoryName, repository);
			if (repository == null) {
				repository = new Promise<JSONObject>(async resolve => {
					try {
						const manifestUrl = repositoryName + 'materials_manifest.json';//todo variable
						const response = await customFetch(manifestUrl);
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
