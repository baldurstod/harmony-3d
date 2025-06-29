import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFileResponse, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

export class OverrideRepository implements Repository {
	#base: Repository;
	#overrides = new Map<string, File>();

	constructor(base: Repository) {
		this.#base = base;
	}

	get name() {
		return this.#base.name;
	}

	async getFile(filename: string): Promise<RepositoryFileResponse> {
		const file = this.#overrides.get(filename);
		if (file) {
			return { file: file };
		}
		return this.#base.getFile(filename);
	}

	async getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse> {
		const file = this.#overrides.get(filename);
		if (file) {
			return { buffer: await file.arrayBuffer() };
		}
		return this.#base.getFileAsArrayBuffer(filename);
	}

	async getFileAsText(filename: string): Promise<RepositoryTextResponse> {
		const file = this.#overrides.get(filename);
		if (file) {
			return { text: await file.text() };
		}
		return this.#base.getFileAsText(filename);
	}

	async getFileAsBlob(filename: string): Promise<RepositoryBlobResponse> {
		const file = this.#overrides.get(filename);
		if (file) {
			return { blob: file };
		}
		return this.#base.getFileAsBlob(filename);
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		const file = this.#overrides.get(filename);
		if (file) {
			return { json: JSON.parse(await file.text()) };
		}
		return this.#base.getFileAsJson(filename);
	}

	async getFileList(): Promise<RepositoryFileListResponse> {
		//TODO: added overriden files ?
		return this.#base.getFileList();
	}

	async overrideFile(filename: string, file: File): Promise<RepositoryError | null> {
		this.#overrides.set(filename, file);
		return null;
	}
}
