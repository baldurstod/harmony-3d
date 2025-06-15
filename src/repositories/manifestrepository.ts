import { getLoader } from '../loaders/loaderfactory';
import { SourceEnginePCFLoader } from '../sourceengine/export';
import { SourcePCF } from '../sourceengine/source1/loaders/sourcepcf';
import { OverrideRepository } from './overriderepository';
import { Repository, RepositoryArrayBufferResponse, RepositoryBlobResponse, RepositoryError, RepositoryFileListResponse, RepositoryFileResponse, RepositoryFilter, RepositoryJsonResponse, RepositoryTextResponse } from './repository';

export class ManifestRepository implements Repository {
	#base: OverrideRepository;

	constructor(base: Repository) {
		this.#base = new OverrideRepository(base);
	}

	get name() {
		return this.#base.name;
	}

	async getFile(filename: string): Promise<RepositoryFileResponse> {
		return this.#base.getFile(filename);
	}

	async getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse> {
		return this.#base.getFileAsArrayBuffer(filename);
	}

	async getFileAsText(filename: string): Promise<RepositoryTextResponse> {
		return this.#base.getFileAsText(filename);
	}

	async getFileAsBlob(filename: string): Promise<RepositoryBlobResponse> {
		return this.#base.getFileAsBlob(filename);
	}

	async getFileAsJson(filename: string): Promise<RepositoryJsonResponse> {
		return this.#base.getFileAsJson(filename);
	}

	async getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse> {
		return this.#base.getFileList(filter);
	}

	async generateModelManifest(name = 'models_manifest.json', filter?: RepositoryFilter): Promise<RepositoryError | null> {
		const response = await this.#base.getFileList(filter);
		if (response.error) {
			return response.error;
		}

		const json = response.root!.toJSON();

		this.#base.overrideFile(name, new File([JSON.stringify(json)], name));

		return null;
	}

	async generateParticlesManifest(filename = 'particles/manifest.json', filter?: RepositoryFilter): Promise<RepositoryError | null> {
		const response = await this.#base.getFileList(filter);
		if (response.error) {
			return response.error;
		}

		const files = response.root!.getAllChilds({ extension: 'pcf', directories: false });

		const manifestFiles = [];
		for (const file of files) {
			const pcfLoader = getLoader('SourceEnginePCFLoader') as typeof SourceEnginePCFLoader;
			const pcf = await new pcfLoader().load(this.name, file.getFullName()) as SourcePCF;

			const systems: string[] = [];
			for (const name in pcf.systems) {
				systems.push(name);
			}

			manifestFiles.push({
				name: file.getName(),
				particlesystemdefinitions: systems,
			});
		}
		this.#base.overrideFile(filename, new File([JSON.stringify({ files: manifestFiles })], filename));

		return null;
	}
}
