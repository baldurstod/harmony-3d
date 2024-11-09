import { Repository } from './repository';

export class Repositories {
	static #instance: Repositories;
	#repositories = {};

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
}
