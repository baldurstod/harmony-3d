import { Source2Material } from './source2material';
import { Source2MaterialLoader } from '../loaders/source2materialloader';

export class Source2SpringMeteor extends Source2Material {

	override get shaderSource(): string {
		return 'source2_spring_meteor';
	}
}
Source2MaterialLoader.registerMaterial('spring_meteor.vfx', Source2SpringMeteor);
