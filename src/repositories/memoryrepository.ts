import { checkRepositoryName, Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFileResponse, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

export class MemoryRepository implements Repository {
	#name: string;
	#files = new Map<string, File>();
	active: boolean = true;

	constructor(name: string) {
		checkRepositoryName(name);
		this.#name = name;
	}

	get name() {
		return this.#name;
	}

	async getFile(filename: string): Promise<RepositoryFileResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		const file = this.#files.get(filename);
		if (file) {
			return { file: file };
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		const file = this.#files.get(filename);
		if (file) {
			return { buffer: await file.arrayBuffer() };
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsText(filename: string): Promise<RepositoryTextResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		const file = this.#files.get(filename);
		if (file) {
			return { text: await file.text() };
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsBlob(filename: string): Promise<RepositoryBlobResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		const file = this.#files.get(filename);
		if (file) {
			return { blob: file };
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		const file = this.#files.get(filename);
		if (file) {
			return { json: JSON.parse(await file.text()) };
		}
		return { error: RepositoryError.FileNotFound };
	}

	async getFileList(): Promise<RepositoryFileListResponse> {
		return { error: RepositoryError.NotSupported };
	}

	async setFile(path: string, file: File): Promise<RepositoryError | null> {
		this.#files.set(path, file);
		return null;
	}
}
