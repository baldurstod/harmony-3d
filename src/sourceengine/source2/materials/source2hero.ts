import { Source2Material } from './source2material';
import { Source2MaterialLoader } from '../loaders/source2materialloader';

export class Source2Hero extends Source2Material{
	constructor(repository, source2File = Object.create(null)) {//fixme
		super(repository, source2File);
	}

	get shaderSource() {
		return 'source2_hero';
	}
}
Source2MaterialLoader.registerMaterial('hero.vfx', Source2Hero);
