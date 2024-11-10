export enum RepositoryError {
	FileNotFound = 1,
	UnknownError,
	NotSupported,
}

export type RepositoryArrayBufferResponse = { buffer?: ArrayBuffer | null, error?: RepositoryError };
export type RepositoryStringResponse = { string?: string | null, error?: RepositoryError };
export type RepositoryBlobResponse = { blob?: Blob | null, error?: RepositoryError };
export type RepositoryJsonResponse = { json?: JSON | null, error?: RepositoryError };
export type RepositoryFileListResponse = { root?: RepositoryDirectory, error?: RepositoryError };

export type RepositoryFilter = { extension?: string };

export type RepositoryDirectory = { name: string, childs: Array<RepositoryDirectory | RepositoryFile> };
export type RepositoryFile = { name: string };

export interface Repository {
	name: string;
	getFile: (filepath: string) => Promise<RepositoryArrayBufferResponse>;
	getFileAsText: (filepath: string) => Promise<RepositoryStringResponse>;
	getFileAsBlob: (filepath: string) => Promise<RepositoryBlobResponse>;
	getFileAsJson: (filepath: string) => Promise<RepositoryJsonResponse>;
	getFileList: (filter?: RepositoryFilter) => Promise<RepositoryFileListResponse>;
	overrideFile: (filepath: string, file: File) => Promise<RepositoryError>;
}
