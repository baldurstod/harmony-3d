import { Repositories } from '../../../misc/repositories';
import { customFetch } from '../../../utils/customfetch';
import { SourceBSP } from '../../source1/loaders/sourcebsp';
import { SourceMDL } from '../../source1/loaders/sourcemdl';
import { SourcePCF } from '../../source1/loaders/sourcepcf';
import { SourceVTX } from '../../source1/loaders/sourcevtx';
import { SourceVVD } from '../../source1/loaders/sourcevvd';
import { SourceEngineVTF } from '../../source1/textures/sourceenginevtf';
import { Source2File } from '../../source2/loaders/source2file';

export class SourceBinaryLoader {
	repository: string;
	async load(repositoryName: string, fileName: string): Promise<Source2File | any> {
		this.repository = repositoryName;
		const repository = new Repositories().getRepository(repositoryName);
		if (!repository) {
			console.error(`Unknown repository ${repositoryName} in SourceBinaryLoader.load`);
			return null;
		}

		let promise = new Promise<Source2File | any>(resolve => {
			customFetch(new URL(fileName, repository.base)).then(
				async response => {
					if (response?.ok) {
						resolve(this.parse(repositoryName, fileName, await response.arrayBuffer()));
					} else {
						resolve(null);
					}
				},
				(error) => { console.error(error); resolve(null); }
			);
		});
		return promise;
	}

	async load2(repositoryName, fileName) {
		this.repository = repositoryName;
		const repository = new Repositories().getRepository(repositoryName);
		if (!repository) {
			console.error(`Unknown repository ${repositoryName} in SourceBinaryLoader.load2`);
			return null;
		}

		const response = await customFetch(new URL(fileName, repository.base));

		if (response.ok) {
			return this.parse(repositoryName, fileName, await response.arrayBuffer());
		}
		return null;
	}

	parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer): Promise<Source2File | any> | SourceVVD | SourceVTX | SourceEngineVTF | SourcePCF | SourceMDL | SourceBSP {
		throw 'override me';
	}
}
