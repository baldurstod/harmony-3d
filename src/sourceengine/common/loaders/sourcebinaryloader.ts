import { Repositories } from '../../../repositories/repositories';
import { SourceBSP } from '../../source1/loaders/sourcebsp';
import { SourceMdl } from '../../source1/loaders/sourcemdl';
import { SourcePCF } from '../../source1/loaders/sourcepcf';
import { SourceVtx } from '../../source1/loaders/sourcevtx';
import { SourceVvd } from '../../source1/loaders/sourcevvd';
import { Source1Vtf } from '../../source1/textures/source1vtf';
import { Source2File } from '../../source2/loaders/source2file';

export class SourceBinaryLoader {
	repository = '';

	async load(repositoryName: string, fileName: string): Promise<Source2File | SourceMdl | SourceVvd | SourceVtx | SourceBSP | SourcePCF | Source1Vtf | null> {
		this.repository = repositoryName;

		const promise = new Promise<Source2File | any>(resolve => {
			const p = Repositories.getFileAsArrayBuffer(repositoryName, fileName);
			p.then((response) => {
				if (!response.error) {
					resolve(this.parse(repositoryName, fileName, response.buffer!));
				} else {
					resolve(null);
				}
			});
		});
		return promise;
	}

	parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer): Promise<Source2File | any/*TODO: fix that*/> | SourceVvd | SourceVtx | Source1Vtf | SourcePCF | SourceMdl | SourceBSP | null {
		throw 'override me';
	}
}
