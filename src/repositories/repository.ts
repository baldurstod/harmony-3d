import { RepositoryEntry } from './repositoryentry';

export enum RepositoryError {
	FileNotFound = 1,
	UnknownError,
	// Method not supported by the repository
	NotSupported,
	// The repository have to be initialized before using this method. Initialization is repository specific
	Uninitialized,
	RepoNotFound,
	RepoInactive,
}

export interface RepositoryFileResponse { file?: File | null, error?: RepositoryError }
export interface RepositoryArrayBufferResponse { buffer?: ArrayBuffer | null, error?: RepositoryError }
export interface RepositoryTextResponse { text?: string | null, error?: RepositoryError }
export interface RepositoryBlobResponse { blob?: Blob | null, error?: RepositoryError }
export interface RepositoryJsonResponse { json?: JSON | null, error?: RepositoryError }
export interface RepositoryFileListResponse { root?: RepositoryEntry, error?: RepositoryError }
export interface RepositoryHasFileResponse { exist?: boolean, error?: RepositoryError }

export type RepositoryProperty = any;

export interface Repository {
	// Repository name. Authorized characters are a-z, A-Z, 0-9 and _
	name: string;
	properties: Map<string, RepositoryProperty>;
	active: boolean;
	getFile: (path: string) => Promise<RepositoryFileResponse>;
	getFileAsArrayBuffer: (path: string) => Promise<RepositoryArrayBufferResponse>;
	getFileAsText: (path: string) => Promise<RepositoryTextResponse>;
	getFileAsBlob: (path: string) => Promise<RepositoryBlobResponse>;
	getFileAsJson: (path: string) => Promise<RepositoryJsonResponse>;
	getFileList: () => Promise<RepositoryFileListResponse>;
	hasFile: (path: string) => Promise<RepositoryHasFileResponse>;
}

export function checkRepositoryName(name: string): void {
	if (!/^[a-zA-Z0-9_]+$/.test(name)) {
		throw new Error('Repository name must contain only [a-zA-Z0-9_]');
	}
}

export function sanitizeRepositoryName(name: string): string {
	return name.replace(/[^a-zA-Z0-9_]/g, '_');
}

export function cleanupFilename(filename: string): string {
	filename = filename.toLowerCase().replaceAll('\\', '/');
	const arr = filename.split('/');

	return arr.filter((path) => path != '').join('/');
}

export type RepositoryDir = {
	[key: string]: RepositoryDir | number;
}

export type RepositoryFileList = RepositoryDir
