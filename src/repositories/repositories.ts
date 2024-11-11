import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

export class Repositories {
	static #instance: Repositories;
	#repositories: { [key: string]: Repository } = {};

	constructor() {
		if (Repositories.#instance) {
			return Repositories.#instance;
		}
		Repositories.#instance = this;
	}

	addRepository(repo: Repository) {
		this.#repositories[repo.name] = repo;
	}

	getRepository(name: string) {
		return this.#repositories[name];
	}

	getRepositoryList() {
		return Object.keys(this.#repositories);
	}

	async getFile(repositoryName: string, filepath: string): Promise<RepositoryArrayBufferResponse> {
		const repo = this.#repositories[repositoryName];
		if (!repo) {
			return null;
		}

		return repo?.getFile(filepath);
	}

	async getFileAsText(repositoryName: string, filepath: string): Promise<RepositoryTextResponse> {
		const repo = this.#repositories[repositoryName];
		if (!repo) {
			return null;
		}

		return repo?.getFileAsText(filepath);
	}

	async getFileAsBlob(repositoryName: string, filepath: string): Promise<RepositoryBlobResponse> {
		const repo = this.#repositories[repositoryName];
		if (!repo) {
			return null;
		}

		return repo?.getFileAsBlob(filepath);
	}

	async getFileAsJson(repositoryName: string, filepath: string): Promise<RepositoryJsonResponse> {
		const repo = this.#repositories[repositoryName];
		if (!repo) {
			return null;
		}

		return repo?.getFileAsJson(filepath);
	}
}
