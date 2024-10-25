import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2VrSkin extends Source2Material {

	get shaderSource() {
		return 'source2_vr_skin';
	}
}
Source2MaterialLoader.registerMaterial('vr_skin.vfx', Source2VrSkin);
