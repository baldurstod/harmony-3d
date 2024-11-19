import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFilter, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

export class MergeRepository implements Repository {
	#base: Repository;
	#repositories: Array<Repository> = [];
	constructor(base: Repository) {
		this.#base = base;
	}

	get name() {
		return this.#base.name;
	}

	async getFile(filename: string): Promise<RepositoryArrayBufferResponse> {
		for (const repository of this.#repositories) {
			const response = await repository.getFile(filename);
			if (!response.error) {
				return response;
			}
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsText(filename: string): Promise<RepositoryTextResponse> {
		for (const repository of this.#repositories) {
			const response = await repository.getFileAsText(filename);
			if (!response.error) {
				return response;
			}
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsBlob(filename: string): Promise<RepositoryBlobResponse> {
		for (const repository of this.#repositories) {
			const response = await repository.getFileAsBlob(filename);
			if (!response.error) {
				return response;
			}
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		for (const repository of this.#repositories) {
			const response = await repository.getFileAsJson(filename);
			if (!response.error) {
				return response;
			}
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse> {
		//TODO:
		return { error: RepositoryError.NotSupported };
	}

	async pushRepository(repo: Repository) {
		this.#repositories.push(repo);
	}

	async unshiftRepository(repo: Repository) {
		this.#repositories.unshift(repo);
	}
}
