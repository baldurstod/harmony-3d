import { DEBUG } from '../../../buildoptions';
import { registerLoader } from '../../../loaders/loaderfactory';
import { Repositories } from '../../../repositories/repositories';
import { Source1Material } from '../materials/source1material';
import { Source1MaterialManager } from '../materials/source1materialmanager';
import { KvReader } from './kvreader';

class Source1VmtLoaderClass {// TODO: improve singleton
	#materials = new Map<string, typeof Source1Material>();
	#extraMaterials = new Map<string, string>();//TODO: this is used for maps create a map repo instead

	async load(repository: string, path: string): Promise<Source1Material | null> {
		const response = await Repositories.getFileAsText(repository, path);
		if (!response.error) {
			return this.parse(repository, path, response.text!);
		} else {
			const fileContent = this.#extraMaterials.get(path);
			if (fileContent) {
				return this.parse(repository, path, fileContent);
			}
		}
		return null;
	}

	async parse(repository: string, path: string, content: string): Promise<Source1Material | null> {
		path = path.replace(/(\/)+/g, '/').replace(/(\\)+/g, '/').toLowerCase();

		const kv = new KvReader();
		kv.readText(content);

		const vmt = kv.getRootElement();
		if (!vmt) {
			if (DEBUG) {
				console.error('Error while parsing material ' + path);
			}
			return null;
		}

		const shaderName = kv.getRootName().toLowerCase();
		let material: Source1Material | null = null;

		if (shaderName === 'patch') {
			//TODO: check patch

			const include = vmt['include'];
			const insert = vmt['insert'];

			const material = await Source1MaterialManager.getMaterial(repository, include);
			if (material) {
				for (const insertIndex in insert) {
					material.variables.set(insertIndex, insert[insertIndex]);
					throw 'material.parameters[insertIndex] = insert[insertIndex];'
				}
			}
			//materialList[fileNameRemoveMe] = material;removeme
			return (material);

			//promise.then(patchResolve);
		} else {
			const materialClass = this.#materials.get(shaderName);
			if (materialClass) {
				material = new materialClass(repository, path, vmt);
			} else {
				console.error('Unknown material : ' + shaderName);
			}
		}
		return material;
	}

	setMaterial(fileName: string, fileContent: string) {
		this.#extraMaterials.set(fileName, fileContent);
	}

	registerMaterial(materialName: string, materialClass: typeof Source1Material) {
		this.#materials.set(materialName.toLowerCase(), materialClass);
	}
}

export const Source1VmtLoader = new Source1VmtLoaderClass();

registerLoader('Source1VmtLoader', Source1VmtLoader);
