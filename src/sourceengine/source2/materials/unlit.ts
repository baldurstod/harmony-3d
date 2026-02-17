import { Source2Material } from './source2material';
import { Source2MaterialLoader } from '../loaders/source2materialloader';

export class Source2Unlit extends Source2Material{
	override get shaderSource(): string {
		return 'source2_hero';//TODO: code proper shader
	}
}
Source2MaterialLoader.registerMaterial('unlit.vfx', Source2Unlit);
