import { Map2 } from 'harmony-utils';
import { getLoader } from '../../../loaders/loaderfactory';
import { Repositories } from '../../../repositories/repositories';
import { FileSelectorFile } from '../../../utils/fileselector/file';
import { ModelLoader, Source1ModelInstance } from '../export';
import { SourceModel } from '../loaders/sourcemodel';

export class Source1ModelManager {
	static #modelListPerRepository = new Map<string, any>();
	static #modelsPerRepository = new Map2<string, string, Promise<SourceModel | null>>();

	static async #createModel(repositoryName: string, fileName: string): Promise<SourceModel | null> {
		let promise = this.#modelsPerRepository.get(repositoryName, fileName);
		if (promise) {
			return promise;
		}

		let loadedResolve: (value: SourceModel | null) => void;
		promise = new Promise<SourceModel | null>(resolve => loadedResolve = resolve);
		this.#modelsPerRepository.set(repositoryName, fileName, promise);

		const modelLoader = getLoader('ModelLoader') as typeof ModelLoader;
		let model = await new modelLoader().load(repositoryName, fileName);
		loadedResolve!/*assigned during promise creation*/(model);

		return model;
	}

	static async createInstance(repository: string, fileName: string, dynamic: boolean, preventInit = false): Promise<Source1ModelInstance | null> {
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
		const model = await this.#createModel(repository, fileName);
		if (model) {
			const instance = model.createInstance(dynamic, preventInit);
			return instance;
		}
		return null;
	}

	static loadManifest(repositoryName: string): void {
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
