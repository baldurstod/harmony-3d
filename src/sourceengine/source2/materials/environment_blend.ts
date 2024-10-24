import { Source2Material } from './source2material';
import { Source2MaterialLoader } from '../loaders/source2materialloader';

export class Source2EnvironmentBlend extends Source2Material{

	get shaderSource() {
		return 'source2_csgo_environment';
	}
}
Source2MaterialLoader.registerMaterial('environment_blend.vfx', Source2EnvironmentBlend);
Source2MaterialLoader.registerMaterial('environment_layer.vfx', Source2EnvironmentBlend);//TODO: proper material
