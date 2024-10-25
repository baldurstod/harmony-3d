import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2CsgoEnvironment extends Source2Material{

	get shaderSource() {
		return 'source2_csgo_environment';
	}
}
Source2MaterialLoader.registerMaterial('csgo_environment.vfx', Source2CsgoEnvironment);
