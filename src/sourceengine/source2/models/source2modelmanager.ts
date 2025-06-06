import { Repositories } from '../../../repositories/repositories';
import { customFetch } from '../../../utils/customfetch';
import { FileSelectorFile } from '../../../utils/fileselector/file';
import { Source2ModelLoader } from '../loaders/source2modelloader'

export class Source2ModelManager {
	static #modelListPerRepository = {};
	static #modelsPerRepository = {};
	static #modelList = new Map();
	static instances = new Set();

	static async #createModel(repositoryName, fileName) {
		if (!fileName) {
			return;
		}
		fileName = fileName.replace(/.vmdl_c$/, '').replace(/.vmdl$/, '');
		/*let fullPath = repository + fileName;
		let model = this.#modelList.get(fullPath);*/

		let model = this.#getModel(repositoryName, fileName);
		if (model) {
			return model;
		}

		model = await new Source2ModelLoader().load(repositoryName, fileName);
		if (model) {
			this.#modelsPerRepository[repositoryName][fileName] = model;
		} else {
			console.error('Model not found', repositoryName, fileName);
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

	static #getModel(repositoryName, fileName) {
		if (!this.#modelsPerRepository[repositoryName]) {
			this.#modelsPerRepository[repositoryName] = {};
		}
		return this.#modelsPerRepository[repositoryName][fileName];
	}

	static async createInstance(repository, fileName, dynamic) {
		if (!repository) {
			//try to get repository from filename
			for (let repo in this.#modelListPerRepository) {
				if (fileName.startsWith(repo)) {
					repository = repo;
					fileName = fileName.replace(repo, '');
					break;
				}
			}
		}
		let model = await this.#createModel(repository, fileName);
		if (model) {
			let instance = model.createInstance(dynamic);
			return instance;
		}
		return null;
	}

	static async loadManifest(repositoryName) {
		const modelList = this.#modelListPerRepository[repositoryName];

		if (modelList === undefined) {
			this.#modelListPerRepository[repositoryName] = null;
		}
	}

	static async getModelList(): Promise<FileSelectorFile> {
		const repoList = [];
		let modelListPerRepository = this.#modelListPerRepository;
		for (let repositoryName in modelListPerRepository) {
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
				repoList.push({ name: repositoryName, files: [repo] });
			}
		}
		return { name: '', path: '', files: repoList };
	}
}
