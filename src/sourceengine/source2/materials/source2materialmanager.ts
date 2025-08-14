import { Source2MaterialLoader } from '../loaders/source2materialloader';
import { Source2Material } from './source2material';

function cleanSource2MaterialName(name: string) {
	name = name.replace(/\\/g, '/').toLowerCase().replace(/\.vmat_c$/, '').replace(/\.vmat$/, '');
	name = name + '.vmat_c';
	return name;
}

export class Source2MaterialManager {
	static #materialList = new Map<string, Source2Material | Promise<Source2Material | null>>();
	static #materialList2 = new Set<Source2Material>();

	static addMaterial(material: Source2Material) {
		this.#materialList2.add(material);
	}

	static removeMaterial(material: Source2Material) {
		this.#materialList2.delete(material);
	}

	static getMaterial(repository: string, path: string): Promise<Source2Material | null> {
		path = cleanSource2MaterialName(path);
		return this.#getMaterial(repository, path);
	}

	static #getMaterial(repository: string, path: string): Promise<Source2Material | null> {
		const material = this.#materialList.get(path);
		if (material instanceof Promise) {
			const promise = new Promise<Source2Material | null>(resolve => {
				material.then(material => {
					if (!material) {
						resolve(material);
					} else {
						const newMaterial = material.clone();
						this.#materialList2.add(newMaterial);
						resolve(newMaterial);
					}
				});
			});
			return promise;
		}

		if (material !== undefined) {
			return new Promise(resolve => {
				const newMaterial = material.clone();
				this.#materialList2.add(newMaterial);
				resolve(newMaterial);
			});
		} else {
			const promise = new Promise<Source2Material | null>(resolve => {
				Source2MaterialLoader.load(repository, path).then(
					(material: Source2Material | null) => {
						if (!material) {
							resolve(material);
							return;
						}

						this.#materialList.set(path, material);
						const newMaterial = material.clone();
						this.#materialList2.add(newMaterial);
						resolve(newMaterial);
					}
				);
			});
			this.#materialList.set(path, promise);
			return promise;
		}
	}
}
