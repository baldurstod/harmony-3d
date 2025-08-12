import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2StickersMaterial extends Source2Material {// TODO: code me

	get shaderSource() {
		return 'source2_stickers';
	}
}
Source2MaterialLoader.registerMaterial('stickers.vfx', Source2StickersMaterial);
