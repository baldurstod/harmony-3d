import { VERBOSE } from '../../../buildoptions';
import { Source2Material } from '../materials/source2material';
import { Source2File } from './source2file';
import { Source2FileLoader } from './source2fileloader';


export class Source2MaterialLoader {
	static #materials = new Map<string, typeof Source2Material>();

	static async load(repository: string, path: string): Promise<Source2Material | null> {
		// TODO: use cleanSource2MaterialName
		path = path.replace(/\.vmat_c$/, '');
		const source2File = await new Source2FileLoader().load(repository, path + '.vmat_c') as (Source2File | null);
		if (!source2File) {
			return null;
		}
		const material = this.#loadMaterial(repository, source2File);
		if (VERBOSE) {
			console.log(source2File);
		}
		return material;
	}

	static async #loadMaterial(repository: string, file: Source2File): Promise<Source2Material | null> {
		//TODO: use getMaterialResourceData()
		const shaderName = file.getBlockStructAsString('DATA', 'm_shaderName') ?? file.getBlockStructAsString('DATA', 'MaterialResourceData_t.m_shaderName');// || file.getBlockStruct('DATA.structs.MaterialResourceData_t.m_shaderName');
		if (shaderName === null) {
			return null;
		}
		let material: Source2Material | null = null;
		const materialClass = this.#materials.get(shaderName.toLowerCase());
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
