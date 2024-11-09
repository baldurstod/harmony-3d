import { customFetch } from '../utils/customfetch';

export class Repository {
	#name: string;
	#base: string;
	constructor(name: string, base: string) {
		this.#name = name;
		this.#base = base;
	}

	get name() {
		return this.#name;
	}

	get base() {
		return this.#base;
	}

	async getFile(fileName: string) {
		const url = new URL(fileName, this.#base);
		return customFetch(url);
	}
}
