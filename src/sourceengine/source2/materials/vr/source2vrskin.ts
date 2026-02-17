import { Source2MaterialLoader } from '../../loaders/source2materialloader';
import { Source2Material } from '../source2material';

export class Source2VrSkin extends Source2Material {

	override get shaderSource(): string {
		return 'source2_vr_skin';
	}
}
Source2MaterialLoader.registerMaterial('vr_skin.vfx', Source2VrSkin);
