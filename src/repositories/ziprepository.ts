import { BlobReader, BlobWriter, ZipReader, ZipReaderGetEntriesOptions } from '@zip.js/zip.js';
import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFilter, RepositoryJsonResponse, RepositoryStringResponse } from './repository';

export class ZipRepository implements Repository {
	#name: string;
	#zip: File;
	#reader: ZipReader<BlobReader>;
	#initialized = false;
	#zipEntries = new Map<string, Blob>();
	#initPromiseResolve?: (value: boolean) => void;
	#init = new Promise(resolve => this.#initPromiseResolve = resolve);
	constructor(name: string, zip: File) {
		this.#name = name;
		this.#zip = zip;
		this.#reader = new ZipReader(new BlobReader(zip));

		this.#initEntries();
	}

	async #initEntries() {
		const entries = await this.#reader.getEntries();
		for (const entry of entries) {
			if (!entry.getData || entry.directory) {
				continue;
			}

			const blob = await entry.getData(new BlobWriter());
			this.#zipEntries.set(entry.filename.toLowerCase(), blob);
		}

		console.log(this.#zipEntries);
		this.#initPromiseResolve?.(true);
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

	async generateManifest(name = 'models_manifest.json') {
		await this.#init;
		const root = new Entry('', true);
		for (const [filename, _] of this.#zipEntries) {
			root.addEntry(filename);
		}
		console.info(root);
	}
}

class Entry {
	#name: string;
	#childs = new Map<string, Entry>;
	#isDirectory: boolean;

	constructor(name: string, isDirectory: boolean) {
		this.#name = name;
		this.#isDirectory = isDirectory;
	}

	addEntry(filename: string) {
		const splittedPath = filename.split(/[\/\\]+/);
		let current: Entry = this;

		for (const p of splittedPath) {
			if (!current.#childs.has(p)) {
				current = current.#addDirectory(p);
			} else {
				current = current.#childs.get(p) as Entry;
			}

		}

	}

	#addDirectory(name: string) {
		const e = new Entry(name, true);
		this.#childs.set(name, e);
		return e;
	}
}
