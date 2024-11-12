import { OverrideRepository } from './overriderepository';
import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFilter, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

export class ManifestRepository implements Repository {
	#base: OverrideRepository;
	constructor(base: Repository) {
		this.#base = new OverrideRepository(base);
	}

	get name() {
		return this.#base.name;
	}

	async getFile(filename: string): Promise<RepositoryArrayBufferResponse> {
		return this.#base.getFile(filename);
	}

	async getFileAsText(filename: string): Promise<RepositoryTextResponse> {
		return this.#base.getFileAsText(filename);
	}

	async getFileAsBlob(filename: string): Promise<RepositoryBlobResponse> {
		return this.#base.getFileAsBlob(filename);
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		return this.#base.getFileAsJson(filename);
	}

	async getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse> {
		return this.#base.getFileList(filter);
	}

	async generateModelManifest(name = 'models_manifest.json', filter?: RepositoryFilter): Promise<RepositoryError | null> {
		const response = await this.#base.getFileList(filter);
		if (response.error) {
			return response.error;
		}

		const json = response.root.toJSON();

		this.#base.overrideFile(name, new File([JSON.stringify(json)], name));

		return null;
	}
}
