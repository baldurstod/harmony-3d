import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2CsgoEffects extends Source2Material{

	get shaderSource() {
		return 'source2_hero';//TODO: code proper shader
	}
}
Source2MaterialLoader.registerMaterial('csgo_effects.vfx', Source2CsgoEffects);
