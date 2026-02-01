import { PersistentStorage } from 'harmony-browser-utils';
import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFileResponse, RepositoryJsonResponse, RepositoryTextResponse } from '../repository';
import { joinPath } from 'harmony-utils';

const STORAGE_PREFIX = 'repository_content';

/**
 * Cache the result of the underlying repository in persistent storage
 */
export class StorageRepository implements Repository {
	#base: Repository;
	#fileList?: RepositoryFileListResponse;
	active: boolean = true;

	constructor(base: Repository) {
		this.#base = base;
	}

	get name() {
		return this.#base.name;
	}

	async #setFile(path: string, file: File): Promise<void> {
		PersistentStorage.writeFile(joinPath(STORAGE_PREFIX, this.name, path), file);
	}

	async #getFile(path: string): Promise<File | null> {
		return await PersistentStorage.readFile(joinPath(STORAGE_PREFIX, this.name, path));
	}

	async getFile(path: string): Promise<RepositoryFileResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}

		const file = await this.#getFile(path);
		if (file) {
			return { file, };
		}

		const response = await this.#base.getFile(path);
		if (!response.error) {
			await this.#setFile(path, response.file!);
		}

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
