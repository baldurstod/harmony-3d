import { customFetch } from '../utils/customfetch';

export class Repository {
	#name: string;
	#base: string;
	#fallbackRepository: string;
	#fetchFunction;
	constructor(name, base, fallbackRepository, fetchFunction) {
		this.#name = name;
		this.#base = base;
		if (fallbackRepository) {
			this.#fallbackRepository = fallbackRepository;
		}
		if (fetchFunction) {
			this.#fetchFunction = fetchFunction;
		}
	}

	get name() {
		return this.#name;
	}

	get base() {
		return this.#base;
	}

	async getFile(fileName) {
		if (this.#fetchFunction) {
			return this.#fetchFunction(fileName);
		} else {
			const url = new URL(fileName, this.#base);
			return customFetch(url);
		}
	}
}
