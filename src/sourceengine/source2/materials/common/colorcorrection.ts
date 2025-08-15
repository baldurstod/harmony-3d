import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

//materials/colorwarps/dota_reef_dead.vmat_c
export class Source2ColorCorrection extends Source2Material {// TODO: code me

	get shaderSource() {
		return 'source2_colorcorrection';
	}
}
Source2MaterialLoader.registerMaterial('colorcorrection.vfx', Source2ColorCorrection);
