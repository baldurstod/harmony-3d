//import { BlobReader, BlobWriter, ZipReader, ZipReaderGetEntriesOptions } from '@zip.js/zip.js';
import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryEntry, RepositoryError, RepositoryFileListResponse, RepositoryFilter, RepositoryJsonResponse, RepositoryTextResponse } from './repository';
import JSZip from 'jszip';

export class ZipRepository implements Repository {
	#name: string;
	#zip: File;
	#reader = new JSZip();//ZipReader<BlobReader>;
	#zipEntries = new Map<string, File>();
	#initPromiseResolve?: (value: boolean) => void;
	#initPromise = new Promise(resolve => this.#initPromiseResolve = resolve);
	constructor(name: string, zipFile: File) {
		this.#name = name;
		this.#zip = zipFile;
		//this.#reader = new ZipReader(new BlobReader(zip));

		(async () => {
			const zip = await this.#reader.loadAsync(await zipFile.arrayBuffer());
			console.info(zip);
			/*const error = await this.#vpk.setFiles(files);

			if (error) {
				this.#initPromiseResolve?.(false);
			} else {
				this.#initPromiseResolve?.(true);
		}*/
			this.#initPromiseResolve?.(true);
		})();

		//this.#initEntries();
	}

	/*
	async #initEntries() {
		const entries = await this.#reader.getEntries();
		for (const entry of entries) {
			if (!entry.getData || entry.directory) {
				continue;
			}

			const blob = await entry.getData(new BlobWriter());
			const filename = cleanupFilename(entry.filename);
			this.#zipEntries.set(filename, new File([blob], filename));
		}
		this.#initPromiseResolve?.(true);
	}
		*/

	get name() {
		return this.#name;
	}

	async getFile(filename: string): Promise<RepositoryArrayBufferResponse> {
		await this.#initPromise;
		const file = this.#zipEntries.get(cleanupFilename(filename));
		if (!file) {
			return { error: RepositoryError.FileNotFound };
		}
		return { buffer: await file.arrayBuffer() };
	}

	async getFileAsText(filename: string): Promise<RepositoryTextResponse> {
		await this.#initPromise;
		const file = this.#zipEntries.get(cleanupFilename(filename));
		if (!file) {
			return { error: RepositoryError.FileNotFound };
		}
		return { text: await file.text() };
	}

	async getFileAsBlob(filename: string): Promise<RepositoryBlobResponse> {
		await this.#initPromise;
		cleanupFilename(filename);
		throw 'code me';
		return { blob: null };
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		await this.#initPromise;
		const file = this.#zipEntries.get(cleanupFilename(filename));
		if (!file) {
			return { error: RepositoryError.FileNotFound };
		}
		return { json: JSON.parse(await file.text()) };
	}

	async getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse> {
		await this.#initPromise;
		const root = new RepositoryEntry(this, '', true);
		for (const [filename, _] of this.#zipEntries) {
			root.addEntry(filename);
		}
		return { root: root };
	}
}

function cleanupFilename(filename: string): string {
	filename = filename.toLowerCase().replaceAll('\\', '/');
	const arr = filename.split('/');

	return arr.filter((path) => path != '').join('/');
}
