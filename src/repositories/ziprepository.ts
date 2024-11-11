import { BlobReader, BlobWriter, ZipReader, ZipReaderGetEntriesOptions } from '@zip.js/zip.js';
import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryEntry, RepositoryError, RepositoryFileListResponse, RepositoryFilter, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

export class ZipRepository implements Repository {
	#name: string;
	#zip: File;
	#reader: ZipReader<BlobReader>;
	#zipEntries = new Map<string, File>();
	#initPromiseResolve?: (value: boolean) => void;
	#initPromise = new Promise(resolve => this.#initPromiseResolve = resolve);
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

	async getFile(filename: string): Promise<RepositoryArrayBufferResponse> {
		await this.#initPromise;
		//const url = new URL(fileName, this.#base);
		//return customFetch(url);
		//return { buffer: new ArrayBuffer(10) };
		const file = this.#zipEntries.get(filename);
		if (!file) {
			return { error: RepositoryError.FileNotFound };
		}
		return { buffer: await file.arrayBuffer() };
	}

	async getFileAsText(filename: string): Promise<RepositoryTextResponse> {
		await this.#initPromise;
		const file = this.#zipEntries.get(filename);
		if (!file) {
			return { error: RepositoryError.FileNotFound };
		}
		return { text: await file.text() };
	}

	async getFileAsBlob(filename: string): Promise<RepositoryBlobResponse> {
		await this.#initPromise;
		throw 'code me';
		return { blob: null };
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		await this.#initPromise;
		const file = this.#zipEntries.get(filename);
		if (!file) {
			return { error: RepositoryError.FileNotFound };
		}
		return { json: JSON.parse(await file.text()) };
	}

	async getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse> {
		await this.#initPromise;
		const root = new RepositoryEntry('', true);
		for (const [filename, _] of this.#zipEntries) {
			root.addEntry(filename);
		}
		return { root: root };
	}
}
