import { TESTING } from '../buildoptions';
import { Material } from './material';

export class MaterialManager {
	static #materials = new Map<string, { materialClass: typeof Material, manager: any/*TODO: better type*/ }>();

	static registerMaterial(materialName: string, materialClass: typeof Material, manager: any/*TODO: better type*/) {
		if (TESTING) {
			if (!materialName) {
				throw 'Missing material name';
			}
			if (!materialClass) {
				throw 'Missing material class';
			}
			if (manager) {
				throw 'Remove this parameter';
			}
		}
		this.#materials.set(materialName, { materialClass: materialClass, manager: manager });
	}

	static getMaterial(materialName: string, callback: (material: Material) => void) {
		const material = this.#materials.get(materialName);
		if (material) {
			const manager = material.manager;
			const materialClass = material.materialClass
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
