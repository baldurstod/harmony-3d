import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2CablesMaterial extends Source2Material {// TODO: code me

	get shaderSource() {
		return 'source2_cables';
	}
}
Source2MaterialLoader.registerMaterial('cables.vfx', Source2CablesMaterial);
