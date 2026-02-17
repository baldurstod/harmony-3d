import { Source2MaterialLoader } from '../../loaders/source2materialloader';
import { Source2Material } from '../source2material';

export class Source2VrXenFoliage extends Source2Material {

	override get shaderSource(): string {
		return 'source2_vr_xen_foliage';
	}
}
Source2MaterialLoader.registerMaterial('vr_xen_foliage.vfx', Source2VrXenFoliage);
