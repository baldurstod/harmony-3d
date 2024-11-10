import { Repositories } from '../../../repositories/repositories';
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

		let promise = new Promise<Source2File | any>(resolve => {
			const p = new Repositories().getFile(repositoryName, fileName);
			p.then((arrayBuffer) => {
				if (arrayBuffer) {
					resolve(this.parse(repositoryName, fileName, arrayBuffer));
				} else {
					resolve(null);
				}
			});
		});
		return promise;
	}

	parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer): Promise<Source2File | any> | SourceVVD | SourceVTX | SourceEngineVTF | SourcePCF | SourceMDL | SourceBSP {
		throw 'override me';
	}
}
