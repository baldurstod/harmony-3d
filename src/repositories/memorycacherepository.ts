import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryFileListResponse, RepositoryFileResponse, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

/**
 * Cache the result of the underlying repository
 */
export class MemoryCacheRepository implements Repository {
	#base: Repository;
	#files = new Map<string, Promise<RepositoryFileResponse>>();
	#fileList?: RepositoryFileListResponse;

	constructor(base: Repository) {
		this.#base = base;
	}

	get name() {
		return this.#base.name;
	}

	async getFile(filename: string): Promise<RepositoryFileResponse> {
		let response = this.#files.get(filename);
		if (response) {
			return response;
		}

		response = this.#base.getFile(filename);
		this.#files.set(filename, response);
		return response;
	}

	async getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse> {
		const response = await this.getFile(filename);
		if (response.error) {
			return response;
		}

		return { buffer: await response.file!.arrayBuffer() };
	}

	async getFileAsText(filename: string): Promise<RepositoryTextResponse> {
		const response = await this.getFile(filename);
		if (response.error) {
			return response;
		}

		return { text: await response.file!.text() };
	}

	async getFileAsBlob(filename: string): Promise<RepositoryBlobResponse> {
		const response = await this.getFile(filename);
		if (response.error) {
			return response;
		}

		return { blob: response.file };
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		const response = await this.getFile(filename);
		if (response.error) {
			return response;
		}

		return { json: JSON.parse(await response.file!.text()) };
	}

	async getFileList(): Promise<RepositoryFileListResponse> {
		if (this.#fileList) {
			return this.#fileList;
		}

		this.#fileList = await this.#base.getFileList();

		return this.#fileList;
	}
}
