import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2ProjectedDotaMaterial extends Source2Material {// TODO: code me

	get shaderSource() {
		return 'source2_projected_dota';
	}
}
Source2MaterialLoader.registerMaterial('projected_dota.vfx', Source2ProjectedDotaMaterial);
