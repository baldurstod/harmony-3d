import { customFetch } from '../utils/customfetch';
import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryStringResponse } from './repository';

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

	async getFile(fileName: string): Promise<RepositoryArrayBufferResponse> {
		const url = new URL(fileName, this.#base);
		const response = await customFetch(url);
		return { file: await response.arrayBuffer() };
	}

	async getFileAsText(fileName: string): Promise<RepositoryStringResponse> {
		const url = new URL(fileName, this.#base);
		const response = await customFetch(url);
		return { file: await response.text() };
	}

	async getFileAsBlob(fileName: string): Promise<RepositoryBlobResponse> {
		const url = new URL(fileName, this.#base);
		const response = await customFetch(url);
		return { file: new Blob([new Uint8Array(await response.arrayBuffer())]) };
	}
}
