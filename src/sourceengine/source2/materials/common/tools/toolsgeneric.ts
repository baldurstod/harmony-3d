import { Source2MaterialLoader } from '../../../loaders/source2materialloader';
import { Source2Material } from '../../source2material';

// dota2/core materials/tools/climb.vmat_c
export class Source2ToolsGeneric extends Source2Material {// TODO: code me

	override get shaderSource(): string {
		return 'source2_sky';// TODO: create shader
	}
}
Source2MaterialLoader.registerMaterial('tools_generic.vfx', Source2ToolsGeneric);
