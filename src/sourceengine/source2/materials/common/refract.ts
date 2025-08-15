import { Source2MaterialLoader } from '../../loaders/source2materialloader';
import { Source2Material } from '../source2material';

export class Source2RefractMaterial extends Source2Material {// TODO: code me

	get shaderSource() {
		return 'source2_refract';
	}
}
Source2MaterialLoader.registerMaterial('refract.vfx', Source2RefractMaterial);
