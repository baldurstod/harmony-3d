import { getLoader } from '../../../loaders/loaderfactory';
import { Repositories } from '../../../repositories/repositories';
import { FileSelectorFile } from '../../../utils/fileselector/file';
import { SourceModel } from '../loaders/sourcemodel';

export class Source1ModelManager {
	static #modelListPerRepository: Map<string, any> = new Map();
	static #modelsPerRepository: Map<string, Map<string, SourceModel>> = new Map();

	static async #createModel(repositoryName: string, fileName: string) {
		let model = this.#getModel(repositoryName, fileName);
		if (model) {
			return model;
		}

		const modelLoader = getLoader('ModelLoader');
		model = await new modelLoader().load(repositoryName, fileName);
		if (model) {
			this.#modelsPerRepository.get(repositoryName)?.set(fileName, model);
		}

		return model;
	}

	static #getModel(repositoryName: string, fileName: string) {
		if (!this.#modelsPerRepository.has(repositoryName)) {
			this.#modelsPerRepository.set(repositoryName, new Map<string, SourceModel>());
		}
		return this.#modelsPerRepository.get(repositoryName)?.get(fileName);
	}

	static async createInstance(repository: string, fileName: string, dynamic: boolean, preventInit = false) {
		if (!repository) {
			//try to get repository from filename
			for (const [repo] of this.#modelListPerRepository) {
				if (fileName.startsWith(repo)) {
					repository = repo;
					fileName = fileName.replace(repo, '');
					break;
				}
			}
		}
		let model = await this.#createModel(repository, fileName);
		if (model) {
			let instance = model.createInstance(dynamic, preventInit);
			return instance;
		}
		return null;
	}

	static loadManifest(repositoryName: string) {
		if (!this.#modelListPerRepository.has(repositoryName)) {
			this.#modelListPerRepository.set(repositoryName, null);
		}
	}

	static async getModelList(): Promise<FileSelectorFile> {
		const repoList = [];
		for (const [repositoryName, repo] of this.#modelListPerRepository) {
			if (repo === null) {
				const response = await Repositories.getFileAsJson(repositoryName, 'models_manifest.json');
				if (!response.error) {
					this.#modelListPerRepository.set(repositoryName, response.json);
					repoList.push({ name: repositoryName, files: [response.json] });
				}
			} else {
				repoList.push({ name: repositoryName, files: [repo] });
			}
		}
		return { name: '', path: '', files: repoList };
	}
}
