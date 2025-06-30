import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryFileListResponse, RepositoryFileResponse, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

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

		const root = baseResponse.root!;
		for (const entry of root.getChilds()) {
			const name = entry.getName();
			if (name != this.prefix) {
				root.removeEntry(name);
			}
		}
		return { root: root };
	}
}
