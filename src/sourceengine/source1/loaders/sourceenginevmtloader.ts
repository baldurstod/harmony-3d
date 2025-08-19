import { DEBUG } from '../../../buildoptions';
import { registerLoader } from '../../../loaders/loaderfactory';
import { Repositories } from '../../../repositories/repositories';
import { SourceEngineMaterial } from '../materials/sourceenginematerial';
import { SourceEngineMaterialManager } from '../materials/sourceenginematerialmanager';
import { KvReader } from './kvreader';

class SourceEngineVMTLoaderClass {
	#materials = new Map<string, typeof SourceEngineMaterial>();
	#extraMaterials = new Map<string, string>();//TODO: this is used for maps create a map repo instead

	async load(repository: string, path: string): Promise<SourceEngineMaterial | null> {
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

	async parse(repository: string, path: string, content: string): Promise<SourceEngineMaterial | null> {
		path = path.replace(/\\/g, '/').toLowerCase().replace(/\.vmt$/g, '');
		path = path.replace(/\\/g, '/').toLowerCase();

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
		let material: SourceEngineMaterial | null = null;

		if (shaderName === 'patch') {
			//TODO: check patch

			const include = vmt['include'];
			const insert = vmt['insert'];

			const material = await SourceEngineMaterialManager.getMaterial(repository, include);
			if (material) {
				for (const insertIndex in insert) {
					material.variables.set(insertIndex, insert[insertIndex]);
					material.parameters[insertIndex] = insert[insertIndex];
				}
			}
			//materialList[fileNameRemoveMe] = material;removeme
			return (material);

			//promise.then(patchResolve);
		} else {
			const materialClass = this.#materials.get(shaderName);
			if (materialClass) {
				vmt.repository = repository;
				vmt.filename = path;
				material = new materialClass(vmt);
			} else {
				console.error('Unknown material : ' + shaderName);
			}
		}
		return material;
	}

	setMaterial(fileName: string, fileContent: string) {
		this.#extraMaterials.set(fileName, fileContent);
	}

	registerMaterial(materialName: string, materialClass: typeof SourceEngineMaterial) {
		this.#materials.set(materialName.toLowerCase(), materialClass);
	}
}

export const SourceEngineVMTLoader = new SourceEngineVMTLoaderClass();

registerLoader('SourceEngineVMTLoader', SourceEngineVMTLoader);
