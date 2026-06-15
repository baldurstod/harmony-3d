import { JSONObject } from 'harmony-types';
import { customFetch } from '../utils/customfetch';
import { checkRepositoryName, Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryDir, RepositoryError, RepositoryFileListResponse, RepositoryFileResponse, RepositoryHasFileResponse, RepositoryJsonResponse, RepositoryProperty, RepositoryTextResponse } from './repository';
import { RepositoryEntry } from './repositoryentry';

function encodeHash(uri: string): string {
	return uri.replaceAll('#', '%23');
}

export class WebRepository implements Repository {
	readonly name: string;
	properties = new Map<string, RepositoryProperty>();
	readonly base: string;
	readonly useCacheApi: boolean;
	#cache?: Cache;
	active = true;
	#files?: RepositoryDir;
	// hasFile will return an error for unsupported extensions
	readonly supportedExtensions = new Set<string>();

	constructor(name: string, base: string, useCacheApi = false) {
		checkRepositoryName(name);
		this.name = name;
		this.base = base;
		this.useCacheApi = useCacheApi;
	}

	async getFile(fileName: string): Promise<RepositoryFileResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		const url = new URL(encodeHash(fileName), this.base);
		const response = await this.#fetch(url);
		if (response.ok) {
			return { file: new File([new Uint8Array(await response.arrayBuffer())], fileName) };
		} else {
			let error: RepositoryError = RepositoryError.UnknownError;
			if (response.status == 404) {
				error = RepositoryError.FileNotFound
			}
			return { error: error };
		}
	}

	async getFileAsArrayBuffer(fileName: string): Promise<RepositoryArrayBufferResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		const url = new URL(encodeHash(fileName), this.base);
		const response = await this.#fetch(url);
		if (response.ok) {
			return { buffer: await response.arrayBuffer() };
		} else {
			let error: RepositoryError = RepositoryError.UnknownError;
			if (response.status == 404) {
				error = RepositoryError.FileNotFound
			}
			return { error: error };
		}
	}

	async getFileAsText(fileName: string): Promise<RepositoryTextResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		const url = new URL(encodeHash(fileName), this.base);
		const response = await this.#fetch(url);
		if (response.ok) {
			return { text: await response.text() };
		} else {
			let error: RepositoryError = RepositoryError.UnknownError;
			if (response.status == 404) {
				error = RepositoryError.FileNotFound
			}
			return { error: error };
		}
	}

	async getFileAsBlob(fileName: string): Promise<RepositoryBlobResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		const url = new URL(encodeHash(fileName), this.base);
		const response = await this.#fetch(url);
		if (response.ok) {
			return { blob: new Blob([new Uint8Array(await response.arrayBuffer())]) };
		} else {
			let error: RepositoryError = RepositoryError.UnknownError;
			if (response.status == 404) {
				error = RepositoryError.FileNotFound
			}
			return { error: error };
		}
	}

	async getFileAsJson(fileName: string): Promise<RepositoryJsonResponse> {
		if (!this.active) {
			return { error: RepositoryError.RepoInactive };
		}
		const url = new URL(encodeHash(fileName), this.base);
		const response = await this.#fetch(url);
		if (response.ok) {
			return { json: await response.json() };
		} else {
			let error: RepositoryError = RepositoryError.UnknownError;
			if (response.status == 404) {
				error = RepositoryError.FileNotFound
			}
			return { error: error };
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async getFileList(): Promise<RepositoryFileListResponse> {
		if (!this.#files) {
			return { error: RepositoryError.Uninitialized };
		}

		const populateFiles = (level: JSONObject, path: string): void => {
			for (const segment in level) {
				const f = level[segment];
				if ((f as number) > 0) {
					root.addPath(path + segment);
				} else {
					populateFiles((f as JSONObject), path + segment + '/')
				}
			}
		}

		const root = new RepositoryEntry(this, '', true, 0);
		populateFiles(this.#files, '');
		return { root: root };
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async hasFile(path: string): Promise<RepositoryHasFileResponse> {
		if (!this.supportedExtensions.size) {
			// If no extensions supported, return an error
			return { error: RepositoryError.NotSupported };
		}

		// Check for supported extensions
		let found = false;
		for (const ext of this.supportedExtensions) {
			if (path.toLowerCase().endsWith(ext)) {
				found = true;
				break;
			}
		}

		if (!found) {
			// File extension is not supported
			return { error: RepositoryError.NotSupported };
		}

		if (!this.#files) {
			return { error: RepositoryError.Uninitialized };
		}

		const split = path.split('/');
		let current: RepositoryDir | number = this.#files;
		for (const segment of split) {
			if (typeof current === 'number') {
				// We have a file but need another segment
				return { exist: false };
			}
			const sub: RepositoryDir | number | undefined = current[segment];
			if (sub === undefined) {
				// Segment not found
				return { exist: false };
			}

			current = sub;
		}

		return { exist: true };
	}

	setFiles(files: RepositoryDir): void {
		this.#files = structuredClone(files);
	}

	async #fetch(url: URL): Promise<Response> {
		if (!this.useCacheApi) {
			return await customFetch(url);
		} else {

			// Open the cache if it doesn't exist
			this.#cache = this.#cache ?? await caches.open('WebRepository');

			let response: Response | undefined = await this.#cache.match(url);
			if (!response) {
				// If cache miss, fetch the request
				response = await customFetch(url);
				this.#cache.put(url, response.clone());
			}

			return response;
		}
	}

	/**
	 * Delete an URL from the cache. Does nothing if caching is disabled
	 * @param url The url to delete
	 * @returns A promise resolving to void
	 */
	async delete(url: URL): Promise<void> {
		await this.#cache?.delete(url);
	}

	/**
	 * Purge the cache. Does nothing if caching is disabled
	 * @returns A promise resolving to void
	 */
	async purge(): Promise<void> {
		if (!this.#cache) {
			return;
		}

		for (const key of await this.#cache.keys()) {
			this.#cache.delete(key);
		}
	}
}
