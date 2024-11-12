export enum RepositoryError {
	FileNotFound = 1,
	UnknownError,
	NotSupported,
}

export type RepositoryArrayBufferResponse = { buffer?: ArrayBuffer | null, error?: RepositoryError };
export type RepositoryTextResponse = { text?: string | null, error?: RepositoryError };
export type RepositoryBlobResponse = { blob?: Blob | null, error?: RepositoryError };
export type RepositoryJsonResponse = { json?: JSON | null, error?: RepositoryError };
export type RepositoryFileListResponse = { root?: RepositoryEntry, error?: RepositoryError };

export type RepositoryFilter = { extension?: string };

export interface Repository {
	name: string;
	getFile: (filepath: string) => Promise<RepositoryArrayBufferResponse>;
	getFileAsText: (filepath: string) => Promise<RepositoryTextResponse>;
	getFileAsBlob: (filepath: string) => Promise<RepositoryBlobResponse>;
	getFileAsJson: (filepath: string) => Promise<RepositoryJsonResponse>;
	getFileList: (filter?: RepositoryFilter) => Promise<RepositoryFileListResponse>;
}

export class RepositoryEntry {
	#name: string;
	#childs = new Map<string, RepositoryEntry>;
	#isDirectory: boolean;
	#parent?: RepositoryEntry;

	constructor(name: string, isDirectory: boolean) {
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
		const e = new RepositoryEntry(name, isDirectory);
		e.#parent = this;
		this.#childs.set(name, e);
		return e;
	}

	getName(): string {
		return this.#name;
	}

	getParent(): RepositoryEntry | undefined {
		return this.#parent;
	}

	getChild(name: string): RepositoryEntry | undefined {
		return this.#childs.get(name);
	}

	getChilds(): Set<RepositoryEntry> {
		return new Set(this.#childs.values());
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
}
