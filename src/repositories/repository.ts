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
	name: string;
	active: boolean;
	getFile: (path: string) => Promise<RepositoryFileResponse>;
	getFileAsArrayBuffer: (path: string) => Promise<RepositoryArrayBufferResponse>;
	getFileAsText: (path: string) => Promise<RepositoryTextResponse>;
	getFileAsBlob: (path: string) => Promise<RepositoryBlobResponse>;
	getFileAsJson: (path: string) => Promise<RepositoryJsonResponse>;
	getFileList: () => Promise<RepositoryFileListResponse>;
}
