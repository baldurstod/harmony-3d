import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2VrEyeball extends Source2Material {

	override get shaderSource(): string {
		return 'source2_vr_eyeball';
	}
}
Source2MaterialLoader.registerMaterial('vr_eyeball.vfx', Source2VrEyeball);
