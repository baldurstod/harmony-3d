import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2VrBlackUnlit extends Source2Material {

	override get shaderSource(): string {
		return 'source2_vr_black_unlit';
	}
}
Source2MaterialLoader.registerMaterial('vr_black_unlit.vfx', Source2VrBlackUnlit);
