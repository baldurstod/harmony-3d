import { Source2MaterialLoader } from '../../loaders/source2materialloader';
import { Source2Material } from '../source2material';

// deadlock/core materials/grass/grasstile.vmat_c
export class Source2GrassTile extends Source2Material {// TODO: code me

	get shaderSource() {
		return 'source2_sky';// TODO: create shader
	}
}
Source2MaterialLoader.registerMaterial('grasstile.vfx', Source2GrassTile);
