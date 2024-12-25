import { Source2FileLoader } from './source2fileloader';
import { DEBUG, VERBOSE, WARN } from '../../../buildoptions';

export const Source2TextureLoader = new (function () {
	class Source2TextureLoader {
		constructor() {
		}

		load(repository: string, fileName: string) {
			let promise = new Promise((resolve, reject) => {
				fileName = fileName.replace(/.vtex_c/, '');
				let vtexPromise = new Source2FileLoader(true).load(repository, fileName + '.vtex_c');
				vtexPromise.then(
					(source2File) => {
						//let texture = this._loadTexture(repository, source2File);
						if (VERBOSE) {
							console.log(source2File);
						}
						resolve(source2File);
						/*if (texture) {
							resolve(texture);
						} else {
							reject(source2File);
						}*/
					}
				).catch(
					(error) => {
						if (WARN) {
							console.warn(`Error initializing texture : ${repository}${fileName}, reason : ${error}`);
						}
						reject(error);
					}
				)
			});
			return promise;
		}
	}
	return Source2TextureLoader;
}());
