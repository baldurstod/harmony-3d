import { Source2MaterialLoader } from '../loaders/source2materialloader';
import { Source2Material } from './source2material';

function cleanSource2MaterialName(name: string) {
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

	static removeMaterial(material: Source2Material) {
		this.#materialList2.delete(material);
	}

	static getMaterial(repository: string, fileName: string): Promise<Source2Material> {
		fileName = cleanSource2MaterialName(fileName);
		return this.#getMaterial(repository, fileName);
	}

	static #getMaterial(repository: string, fileName: string): Promise<Source2Material> {
		const material = this.#materialList.get(fileName);
		if (material instanceof Promise) {
			const promise = new Promise<Source2Material>((resolve, reject) => {
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
			const promise = new Promise<Source2Material>((resolve, reject) => {
				Source2MaterialLoader.load(repository, fileName).then(
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
}
