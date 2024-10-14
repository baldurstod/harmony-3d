import { Source2Material } from './source2material';
import { Source2MaterialLoader } from '../loaders/source2materialloader';

export class Source2GlobalLitSimple extends Source2Material{
	constructor(repository, source2File = Object.create(null)) {//fixme
		super(repository, source2File);
	}

	getShaderSource() {
		return 'source2_global_lit_simple';
	}
}
Source2MaterialLoader.registerMaterial('global_lit_simple.vfx', Source2GlobalLitSimple);