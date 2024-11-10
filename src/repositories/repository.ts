export interface Repository {
	name: string;
	getFile: (filepath: string) => Promise<ArrayBuffer | null>;
	getFileAsText: (filepath: string) => Promise<string | null>;
	getFileAsBlob: (filepath: string) => Promise<Blob | null>;
}
