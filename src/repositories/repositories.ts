import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

export class Repositories {
	static #repositories: { [key: string]: Repository } = {};

	static addRepository(repo: Repository) {
		this.#repositories[repo.name] = repo;
	}

	static getRepository(name: string) {
		return this.#repositories[name];
	}

	static getRepositoryList() {
		return Object.keys(this.#repositories);
	}

	static async getFile(repositoryName: string, filepath: string): Promise<RepositoryArrayBufferResponse> {
		const repo = this.#repositories[repositoryName];
		if (!repo) {
			return null;
		}

		return repo?.getFile(filepath);
	}

	static async getFileAsText(repositoryName: string, filepath: string): Promise<RepositoryTextResponse> {
		const repo = this.#repositories[repositoryName];
		if (!repo) {
			return null;
		}

		return repo?.getFileAsText(filepath);
	}

	static async getFileAsBlob(repositoryName: string, filepath: string): Promise<RepositoryBlobResponse> {
		const repo = this.#repositories[repositoryName];
		if (!repo) {
			return null;
		}

		return repo?.getFileAsBlob(filepath);
	}

	static async getFileAsJson(repositoryName: string, filepath: string): Promise<RepositoryJsonResponse> {
		const repo = this.#repositories[repositoryName];
		if (!repo) {
			return null;
		}

		return repo?.getFileAsJson(filepath);
	}
}
