import { customFetch } from '../utils/customfetch';
import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFilter, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

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
		const url = new URL(fileName, this.#base);
		const response = await customFetch(url);
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
		const url = new URL(fileName, this.#base);
		const response = await customFetch(url);
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
		const url = new URL(fileName, this.#base);
		const response = await customFetch(url);
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

	async getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse> {
		return { error: RepositoryError.NotSupported };
	}

	async overrideFile(filepath: string, file: File): Promise<RepositoryError> {
		return RepositoryError.NotSupported;
	}
}
