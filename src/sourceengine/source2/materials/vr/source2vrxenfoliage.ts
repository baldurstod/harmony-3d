import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2VrXenFoliage extends Source2Material{

	get shaderSource() {
		return 'source2_vr_xen_foliage';
	}
}
Source2MaterialLoader.registerMaterial('vr_xen_foliage.vfx', Source2VrXenFoliage);
