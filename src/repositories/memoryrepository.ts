import { checkRepositoryName, Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFileResponse, RepositoryHasFileResponse, RepositoryJsonResponse, RepositoryProperty, RepositoryTextResponse } from './repository';

export class MemoryRepository implements Repository {
	readonly #name: string;
	readonly properties = new Map<string, RepositoryProperty>();
	readonly #files = new Map<string, File>();
	active = true;

	constructor(name: string) {
		checkRepositoryName(name);
		this.#name = name;
	}

	get name(): string {
		return this.#name;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
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

	// eslint-disable-next-line @typescript-eslint/require-await
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

	// eslint-disable-next-line @typescript-eslint/require-await
	async getFileList(): Promise<RepositoryFileListResponse> {
		return { error: RepositoryError.NotSupported };
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async hasFile(path: string): Promise<RepositoryHasFileResponse> {
		return { exist: this.#files.has(path) };
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async setFile(path: string, file: File): Promise<RepositoryError | null> {
		this.#files.set(path, file);
		return null;
	}
}
