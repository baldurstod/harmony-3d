import { getLoader } from '../../../loaders/loaderfactory';
import { JSONObject } from '../../../types';
import { customFetch } from '../../../utils/customfetch';
import { SourceEngineVMTLoader } from '../export';
import { SourceEngineMaterial } from './sourceenginematerial';

function cleanSource1MaterialName(name) {
	name = name.replace(/\\/g, '/').toLowerCase().replace(/.vmt$/g, '').replace(/^materials\//g, '');

	name = name + '.vmt';
	//name = 'materials/' + name;
	return name;
}

export class SourceEngineMaterialManager {
	static #fileListPerRepository = new Map<string, JSONObject | Promise<JSONObject>/*TODO: remove alternative*/>(); // TODO: use a Map2
	static #materialList = new Map<string, SourceEngineMaterial | Promise<SourceEngineMaterial>/*TODO: remove alternative*/>();// TODO: use a Map2
	static #materialList2 = new Set<SourceEngineMaterial>();
	static #materialListPerRepository = {};

	static getMaterial(repositoryName, fileName, searchPaths?): Promise<SourceEngineMaterial | null> {
		fileName = cleanSource1MaterialName(fileName);
		if (searchPaths) {
			const promises = [];
			for (const searchPath of searchPaths) {
				promises.push(this.#getMaterial(repositoryName, 'materials/' + searchPath + fileName));
			}
			const promise = new Promise<SourceEngineMaterial>((resolve) => {
				Promise.allSettled(promises).then(
					(promises) => {
						for (const promise of promises) {
							if (promise.status == 'fulfilled') {
								resolve(promise.value);
								return;
							}
						}
						this.#getMaterial(repositoryName, 'materials/' + fileName).then(
							material => resolve(material),
						);
					}
				)
			});
			return promise;
		} else {
			return this.#getMaterial(repositoryName, 'materials/' + fileName);
		}
	}

	static #getMaterial(repository: string, path: string): Promise<SourceEngineMaterial | null> {
		const material = this.#materialList.get(path);

		if (material instanceof Promise) {
			const promise = new Promise<SourceEngineMaterial>(resolve => {
				material.then((material) => {
					if (!material) {
						resolve(material);
					}
					const newMaterial = material.clone();
					newMaterial.init();
					this.#materialList2.add(newMaterial);
					resolve(newMaterial);
				});
			});
			return promise;
		}

		if (material !== undefined) {
			return new Promise(resolve => {
				const newMaterial = material.clone();
				newMaterial.init();
				this.#materialList2.add(newMaterial);
				resolve(newMaterial);
			});
		} else {
			const promise = new Promise<SourceEngineMaterial | null>(resolve => {
				const vmtLoader = getLoader('SourceEngineVMTLoader') as typeof SourceEngineVMTLoader;
				vmtLoader.load(repository, path).then(
					(material) => {
						if (!material) {
							resolve(material);
						}
						this.#materialList.set(path, material);
						const newMaterial = material.clone();
						newMaterial.init();
						this.#materialList2.add(newMaterial);
						resolve(newMaterial);
					}
				).catch(
					(value) => resolve(value)
				);
			});
			this.#materialList.set(path, promise);
			return promise;
		}
	}

	static async copyMaterial(repositoryName, sourcePath, destPath, searchPaths) {
		const material: SourceEngineMaterial = await this.getMaterial(repositoryName, sourcePath, searchPaths);
		this.#materialList.set(destPath, material.clone());
		material.init();
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
