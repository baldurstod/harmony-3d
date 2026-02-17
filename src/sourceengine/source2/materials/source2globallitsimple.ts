import { Source2MaterialLoader } from '../loaders/source2materialloader';
import { Source2Material } from './source2material';

export class Source2GlobalLitSimple extends Source2Material {

	override getShaderSource(): string {
		return 'source2_global_lit_simple';
	}
}
Source2MaterialLoader.registerMaterial('global_lit_simple.vfx', Source2GlobalLitSimple);
