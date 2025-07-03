import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFileResponse, RepositoryJsonResponse, RepositoryTextResponse } from './repository';
import { RepositoryEntry } from './repositoryentry';

export class PathPrefixRepository implements Repository {
	#name: string;
	#base: Repository;
	prefix: string;

	constructor(name: string, base: Repository, prefix: string = '') {
		this.#name = name;
		this.#base = base;
		this.prefix = prefix;
	}

	get name() {
		return this.#name;
	}

	async getFile(path: string): Promise<RepositoryFileResponse> {
		return this.#base.getFile(this.prefix + '/' + path);
	}

	async getFileAsArrayBuffer(path: string): Promise<RepositoryArrayBufferResponse> {
		return this.#base.getFileAsArrayBuffer(this.prefix + '/' + path);
	}

	async getFileAsText(path: string): Promise<RepositoryTextResponse> {
		return this.#base.getFileAsText(this.prefix + '/' + path);
	}

	async getFileAsBlob(path: string): Promise<RepositoryBlobResponse> {
		return this.#base.getFileAsBlob(this.prefix + '/' + path);
	}

	async getFileAsJson(path: string): Promise<RepositoryJsonResponse> {
		return this.#base.getFileAsJson(this.prefix + '/' + path);
	}

	async getFileList(): Promise<RepositoryFileListResponse> {
		const baseResponse = await this.#base.getFileList();
		if (baseResponse.error) {
			return baseResponse;
		}

		let root: RepositoryEntry | null = baseResponse.root!;

		root = root.getPath(this.prefix)
		if (!root) {
			return { error: RepositoryError.FileNotFound };
		}

		root.setName('');

		for (const entry of root.getAllChilds()) {
			entry.setRepository(this);
		}

		return { root: root };
	}
}
