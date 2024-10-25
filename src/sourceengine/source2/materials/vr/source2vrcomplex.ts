import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2VrComplex extends Source2Material {

	get shaderSource() {
		return 'source2_vr_complex';
	}
}
Source2MaterialLoader.registerMaterial('vr_complex.vfx', Source2VrComplex);
