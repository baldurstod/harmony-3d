import { TESTING } from '../buildoptions';

export class MaterialManager {
	static #materials = new Map();

	static registerMaterial(materialName, materialClass, manager) {
		if (TESTING) {
			if (!materialName) {
				throw 'Missing material name';
			}
			if (!materialClass) {
				throw 'Missing material class';
			}
		}
		this.#materials.set(materialName, {materialClass:materialClass, manager:manager});
	}

	static getMaterial(materialName, callback) {
		let material = this.#materials.get(materialName);
		if (material) {
			let manager = material.manager;
			let materialClass = material.materialClass
			if (manager) {
				manager.pickMaterial(materialName, materialClass, callback);
			} else {
				callback(new materialClass);
			}
		}
	}

	static getMaterialList() {
		return this.#materials.keys();
	}
}
