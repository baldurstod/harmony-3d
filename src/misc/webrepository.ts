import { customFetch } from '../utils/customfetch';
import { Repository } from './repository';

export class WebRepository implements Repository {
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

	async getFile(fileName: string): Promise<ArrayBuffer> {
		const url = new URL(fileName, this.#base);
		const response = await customFetch(url);
		return response.arrayBuffer();
	}

	async getFileAsText(fileName: string): Promise<string> {
		const url = new URL(fileName, this.#base);
		const response = await customFetch(url);
		return response.text();
	}

	async getFileAsBlob(fileName: string): Promise<Blob> {
		const url = new URL(fileName, this.#base);
		const response = await customFetch(url);
		return new Blob([new Uint8Array(await response.arrayBuffer())]);
	}
}
