import { Source2Material } from './source2material';
import { Source2MaterialLoader } from '../loaders/source2materialloader';
import { TESTING } from '../../../buildoptions';
import { RenderFace } from '../../../materials/constants';
import { Source2File } from '../loaders/source2file';

export class Source2Error extends Source2Material{
	constructor(repository: string, shader: string, source2File?: Source2File) {
		super(repository, shader, source2File);
		if (TESTING) {
			console.log(source2File);
		}
		this.renderFace(RenderFace.Both);
	}

	get shaderSource() {
		return 'source2_error';
	}
}
Source2MaterialLoader.registerMaterial('error.vfx', Source2Error);
