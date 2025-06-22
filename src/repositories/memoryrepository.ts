import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFileResponse, RepositoryFilter, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

export class MemoryRepository implements Repository {
	#name: string;
	#files = new Map<string, File>();

	constructor(name: string) {
		this.#name = name;
	}

	get name() {
		return this.#name;
	}

	async getFile(filename: string): Promise<RepositoryFileResponse> {
		if (this.#files.has(filename)) {
			return { file: this.#files.get(filename) };
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse> {
		if (this.#files.has(filename)) {
			return { buffer: await this.#files.get(filename)!.arrayBuffer() };
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsText(filename: string): Promise<RepositoryTextResponse> {
		if (this.#files.has(filename)) {
			return { text: await this.#files.get(filename)!.text() };
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsBlob(filename: string): Promise<RepositoryBlobResponse> {
		if (this.#files.has(filename)) {
			return { blob: this.#files.get(filename) };
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		if (this.#files.has(filename)) {
			return { json: JSON.parse(await this.#files.get(filename)!.text()) };
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse> {
		return { error: RepositoryError.NotSupported };
	}

	async setFile(path: string, file: File): Promise<RepositoryError | null> {
		this.#files.set(path, file);
		return null;
	}
}
