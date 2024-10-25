import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2CsgoSimple extends Source2Material{

	get shaderSource() {
		return 'source2_vr_simple';//TODO: code proper shader
	}
}
Source2MaterialLoader.registerMaterial('csgo_simple.vfx', Source2CsgoSimple);
