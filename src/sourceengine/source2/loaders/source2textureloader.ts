import { Source2Texture } from '../textures/source2texture';
import { Source2FileLoader } from './source2fileloader';

export const Source2TextureLoader = new (function () {
	class Source2TextureLoader {

		async load(repository: string, path: string): Promise<Source2Texture | null> {

			path = path.replace(/.vtex_c/, '');
			return await new Source2FileLoader(true).load(repository, path + '.vtex_c') as unknown as Promise<Source2Texture | null>;
		}
	}
	return Source2TextureLoader;
}());
