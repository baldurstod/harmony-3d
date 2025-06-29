import { Vpk } from 'harmony-vpk';
import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryEntry, RepositoryError, RepositoryFileListResponse, RepositoryFileResponse, RepositoryFilter, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

export class VpkRepository implements Repository {
	#name: string;
	#vpk: Vpk;
	#initPromiseResolve?: (value: boolean) => void;
	#initPromise = new Promise(resolve => this.#initPromiseResolve = resolve);

	constructor(name: string, files: File[]) {
		this.#name = name;
		this.#vpk = new Vpk();

		(async () => {
			const error = await this.#vpk.setFiles(files);

			if (error) {
				this.#initPromiseResolve?.(false);
			} else {
				this.#initPromiseResolve?.(true);
			}
		})();
	}

	get name() {
		return this.#name;
	}

	async getFile(filename: string): Promise<RepositoryFileResponse> {
		await this.#initPromise;
		const response = await this.#vpk.getFile(cleanupFilename(filename));
		if (response.error) {
			return { error: RepositoryError.FileNotFound };
		}
		return { file: response.file };
	}

	async getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse> {
		await this.#initPromise;
		const response = await this.#vpk.getFile(cleanupFilename(filename));
		if (response.error) {
			return { error: RepositoryError.FileNotFound };
		}
		return { buffer: await response.file.arrayBuffer() };
	}

	async getFileAsText(filename: string): Promise<RepositoryTextResponse> {
		await this.#initPromise;
		const response = await this.#vpk.getFile(cleanupFilename(filename));
		if (response.error) {
			return { error: RepositoryError.FileNotFound };
		}
		return { text: await response.file.text() };
	}

	async getFileAsBlob(filename: string): Promise<RepositoryBlobResponse> {
		await this.#initPromise;
		const response = await this.#vpk.getFile(cleanupFilename(filename));
		if (response.error) {
			return { error: RepositoryError.FileNotFound };
		}
		return { blob: response.file };
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		await this.#initPromise;
		const response = await this.#vpk.getFile(cleanupFilename(filename));
		if (response.error) {
			return { error: RepositoryError.FileNotFound };
		}
		return { json: JSON.parse(await response.file.text()) };
	}

	async getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse> {
		await this.#initPromise;
		const root = new RepositoryEntry(this, '', true, 0);
		for (const filename of await this.#vpk.getFileList()) {
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
