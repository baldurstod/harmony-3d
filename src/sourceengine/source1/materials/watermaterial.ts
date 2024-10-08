import { GL_SRC_ALPHA, GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_MAX } from '../../../webgl/constants';
import { SourceEngineMaterial } from './sourceenginematerial';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';
import { RenderFace } from '../../../materials/constants';

export class WaterMaterial extends SourceEngineMaterial {
	constructor(repository, fileName, parameters = Object.create(null)) {//fixme
		super(repository, fileName, parameters);

		// Disable back face culling
		this.renderFace(RenderFace.Both);

		this.setValues(parameters);
		this.setTransparency(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
		this.setDefine('IS_TRANSLUCENT');
	}

	clone() {
		return new WaterMaterial(this.repository, this.fileName, this.parameters);
	}

	getShaderSource() {
		return 'source1_water';
	}
}
SourceEngineVMTLoader.registerMaterial('water', WaterMaterial);
