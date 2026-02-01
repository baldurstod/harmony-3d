import { checkRepositoryName, Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFileResponse, RepositoryJsonResponse, RepositoryTextResponse } from './repository';
import { RepositoryEntry } from './repositoryentry';

export class MergeRepository implements Repository {
	#name: string;
	#repositories: Repository[] = [];
	active: boolean = true;

	constructor(name: string, ...repositories: Repository[]) {
		checkRepositoryName(name);
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
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		for (const repository of this.#repositories) {
			const response = await repository.getFile(filename);
			if (!response.error) {
				return response;
			}
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		for (const repository of this.#repositories) {
			const response = await repository.getFileAsArrayBuffer(filename);
			if (!response.error) {
				return response;
			}
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsText(filename: string): Promise<RepositoryTextResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		for (const repository of this.#repositories) {
			const response = await repository.getFileAsText(filename);
			if (!response.error) {
				return response;
			}
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsBlob(filename: string): Promise<RepositoryBlobResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		for (const repository of this.#repositories) {
			const response = await repository.getFileAsBlob(filename);
			if (!response.error) {
				return response;
			}
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		for (const repository of this.#repositories) {
			const response = await repository.getFileAsJson(filename);
			if (!response.error) {
				return response;
			}
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileList(): Promise<RepositoryFileListResponse> {
		const root = new RepositoryEntry(this, '', true, 0);
		for (const repository of this.#repositories) {
			const response = await repository.getFileList();
			if (!response.error) {
				root.merge(response.root!);
			}
		}
		return { root: root };
	}

	pushRepository(repo: Repository) {
		this.#repositories.push(repo);
	}

	unshiftRepository(repo: Repository) {
		this.#repositories.unshift(repo);
	}

	getSubRepositories(): Set<Repository> {
		return new Set<Repository>(this.#repositories);
	}
}
