import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2VrGlass extends Source2Material{

	override get shaderSource(): string {
		return 'source2_vr_glass';
	}
}
Source2MaterialLoader.registerMaterial('vr_glass.vfx', Source2VrGlass);
