import { Source2MaterialLoader } from '../loaders/source2materialloader';
import { Source2Material } from './source2material';

function cleanSource2MaterialName(name) {
	name = name.replace(/\\/g, '/').toLowerCase().replace(/.vmat_c$/g, '').replace(/.vmat$/g, '');
	name = name + '.vmat_c';
	return name;
}

export class Source2MaterialManager {
	static #materialList = new Map<string, Source2Material | Promise<Source2Material>>();
	static #materialList2 = new Set<Source2Material>();

	static addMaterial(material: Source2Material) {
		this.#materialList2.add(material);
	}

	static removeMaterial(material) {
		this.#materialList2.delete(material);
	}

	static getMaterial(repository, fileName, searchPaths?): Promise<Source2Material> {
		console.assert(searchPaths == null, 'searchPaths must be null');//TODOv3 remove searchPaths
		fileName = cleanSource2MaterialName(fileName);
		if (searchPaths) {
			let promises = [];
			for (let searchPath of searchPaths) {
				promises.push(this.#getMaterial(repository, 'materials/' + searchPath + fileName));
			}
			let promise = new Promise<Source2Material>(resolve => {
				Promise.allSettled(promises).then(
					(promises) => {
						for (let promise of promises) {
							if (promise.status == 'fulfilled') {
								resolve(promise.value);
							}
						}
						resolve(null);
					}
				)
			});
			return promise;
		} else {
			return this.#getMaterial(repository, fileName);
		}
	}

	static #getMaterial(repository, fileName): Promise<Source2Material> {
		let material = this.#materialList.get(fileName);
		if (material instanceof Promise) {
			let promise = new Promise<Source2Material>((resolve, reject) => {
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
			let promise = new Promise<Source2Material>((resolve, reject) => {
				Source2MaterialLoader.load(repository, fileName).then(
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
}
