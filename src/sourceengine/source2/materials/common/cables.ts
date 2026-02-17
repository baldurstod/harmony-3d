import { Source2MaterialLoader } from '../../loaders/source2materialloader';
import { Source2Material } from '../source2material';

export class Source2CablesMaterial extends Source2Material {// TODO: code me

	override get shaderSource(): string {
		return 'source2_cables';
	}
}
Source2MaterialLoader.registerMaterial('cables.vfx', Source2CablesMaterial);
