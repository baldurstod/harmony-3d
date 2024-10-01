import { Repository } from './repository';

export class Repositories {
	static #repositories = {};

	static addRepository(repo: Repository) {
		this.#repositories[repo.name] = repo;
	}

	static getRepository(name: string) {
		return this.#repositories[name];
	}

	static getRepositoryList() {
		return Object.keys(this.#repositories);
	}
}
