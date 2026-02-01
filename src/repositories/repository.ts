import { RepositoryEntry } from './repositoryentry';

export enum RepositoryError {
	FileNotFound = 1,
	UnknownError,
	NotSupported,
	RepoNotFound,
	RepoInactive,
}

export interface RepositoryFileResponse { file?: File | null, error?: RepositoryError }
export interface RepositoryArrayBufferResponse { buffer?: ArrayBuffer | null, error?: RepositoryError }
export interface RepositoryTextResponse { text?: string | null, error?: RepositoryError }
export interface RepositoryBlobResponse { blob?: Blob | null, error?: RepositoryError }
export interface RepositoryJsonResponse { json?: JSON | null, error?: RepositoryError }
export interface RepositoryFileListResponse { root?: RepositoryEntry, error?: RepositoryError }

export interface Repository {
	// Repository name. Authorized characters are a-z, A-Z, 0-9 and _
	name: string;
	active: boolean;
	getFile: (path: string) => Promise<RepositoryFileResponse>;
	getFileAsArrayBuffer: (path: string) => Promise<RepositoryArrayBufferResponse>;
	getFileAsText: (path: string) => Promise<RepositoryTextResponse>;
	getFileAsBlob: (path: string) => Promise<RepositoryBlobResponse>;
	getFileAsJson: (path: string) => Promise<RepositoryJsonResponse>;
	getFileList: () => Promise<RepositoryFileListResponse>;
}

export function checkRepositoryName(name: string): void {
	if (!/^[a-zA-Z0-9_]+$/.test(name)) {
		throw new Error('Repository name must contain only [a-zA-Z0-9_]');
	}
}
