import { TESTING } from '../buildoptions';
import { ConcreteMaterial, Material } from './material';

export class MaterialManager {
	static #materials = new Map<string, { materialClass: ConcreteMaterial, manager: any/*TODO: better type*/ }>();

	static registerMaterial(materialName: string, materialClass: ConcreteMaterial, manager: any/*TODO: better type*/): void {
		if (TESTING) {
			if (!materialName) {
				throw new Error('Missing material name');
			}
			if (!materialClass) {
				throw new Error('Missing material class');
			}
			if (manager) {
				throw new Error('Remove this parameter');
			}
		}
		this.#materials.set(materialName, { materialClass: materialClass, manager: manager });
	}

	static getMaterial(materialName: string, callback: (material: Material) => void): void {
		const material = this.#materials.get(materialName);
		if (material) {
			const manager = material.manager;
			const materialClass = material.materialClass
			if (manager) {
				//manager.pickMaterial(materialName, materialClass, callback);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				callback(new (materialClass as any/* We cast the type cause Material is abstract. However the actual class is guaranteed to be concrete */));
			}
		}
	}

	static getMaterialList(): MapIterator<string> {
		return this.#materials.keys();
	}
}
