import { BlobReader, BlobWriter, ZipReader } from '@zip.js/zip.js';
import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFileResponse, RepositoryJsonResponse, RepositoryTextResponse } from './repository';
import { RepositoryEntry } from './repositoryentry';

export class ZipRepository implements Repository {
	#name: string;
	#zip: File;
	#reader: ZipReader<BlobReader>;
	#zipEntries = new Map<string, File>();
	#initPromiseResolve?: (value: boolean) => void;
	#initPromise = new Promise(resolve => this.#initPromiseResolve = resolve);
	active: boolean = true;

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
			const filename = cleanupFilename(entry.filename);
			this.#zipEntries.set(filename, new File([blob], filename));
		}
		this.#initPromiseResolve?.(true);
	}

	get name() {
		return this.#name;
	}

	async getFile(filename: string): Promise<RepositoryFileResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		await this.#initPromise;
		cleanupFilename(filename);
		throw 'code me';
		return { file: null };
	}

	async getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		await this.#initPromise;
		const file = this.#zipEntries.get(cleanupFilename(filename));
		if (!file) {
			return { error: RepositoryError.FileNotFound };
		}
		return { buffer: await file.arrayBuffer() };
	}

	async getFileAsText(filename: string): Promise<RepositoryTextResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		await this.#initPromise;
		const file = this.#zipEntries.get(cleanupFilename(filename));
		if (!file) {
			return { error: RepositoryError.FileNotFound };
		}
		return { text: await file.text() };
	}

	async getFileAsBlob(filename: string): Promise<RepositoryBlobResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		await this.#initPromise;
		cleanupFilename(filename);
		throw 'code me';
		return { blob: null };
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		await this.#initPromise;
		const file = this.#zipEntries.get(cleanupFilename(filename));
		if (!file) {
			return { error: RepositoryError.FileNotFound };
		}
		return { json: JSON.parse(await file.text()) };
	}

	async getFileList(): Promise<RepositoryFileListResponse> {
		await this.#initPromise;
		const root = new RepositoryEntry(this, '', true, 0);
		for (const [filename, _] of this.#zipEntries) {
			root.addPath(filename);
		}
		return { root: root };
	}
}

function cleanupFilename(filename: string): string {
	filename = filename.toLowerCase().replaceAll('\\', '/');
	const arr = filename.split('/');

	return arr.filter((path) => path != '').join('/');
}
