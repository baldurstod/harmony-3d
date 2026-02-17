import { Source2Material } from './source2material';
import { Source2MaterialLoader } from '../loaders/source2materialloader';

export class Source2UI extends Source2Material {

	override get shaderSource(): string {
		return 'source2_ui';
	}
}
Source2MaterialLoader.registerMaterial('ui.vfx', Source2UI);
