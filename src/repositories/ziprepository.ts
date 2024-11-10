import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFilter, RepositoryJsonResponse, RepositoryStringResponse } from './repository';

export class ZipRepository implements Repository {
	#name: string;
	#zip: File;
	constructor(name: string, zip: File) {
		this.#name = name;
		this.#zip = zip;
	}

	get name() {
		return this.#name;
	}

	async getFile(fileName: string): Promise<RepositoryArrayBufferResponse> {
		//const url = new URL(fileName, this.#base);
		//return customFetch(url);
		return { buffer: new ArrayBuffer(10) };
	}

	async getFileAsText(fileName: string): Promise<RepositoryStringResponse> {
		return { string: '' };
	}

	async getFileAsBlob(fileName: string): Promise<RepositoryBlobResponse> {
		return { blob: null };
	}

	async getFileAsJson(fileName: string): Promise<RepositoryJsonResponse> {
		return { json: null };
	}

	async getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse> {
		return { error: RepositoryError.NotSupported };
	}

	async overrideFile(filepath: string, file: File): Promise<RepositoryError> {
		return RepositoryError.NotSupported;
	}
}
