import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryEntry, RepositoryError, RepositoryFileListResponse, RepositoryFileResponse, RepositoryFilter, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

export class MergeRepository implements Repository {
	#name: string;
	#repositories: Repository[] = [];

	constructor(name: string, ...repositories: Repository[]) {
		this.#name = name;
		for (const repo of repositories) {
			if (repo) {
				this.#repositories.push(repo);
			}
		}
	}

	get name() {
		return this.#name;
	}

	async getFile(filename: string): Promise<RepositoryFileResponse> {
		for (const repository of this.#repositories) {
			const response = await repository.getFile(filename);
			if (!response.error) {
				return response;
			}
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse> {
		for (const repository of this.#repositories) {
			const response = await repository.getFileAsArrayBuffer(filename);
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
		const root = new RepositoryEntry(this, '', true, 0);
		for (const repository of this.#repositories) {
			const response = await repository.getFileList(filter);
			if (!response.error) {
				root.merge(response.root!);
			}
		}
		return { root: root };
	}

	async pushRepository(repo: Repository) {
		this.#repositories.push(repo);
	}

	async unshiftRepository(repo: Repository) {
		this.#repositories.unshift(repo);
	}
}
