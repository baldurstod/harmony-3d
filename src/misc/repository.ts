export interface Repository {
	name: string;
	getFile: (filepath: string) => Promise<ArrayBuffer | null>;
}
