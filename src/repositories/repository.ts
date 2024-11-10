export enum RepositoryError {
	Ok = 0,
	FileNotFound,
}

export type RepositoryArrayBufferResponse = { file: ArrayBuffer | null, error?: RepositoryError };
export type RepositoryStringResponse = { file: string | null, error?: RepositoryError };
export type RepositoryBlobResponse = { file: Blob | null, error?: RepositoryError };

export interface Repository {
	name: string;
	getFile: (filepath: string) => Promise<RepositoryArrayBufferResponse>;
	getFileAsText: (filepath: string) => Promise<RepositoryStringResponse>;
	getFileAsBlob: (filepath: string) => Promise<RepositoryBlobResponse>;
}
