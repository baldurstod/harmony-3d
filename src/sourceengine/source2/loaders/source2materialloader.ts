import { Source2FileLoader } from './source2fileloader';
import { VERBOSE } from '../../../buildoptions';
import { Source2File } from './source2file';
import { Source2Material } from '../materials/source2material';


export class Source2MaterialLoader {
	static #materials = new Map<string, typeof Source2Material>();

	static load(repository: string, fileName: string): Promise<Source2Material> {
		let promise = new Promise<Source2Material>((resolve, reject) => {
			fileName = fileName.replace(/.vmat_c$/, '');
			let vmatPromise = new Source2FileLoader().load(repository, fileName + '.vmat_c');
			vmatPromise.then(
				(source2File) => {
					let material = this.#loadMaterial(repository, source2File);
					if (VERBOSE) {
						console.log(source2File);
					}
					if (material) {
						resolve(material);
					} else {
						reject(source2File);
					}
				}
			).catch(
				(error) => reject(error)
			)
		});
		return promise;
	}

	static #loadMaterial(repository: string, file: Source2File) {
		let shaderName = file.getBlockStruct('DATA.keyValue.root.m_shaderName') || file.getBlockStruct('DATA.structs.MaterialResourceData_t.m_shaderName');
		let material;
		let materialClass = this.#materials.get(shaderName.toLowerCase());
		if (materialClass !== undefined) {
			material = new materialClass(repository, file);
		} else {
			console.error(`Unknown material : ${shaderName} in ${file.fileName}`);
		}
		return material;
	}

	static registerMaterial(materialName: string, materialClass: typeof Source2Material) {
		this.#materials.set(materialName.toLowerCase(), materialClass);
	}
}
