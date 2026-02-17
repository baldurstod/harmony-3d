import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2VrSimple2WayBlend extends Source2Material{

	override get shaderSource(): string {
		return 'source2_vr_simple_2way_blend';
	}
}
Source2MaterialLoader.registerMaterial('vr_simple_2way_blend.vfx', Source2VrSimple2WayBlend);
