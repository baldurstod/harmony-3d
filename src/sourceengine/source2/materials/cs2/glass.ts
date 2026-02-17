import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2CsgoGlass extends Source2Material{

	override get shaderSource(): string {
		return 'source2_vr_simple';//TODO: code proper shader
	}
}
Source2MaterialLoader.registerMaterial('csgo_glass.vfx', Source2CsgoGlass);
