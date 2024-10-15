import { Source2Material } from './source2material';
import { Source2MaterialLoader } from '../loaders/source2materialloader';

export class Source2HeroFluid extends Source2Material{

	get shaderSource() {
		return 'source2_hero_fluid';
	}
}
Source2MaterialLoader.registerMaterial('hero_fluid.vfx', Source2HeroFluid);
