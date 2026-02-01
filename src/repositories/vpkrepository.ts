import { Vpk } from 'harmony-vpk';
import { checkRepositoryName, Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFileResponse, RepositoryJsonResponse, RepositoryTextResponse } from './repository';
import { RepositoryEntry } from './repositoryentry';

export class VpkRepository implements Repository {
	#name: string;
	#vpk: Vpk = new Vpk();
	#initPromiseResolve?: (value: boolean) => void;
	#initPromise = new Promise(resolve => this.#initPromiseResolve = resolve);
	active: boolean = true;

	constructor(name: string, files: File[]) {
		checkRepositoryName(name);
		this.#name = name;

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
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		await this.#initPromise;
		const response = await this.#vpk.getFile(cleanupFilename(filename));
		if (response.error) {
			return { error: RepositoryError.FileNotFound };
		}
		return { file: response.file };
	}

	async getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		await this.#initPromise;
		const response = await this.#vpk.getFile(cleanupFilename(filename));
		if (response.error) {
			return { error: RepositoryError.FileNotFound };
		}
		return { buffer: await response.file!.arrayBuffer() };
	}

	async getFileAsText(filename: string): Promise<RepositoryTextResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		await this.#initPromise;
		const response = await this.#vpk.getFile(cleanupFilename(filename));
		if (response.error) {
			return { error: RepositoryError.FileNotFound };
		}
		return { text: await response.file!.text() };
	}

	async getFileAsBlob(filename: string): Promise<RepositoryBlobResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		await this.#initPromise;
		const response = await this.#vpk.getFile(cleanupFilename(filename));
		if (response.error) {
			return { error: RepositoryError.FileNotFound };
		}
		return { blob: response.file };
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		await this.#initPromise;
		const response = await this.#vpk.getFile(cleanupFilename(filename));
		if (response.error) {
			return { error: RepositoryError.FileNotFound };
		}
		return { json: JSON.parse(await response.file!.text()) };
	}

	async getFileList(): Promise<RepositoryFileListResponse> {
		await this.#initPromise;
		const root = new RepositoryEntry(this, '', true, 0);
		for (const filename of await this.#vpk.getFileList()) {
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
