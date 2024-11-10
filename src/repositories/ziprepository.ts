import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryStringResponse } from './repository';

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
		return { file: new ArrayBuffer(10) };
	}

	async getFileAsText(fileName: string): Promise<RepositoryStringResponse> {
		return { file: '' };
	}

	async getFileAsBlob(fileName: string): Promise<RepositoryBlobResponse> {
		return { file: null };
	}
}
