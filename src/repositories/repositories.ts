import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileResponse, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

export class Repositories {
	static #repositories = new Map<string, Repository>();

	static addRepository(repo: Repository): Repository {
		this.#repositories.set(repo.name, repo);
		return repo;
	}

	static getRepository(name: string): Repository | undefined {
		return this.#repositories.get(name);
	}

	static getRepositoryList(): string[] {
		return Object.keys(this.#repositories);
	}

	static async getFile(repositoryName: string, filepath: string): Promise<RepositoryFileResponse> {
		const repo = this.#repositories.get(repositoryName);
		if (!repo) {
			return { error: RepositoryError.RepoNotFound };
		}

		return repo?.getFile(filepath);
	}

	static async getFileAsArrayBuffer(repositoryName: string, filepath: string): Promise<RepositoryArrayBufferResponse> {
		const repo = this.#repositories.get(repositoryName);
		if (!repo) {
			return { error: RepositoryError.RepoNotFound };
		}

		return repo?.getFileAsArrayBuffer(filepath);
	}

	static async getFileAsText(repositoryName: string, filepath: string): Promise<RepositoryTextResponse> {
		const repo = this.#repositories.get(repositoryName);
		if (!repo) {
			return { error: RepositoryError.RepoNotFound };
		}

		return repo?.getFileAsText(filepath);
	}

	static async getFileAsBlob(repositoryName: string, filepath: string): Promise<RepositoryBlobResponse> {
		const repo = this.#repositories.get(repositoryName);
		if (!repo) {
			return { error: RepositoryError.RepoNotFound };
		}

		return repo?.getFileAsBlob(filepath);
	}

	static async getFileAsJson(repositoryName: string, filepath: string): Promise<RepositoryJsonResponse> {
		const repo = this.#repositories.get(repositoryName);
		if (!repo) {
			return { error: RepositoryError.RepoNotFound };
		}

		return repo?.getFileAsJson(filepath);
	}

	static getRepositories(): Map<string, Repository> {
		return new Map<string, Repository>(this.#repositories);
	}
}
