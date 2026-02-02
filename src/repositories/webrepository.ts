import { customFetch } from '../utils/customfetch';
import { checkRepositoryName, Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFileResponse, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

export class WebRepository implements Repository {
	#name: string;
	#base: string;
	#useCacheApi: boolean;
	#cache?: Cache;
	active: boolean = true;

	constructor(name: string, base: string, useCacheApi = false) {
		checkRepositoryName(name);
		this.#name = name;
		this.#base = base;
		this.#useCacheApi = useCacheApi;
	}

	get name() {
		return this.#name;
	}

	get base() {
		return this.#base;
	}

	async getFile(fileName: string): Promise<RepositoryFileResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		const url = new URL(fileName, this.#base);
		const response = await this.#fetch(url);
		if (response.ok) {
			return { file: new File([new Uint8Array(await response.arrayBuffer())], fileName) };
		} else {
			let error: RepositoryError = RepositoryError.UnknownError;
			if (response.status == 404) {
				error = RepositoryError.FileNotFound
			}
			return { error: error };
		}
	}

	async getFileAsArrayBuffer(fileName: string): Promise<RepositoryArrayBufferResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		const url = new URL(fileName, this.#base);
		const response = await this.#fetch(url);
		if (response.ok) {
			return { buffer: await response.arrayBuffer() };
		} else {
			let error: RepositoryError = RepositoryError.UnknownError;
			if (response.status == 404) {
				error = RepositoryError.FileNotFound
			}
			return { error: error };
		}
	}

	async getFileAsText(fileName: string): Promise<RepositoryTextResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		const url = new URL(fileName, this.#base);
		const response = await this.#fetch(url);
		if (response.ok) {
			return { text: await response.text() };
		} else {
			let error: RepositoryError = RepositoryError.UnknownError;
			if (response.status == 404) {
				error = RepositoryError.FileNotFound
			}
			return { error: error };
		}
	}

	async getFileAsBlob(fileName: string): Promise<RepositoryBlobResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		const url = new URL(fileName, this.#base);
		const response = await this.#fetch(url);
		if (response.ok) {
			return { blob: new Blob([new Uint8Array(await response.arrayBuffer())]) };
		} else {
			let error: RepositoryError = RepositoryError.UnknownError;
			if (response.status == 404) {
				error = RepositoryError.FileNotFound
			}
			return { error: error };
		}
	}

	async getFileAsJson(fileName: string): Promise<RepositoryJsonResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		const url = new URL(fileName, this.#base);
		const response = await this.#fetch(url);
		if (response.ok) {
			return { json: await response.json() };
		} else {
			let error: RepositoryError = RepositoryError.UnknownError;
			if (response.status == 404) {
				error = RepositoryError.FileNotFound
			}
			return { error: error };
		}
	}

	async getFileList(): Promise<RepositoryFileListResponse> {
		return { error: RepositoryError.NotSupported };
	}

	async #fetch(url: URL): Promise<Response> {
		if (!this.#useCacheApi) {
			return await customFetch(url);
		} else {

			// Open the cache if it doesn't exist
			this.#cache = this.#cache ?? await caches.open('WebRepository');

			let response: Response | undefined = await this.#cache.match(url);
			if (!response) {
				// If cache miss, fetch the request
				response = await customFetch(url);
				this.#cache.put(url, response.clone());
			}

			return response;
		}
	}
}
