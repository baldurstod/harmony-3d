import { Repositories } from '../../../repositories/repositories';
import { FileSelectorFile } from '../../../utils/fileselector/file';
import { Source2ModelLoader } from '../loaders/source2modelloader';
import { Source2Model } from './source2model';
import { Source2ModelInstance } from './source2modelinstance';

export class Source2ModelManager {
	static #modelListPerRepository: Record<string, JSON | null | undefined/*TODO: improve type*/> = {};//TODO: use a map
	static #modelsPerRepository: Record<string, Record<string, Source2Model>> = {};//TODO: use a map2
	static #modelList = new Map();
	static instances = new Set();

	static async #createModel(repository: string, path: string): Promise<Source2Model | null> {
		path = path.replace(/\.vmdl_c$/, '').replace(/\.vmdl$/, '');
		/*let fullPath = repository + fileName;
		let model = this.#modelList.get(fullPath);*/

		let model = this.#getModel(repository, path);
		if (model) {
			return model;
		}

		model = new Source2ModelLoader().load(repository, path);
		if (model) {
			this.#modelsPerRepository[repository]![path] = model;
		} else {
			console.error('Model not found', repository, path);
		}
		return model;

		/*if (model) {
			return model;
		} else {
			model = await new Source2ModelLoader().load(repository, fileName);
			if (model) {
				this.#modelList.set(fullPath, model);
				return model;
			} else {
				console.error(`Model not found : ${fullPath}`);
			}
		}*/
	}

	static #getModel(repository: string, path: string): Source2Model | null {
		if (!this.#modelsPerRepository[repository]) {
			this.#modelsPerRepository[repository] = {};
		}
		return this.#modelsPerRepository[repository][path] ?? null;
	}

	static async createInstance(repository: string, fileName: string, dynamic: boolean): Promise<Source2ModelInstance | null> {
		if (!repository) {
			//try to get repository from filename
			for (const repo in this.#modelListPerRepository) {
				if (fileName.startsWith(repo)) {
					repository = repo;
					fileName = fileName.replace(repo, '');
					break;
				}
			}
		}
		const model = await this.#createModel(repository, fileName);
		if (model) {
			const instance = model.createInstance(dynamic);
			return instance;
		}
		return null;
	}

	static loadManifest(repository: string): void {
		const modelList = this.#modelListPerRepository[repository];

		if (modelList === undefined) {
			this.#modelListPerRepository[repository] = null;
		}
	}

	static async getModelList(): Promise<FileSelectorFile> {
		const repoList: FileSelectorFile[] = [];
		const modelListPerRepository = this.#modelListPerRepository;
		for (const repositoryName in modelListPerRepository) {
			let repo = modelListPerRepository[repositoryName];
			if (repo === null) {
				//let response = await customFetch(new URL('models_manifest.json', repository.base));//todo variable
				//repo = await response.json();
				const response = await Repositories.getFileAsJson(repositoryName, 'models_manifest.json');//todo variable
				if (!response.error) {
					this.#modelListPerRepository[repositoryName] = response.json;
					repo = response.json;
				}
			}

			if (repo) {
				repoList.push({ name: repositoryName, files: [repo as unknown as FileSelectorFile] });
			}
		}
		return { name: '', path: '', files: repoList };
	}
}
