import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2CsgoStaticOverlay extends Source2Material{

	override get shaderSource(): string {
		return 'source2_hero';//TODO: code proper shader
	}
}
Source2MaterialLoader.registerMaterial('csgo_static_overlay.vfx', Source2CsgoStaticOverlay);
