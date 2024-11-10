export enum RepositoryError {
	FileNotFound = 1,
	UnknownError,
}

export type RepositoryArrayBufferResponse = { buffer?: ArrayBuffer | null, error?: RepositoryError };
export type RepositoryStringResponse = { string?: string | null, error?: RepositoryError };
export type RepositoryBlobResponse = { blob?: Blob | null, error?: RepositoryError };

export interface Repository {
	name: string;
	getFile: (filepath: string) => Promise<RepositoryArrayBufferResponse>;
	getFileAsText: (filepath: string) => Promise<RepositoryStringResponse>;
	getFileAsBlob: (filepath: string) => Promise<RepositoryBlobResponse>;
}
