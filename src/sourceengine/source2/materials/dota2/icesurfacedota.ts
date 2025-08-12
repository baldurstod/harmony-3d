import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2IceSurfaceDotaMaterial extends Source2Material {// TODO: code me

	get shaderSource() {
		return 'source2_ice_surface_dota';
	}
}
Source2MaterialLoader.registerMaterial('ice_surface_dota.vfx', Source2IceSurfaceDotaMaterial);
