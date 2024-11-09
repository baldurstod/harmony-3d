import { Repository } from './repository';

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

	async getFile(fileName: string): Promise<ArrayBuffer> {
		//const url = new URL(fileName, this.#base);
		//return customFetch(url);
		return new ArrayBuffer(10);
	}

	async getFileAsText(fileName: string): Promise<String> {
		return '';
	}
}
