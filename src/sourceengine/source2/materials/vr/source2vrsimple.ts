import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2VrSimple extends Source2Material {

	get shaderSource() {
		return 'source2_vr_simple';
	}
}
Source2MaterialLoader.registerMaterial('vr_simple.vfx', Source2VrSimple);
Source2MaterialLoader.registerMaterial('vr_simple_2layer_parallax.vfx', Source2VrSimple);//TODO : create own material
