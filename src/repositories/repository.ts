export enum RepositoryError {
	FileNotFound = 1,
	UnknownError,
	NotSupported,
	RepoNotFound,
}

export interface RepositoryFileResponse { file?: File | null, error?: RepositoryError }
export interface RepositoryArrayBufferResponse { buffer?: ArrayBuffer | null, error?: RepositoryError }
export interface RepositoryTextResponse { text?: string | null, error?: RepositoryError }
export interface RepositoryBlobResponse { blob?: Blob | null, error?: RepositoryError }
export interface RepositoryJsonResponse { json?: JSON | null, error?: RepositoryError }
export interface RepositoryFileListResponse { root?: RepositoryEntry, error?: RepositoryError }

export interface RepositoryFilter { name?: string | RegExp, extension?: string | RegExp, directories?: boolean, files?: boolean, maxDepth?: number }

export interface Repository {
	name: string;
	getFile: (path: string) => Promise<RepositoryFileResponse>;
	getFileAsArrayBuffer: (path: string) => Promise<RepositoryArrayBufferResponse>;
	getFileAsText: (path: string) => Promise<RepositoryTextResponse>;
	getFileAsBlob: (path: string) => Promise<RepositoryBlobResponse>;
	getFileAsJson: (path: string) => Promise<RepositoryJsonResponse>;
	getFileList: () => Promise<RepositoryFileListResponse>;
}

export class RepositoryEntry {
	#repository: Repository;
	#name: string;
	#childs = new Map<string, RepositoryEntry>;
	#isDirectory: boolean;
	#parent?: RepositoryEntry;
	#depth: number;

	constructor(repository: Repository, name: string, isDirectory: boolean, depth: number) {
		this.#repository = repository;
		this.#name = name;
		this.#isDirectory = isDirectory;
		this.#depth = depth;
	}

	addPath(path: string): void {
		const splittedPath = path.split(/[\/\\]+/);
		let current: RepositoryEntry = this;
		const len = splittedPath.length - 1;

		for (const [i, p] of splittedPath.entries()) {
			const currentChild = current.#childs.get(p);
			if (!currentChild) {
				current = current.#addFile(p, i != len, i);
			} else {
				current = currentChild as RepositoryEntry;
			}
		}
	}

	removeEntry(name: string) {
		this.#childs.delete(name);
	}

	#addFile(name: string, isDirectory: boolean, depth: number) {
		const e = new RepositoryEntry(this.#repository, name, isDirectory, depth);
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

	*getChilds(filter?: RepositoryFilter): Generator<RepositoryEntry, null, undefined> {
		for (const [_, child] of this.#childs) {
			if (!filter || child.#matchFilter(filter)) {
				yield child;
			}
		}
		return null;
	}

	getAllChilds(filter?: RepositoryFilter): Set<RepositoryEntry> {
		const childs = new Set<RepositoryEntry>();
		let current: RepositoryEntry | undefined;
		const stack: RepositoryEntry[] = [this];
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

		if (filter.maxDepth !== undefined && this.#depth > filter.maxDepth) {
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
			const files: any[] = [];
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
