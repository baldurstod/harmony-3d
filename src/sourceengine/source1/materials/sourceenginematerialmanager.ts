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
	static #materialList = new Map<string, SourceEngineMaterial | null | Promise<SourceEngineMaterial | null>/*TODO: remove alternative*/>();// TODO: use a Map2
	static #materialList2 = new Set<SourceEngineMaterial>();
	static #materialListPerRepository = {};

	static getMaterial(repository: string, path: string, searchPaths?: string[]): Promise<SourceEngineMaterial | null> {
		path = cleanSource1MaterialName(path);
		if (searchPaths) {
			const promises: Promise<SourceEngineMaterial | null>[] = [];
			for (const searchPath of searchPaths) {
				promises.push(this.#getMaterial(repository, 'materials/' + searchPath + path));
			}
			const promise = new Promise<SourceEngineMaterial | null>(resolve => {
				Promise.allSettled(promises).then(
					(promises) => {
						for (const promise of promises) {
							const value = (promise as PromiseFulfilledResult<SourceEngineMaterial | null>).value;
							if (value) {
								resolve(value);
								return;
							}
						}
						resolve(this.#getMaterial(repository, 'materials/' + path));
					}
				)
			});
			return promise;
		} else {
			return this.#getMaterial(repository, 'materials/' + path);
		}
	}

	static #getMaterial(repository: string, path: string): Promise<SourceEngineMaterial | null> {
		const material = this.#materialList.get(path);

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
