import { Source2MaterialLoader } from '../../../loaders/source2materialloader';
import { Source2Material } from '../../source2material';

// deadlock/core  materials/tools/show_hitboxes.vmat_c
export class Source2ToolsSolid extends Source2Material {// TODO: code me

	override get shaderSource(): string {
		return 'source2_sky';// TODO: create shader
	}
}
Source2MaterialLoader.registerMaterial('tools_solid.vfx', Source2ToolsSolid);
