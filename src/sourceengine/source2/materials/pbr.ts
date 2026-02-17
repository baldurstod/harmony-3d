import { Source2Material } from './source2material';
import { Source2MaterialLoader } from '../loaders/source2materialloader';

export class Source2Pbr extends Source2Material{
	override get shaderSource(): string {
		return 'source2_pbr';
	}
}
Source2MaterialLoader.registerMaterial('pbr.vfx', Source2Pbr);
