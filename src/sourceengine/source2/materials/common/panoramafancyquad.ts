import { Source2MaterialLoader } from '../../loaders/source2materialloader';
import { Source2Material } from '../source2material';

// deadlock/core materials/panorama/panorama_fancyquad.vmat_c
export class Source2PanoramaFancyQuad extends Source2Material {// TODO: code me

	get shaderSource() {
		return 'source2_sky';// TODO: create shader
	}
}
Source2MaterialLoader.registerMaterial('panorama_fancyquad.vfx', Source2PanoramaFancyQuad);
