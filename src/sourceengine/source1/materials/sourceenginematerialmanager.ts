import { Map2 } from 'harmony-utils';
import { getLoader } from '../../../loaders/loaderfactory';
import { JSONObject } from '../../../types';
import { customFetch } from '../../../utils/customfetch';
import { SourceEngineVMTLoader } from '../export';
import { SourceEngineMaterial } from './sourceenginematerial';

function cleanSource1MaterialName(name: string) {
	name = name.replace(/\\/g, '/').toLowerCase().replace(/.vmt$/g, '').replace(/^materials\//g, '');

	name = name + '.vmt';
	//name = 'materials/' + name;
	return name;
}

export class SourceEngineMaterialManager {
	static #fileListPerRepository = new Map<string, null | JSONObject | Promise<JSONObject>/*TODO: remove alternative*/>(); // TODO: use a Map2
	static #materialList = new Map2<string, string, SourceEngineMaterial | null | Promise<SourceEngineMaterial | null>/*TODO: remove alternative*/>();
	static #materialList2 = new Set<SourceEngineMaterial>();
	static #materialListPerRepository = {};
	static fallbackRepository = '';

	static async getMaterial(repository: string, path: string, searchPaths?: string[]): Promise<SourceEngineMaterial | null> {
		// TODO: improve this function code
		path = cleanSource1MaterialName(path);
		if (searchPaths) {
			const promises: Promise<SourceEngineMaterial | null>[] = [];
			for (const searchPath of searchPaths) {
				promises.push(this.#getMaterial(repository, 'materials/' + searchPath + path));
			}
			const promise = new Promise<SourceEngineMaterial | null>(resolve => {
				Promise.allSettled(promises).then(
					async (promises) => {
						for (const promise of promises) {
							const value = (promise as PromiseFulfilledResult<SourceEngineMaterial | null>).value;
							if (value) {
								resolve(value);
								return;
							}
						}
						//resolve(this.#getMaterial(repository, 'materials/' + path));
						const material = await this.#getMaterial(repository, 'materials/' + path);
						if (material) {
							resolve(material);
						}
						if (this.fallbackRepository && this.fallbackRepository != repository) {
							resolve(this.getMaterial(this.fallbackRepository, path, searchPaths));
						}
						resolve(null);
					}
				)
			});
			return promise;
		} else {
			const material = await this.#getMaterial(repository, 'materials/' + path);
			if (material) {
				return material;
			}
			if (this.fallbackRepository && this.fallbackRepository != repository) {
				return this.getMaterial(this.fallbackRepository, path, searchPaths);
			}
			return null;
		}
	}

	static #getMaterial(repository: string, path: string): Promise<SourceEngineMaterial | null> {
		const material = this.#materialList.get(repository, path);

		if (material instanceof Promise) {
			const promise = new Promise<SourceEngineMaterial | null>(resolve => {
				material.then((material) => {
					if (!material) {
						resolve(material);
						return;
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
			if (!material) {
				return new Promise(resolve => {
					resolve(material);
				});
			}
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
							return;
						}
						this.#materialList.set(repository, path, material);
						const newMaterial = material.clone();
						newMaterial.init();
						this.#materialList2.add(newMaterial);
						resolve(newMaterial);
					}
				).catch(
					(value) => resolve(value)
				);
			});
			this.#materialList.set(repository, path, promise);
			return promise;
		}
	}

	/*
	static async copyMaterial(repository:string, sourcePath:string, destPath:string, searchPaths?: string[]) {
		const material: SourceEngineMaterial = await this.getMaterial(repository, sourcePath, searchPaths);
		this.#materialList.set(destPath, material.clone());
		material.init();
	}
	*/

	static addRepository(repository: string) {
		this.#fileListPerRepository.set(repository, null);
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
