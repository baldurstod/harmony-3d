import { Source2MaterialLoader } from '../../../loaders/source2materialloader';
import { Source2Material } from '../../source2material';

// dota2/core materials/tools/grid.vmat_c
export class Source2ToolsGrid extends Source2Material {// TODO: code me

	get shaderSource() {
		return 'source2_sky';// TODO: create shader
	}
}
Source2MaterialLoader.registerMaterial('tools_grid.vfx', Source2ToolsGrid);
