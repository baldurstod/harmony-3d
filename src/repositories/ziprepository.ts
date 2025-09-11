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
		const file = this.#zipEntries.get(cleanupFilename(filename));
		if (!file) {
			return { error: RepositoryError.FileNotFound };
		}
		return { file: file };
	}

	async getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse> {
		const response = await this.getFile(filename);
		if (response.error) {
			return { error: response.error };
		}
		return { buffer: await response.file!.arrayBuffer() };
	}

	async getFileAsText(filename: string): Promise<RepositoryTextResponse> {
		const response = await this.getFile(filename);
		if (response.error) {
			return { error: response.error };
		}
		return { text: await response.file!.text() };
	}

	async getFileAsBlob(filename: string): Promise<RepositoryBlobResponse> {
		const response = await this.getFile(filename);
		if (response.error) {
			return { error: response.error };
		}
		return { blob: await response.file };
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		const response = await this.getFile(filename);
		if (response.error) {
			return { error: response.error };
		}
		return { json: JSON.parse(await response.file!.text()) };
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
