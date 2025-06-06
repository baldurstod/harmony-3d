export enum RepositoryError {
	FileNotFound = 1,
	UnknownError,
	NotSupported,
	RepoNotFound,
}

export type RepositoryFileResponse = { file?: File | null, error?: RepositoryError };
export type RepositoryArrayBufferResponse = { buffer?: ArrayBuffer | null, error?: RepositoryError };
export type RepositoryTextResponse = { text?: string | null, error?: RepositoryError };
export type RepositoryBlobResponse = { blob?: Blob | null, error?: RepositoryError };
export type RepositoryJsonResponse = { json?: JSON | null, error?: RepositoryError };
export type RepositoryFileListResponse = { root?: RepositoryEntry, error?: RepositoryError };

export type RepositoryFilter = { name?: string | RegExp, extension?: string | RegExp, directories?: boolean, files?: boolean };

export interface Repository {
	name: string;
	getFile: (filepath: string) => Promise<RepositoryFileResponse>;
	getFileAsArrayBuffer: (filepath: string) => Promise<RepositoryArrayBufferResponse>;
	getFileAsText: (filepath: string) => Promise<RepositoryTextResponse>;
	getFileAsBlob: (filepath: string) => Promise<RepositoryBlobResponse>;
	getFileAsJson: (filepath: string) => Promise<RepositoryJsonResponse>;
	getFileList: (filter?: RepositoryFilter) => Promise<RepositoryFileListResponse>;
}

export class RepositoryEntry {
	#repository: Repository;
	#name: string;
	#childs = new Map<string, RepositoryEntry>;
	#isDirectory: boolean;
	#parent?: RepositoryEntry;

	constructor(repository: Repository, name: string, isDirectory: boolean) {
		this.#repository = repository;
		this.#name = name;
		this.#isDirectory = isDirectory;
	}

	addEntry(filename: string): void {
		const splittedPath = filename.split(/[\/\\]+/);
		let current: RepositoryEntry = this;
		let len = splittedPath.length - 1;

		for (const [i, p] of splittedPath.entries()) {
			if (!current.#childs.has(p)) {
				current = current.#addFile(p, i != len);
			} else {
				current = current.#childs.get(p) as RepositoryEntry;
			}
		}
	}

	#addFile(name: string, isDirectory: boolean) {
		const e = new RepositoryEntry(this.#repository, name, isDirectory);
		e.#parent = this;
		this.#childs.set(name, e);
		return e;
	}

	getName(): string {
		return this.#name;
	}

	getFullName(): string {
		let name = '';
		if (this.#parent) {
			name = this.#parent.getFullName();
		}
		name += this.#name;
		if (this.#isDirectory && this.#parent) {
			name += '/';
		}
		return name;
	}

	getParent(): RepositoryEntry | undefined {
		return this.#parent;
	}

	getRepository(): Repository {
		return this.#repository;
	}

	getChild(name: string): RepositoryEntry | undefined {
		return this.#childs.get(name);
	}

	getChilds(): Set<RepositoryEntry> {
		return new Set(this.#childs.values());
	}

	getAllChilds(filter?: RepositoryFilter): Set<RepositoryEntry> {
		const childs = new Set<RepositoryEntry>();
		let current: RepositoryEntry | undefined;
		const stack: Array<RepositoryEntry> = [this];
		do {
			current = stack.pop();
			if (current && !childs.has(current)) {
				if ((filter === undefined) || current.#matchFilter(filter)) {
					childs.add(current);
				}
				for (const [_, child] of current.#childs) {
					stack.push(child);
				}
			}
		} while (current);

		return childs;
	}

	#matchFilter(filter: RepositoryFilter): boolean {
		if (filter.directories !== undefined && filter.directories != this.#isDirectory) {
			return false;
		}

		if (filter.files !== undefined && filter.files == this.#isDirectory) {
			return false;
		}

		const { name, extension } = splitFilename(this.#name);

		if (filter.extension && !this.#isDirectory && !match(extension, filter.extension)) {
			return false;
		}

		if (filter.name && !match(name, filter.name)) {
			return false;
		}

		return true;
	}

	isDirectory(): boolean {
		return this.#isDirectory;
	}

	toJSON(): JSON {
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

	merge(other: RepositoryEntry) {
		if (this.#isDirectory != other.#isDirectory || this.#name != other.#name) {
			return;
		}

		for (const [name, entry] of other.#childs) {
			if (this.#childs.has(name)) {
				this.#childs.get(name)?.merge(entry);
			} else {
				this.#childs.set(name, entry);
			}
		}
	}
}

function splitFilename(filename: string): { name: string, extension: string } {
	const pos = filename.lastIndexOf('.');
	if (pos < 1) {
		// No dot found or dot in first position
		return { name: filename, extension: '' };
	}

	return { name: filename.substring(0, pos), extension: filename.substring(pos + 1) };
}

function match(name: string, filter: string | RegExp): boolean {
	if (typeof filter == 'string') {
		return filter == name;
	} else {
		//regex
		return (filter as RegExp).exec(name) != null;
	}
}
