import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFilter, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

export class OverrideRepository implements Repository {
	#base: Repository;
	#overrides = new Map<string, File>();
	constructor(base: Repository) {
		this.#base = base;
	}

	get name() {
		return this.#base.name;
	}

	async getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse> {
		if (this.#overrides.has(filename)) {
			return { buffer: await this.#overrides.get(filename)!.arrayBuffer() };
		}
		return this.#base.getFileAsArrayBuffer(filename);
	}

	async getFileAsText(filename: string): Promise<RepositoryTextResponse> {
		if (this.#overrides.has(filename)) {
			return { text: await this.#overrides.get(filename)!.text() };
		}
		return this.#base.getFileAsText(filename);
	}

	async getFileAsBlob(filename: string): Promise<RepositoryBlobResponse> {
		if (this.#overrides.has(filename)) {
			return { blob: await this.#overrides.get(filename) };
		}
		return this.#base.getFileAsText(filename);
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		if (this.#overrides.has(filename)) {
			return { json: JSON.parse(await this.#overrides.get(filename)!.text()) };
		}
		return this.#base.getFileAsJson(filename);
	}

	async getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse> {
		//TODO: added overriden files ?
		return this.#base.getFileList(filter);
	}

	async overrideFile(filename: string, file: File): Promise<RepositoryError | null> {
		this.#overrides.set(filename, file);
		return null;
	}
}
