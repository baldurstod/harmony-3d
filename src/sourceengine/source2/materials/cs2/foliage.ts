import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2CsgoFoliage extends Source2Material{

	override get shaderSource(): string {
		return 'source2_vr_xen_foliage';//TODO: code proper shader
	}
}
Source2MaterialLoader.registerMaterial('csgo_foliage.vfx', Source2CsgoFoliage);
