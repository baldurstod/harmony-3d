import { Repositories } from '../../../misc/repositories';
import { customFetch } from '../../../utils/customfetch';

export class SourceBinaryLoader {
	repository: string;
	async load(repositoryName, fileName) {
		this.repository = repositoryName;
		const repository = Repositories.getRepository(repositoryName);
		if (!repository) {
			console.error(`Unknown repository ${repositoryName} in SourceBinaryLoader.load`);
			return null;
		}

		let promise = new Promise(resolve => {
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
		const repository = Repositories.getRepository(repositoryName);
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

	parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer) {
	}
}
