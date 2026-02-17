import { Source2MaterialLoader } from '../../loaders/source2materialloader';
import { Source2Material } from '../source2material';

//materials/skybox/dota_secretshop_interior.vmat_c
export class Source2Sky extends Source2Material {// TODO: code me

	override get shaderSource(): string {
		return 'source2_sky';
	}
}
Source2MaterialLoader.registerMaterial('sky.vfx', Source2Sky);
