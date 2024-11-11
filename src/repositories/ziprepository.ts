import { BlobReader, BlobWriter, ZipReader, ZipReaderGetEntriesOptions } from '@zip.js/zip.js';
import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFilter, RepositoryJsonResponse, RepositoryStringResponse } from './repository';

export class ZipRepository implements Repository {
	#name: string;
	#zip: File;
	#reader: ZipReader<BlobReader>;
	#initialized = false;
	#zipEntries = new Map<string, File>();
	#overrides = new Map<string, File>();
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
			const filename = entry.filename.toLowerCase().replaceAll('\\', '/');
			this.#zipEntries.set(filename, new File([blob], filename));
		}

		console.log(this.#zipEntries);
		this.#initPromiseResolve?.(true);
	}

	get name() {
		return this.#name;
	}

	async #getFile(filename: string): Promise<File | undefined> {
		if (this.#overrides.has(filename)) {
			return this.#overrides.get(filename);
		}
		return this.#zipEntries.get(filename);
	}

	async getFile(filename: string): Promise<RepositoryArrayBufferResponse> {
		//const url = new URL(fileName, this.#base);
		//return customFetch(url);
		//return { buffer: new ArrayBuffer(10) };
		const file = await this.#getFile(filename);
		if (!file) {
			return { error: RepositoryError.FileNotFound };
		}
		return { buffer: await file.arrayBuffer() };
	}

	async getFileAsText(filename: string): Promise<RepositoryStringResponse> {
		const file = await this.#getFile(filename);
		if (!file) {
			return { error: RepositoryError.FileNotFound };
		}
		return { string: await file.text() };
	}

	async getFileAsBlob(fileName: string): Promise<RepositoryBlobResponse> {
		throw 'code me';
		return { blob: null };
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		const file = await this.#getFile(filename);
		if (!file) {
			return { error: RepositoryError.FileNotFound };
		}
		return { json: JSON.parse(await file.text()) };
	}

	async getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse> {
		return { error: RepositoryError.NotSupported };
	}

	async overrideFile(filename: string, file: File): Promise<RepositoryError | null> {
		this.#overrides.set(filename, file);
		return null;
	}

	async generateModelManifest(name = 'models_manifest.json'): Promise<boolean> {
		await this.#init;
		const root = new Entry('', true);
		for (const [filename, _] of this.#zipEntries) {
			root.addEntry(filename);
		}
		console.info(root);

		const models = root.getChild('models');
		if (!models) {
			return false;
		}

		const json = models.toJSON();
		console.info(JSON.stringify(json));

		this.overrideFile(name, new File([JSON.stringify(json)], name));


		return true;
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
		let len = splittedPath.length - 1;

		for (const [i, p] of splittedPath.entries()) {
			if (!current.#childs.has(p)) {
				current = current.#addFile(p, i != len);
			} else {
				current = current.#childs.get(p) as Entry;
			}
		}
	}

	#addFile(name: string, isDirectory: boolean) {
		const e = new Entry(name, isDirectory);
		this.#childs.set(name, e);
		return e;
	}

	getChild(name: string): Entry | undefined {
		return this.#childs.get(name);
	}

	toJSON() {
		const json: any/*TODO:improve type*/ = { name: this.#name };
		if (this.#isDirectory) {
			const files: Array<any/*TODO:improve type*/> = [];
			for (const [_, child] of this.#childs) {
				files.push(child.toJSON());
			}
			json.files = files;
		}
		return json;
	}
}
