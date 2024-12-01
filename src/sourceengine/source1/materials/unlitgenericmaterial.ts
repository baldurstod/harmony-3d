import { vec4 } from 'gl-matrix';

import { GL_SRC_ALPHA, GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_MAX } from '../../../webgl/constants';
import { SourceEngineMaterial } from './sourceenginematerial';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';

export class UnlitGenericMaterial extends SourceEngineMaterial {
	diffuseModulation = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
	constructor(repository, fileName, parameters = Object.create(null)) {//fixme
		super(repository, fileName, parameters);
		this.setValues(parameters);

		this.uniforms['g_ShaderControls'] = vec4.fromValues(1, 0, 1, 0);//TODOv3
		this.uniforms['g_DiffuseModulation'] = this.diffuseModulation;

		if (parameters['$additive'] == 1) {
			this.setTransparency(GL_SRC_ALPHA, GL_ONE);
			//this.setBlending('additive');
		}
		this.modeAlpha = GL_MAX;

	}

	clone() {
		return new UnlitGenericMaterial(this.repository, this.fileName, this.parameters);
	}

	get shaderSource() {
		//Note: this is vertexlitgeneric without lighting
		return 'source1_unlitgeneric';
	}
}
SourceEngineVMTLoader.registerMaterial('unlitgeneric', UnlitGenericMaterial);
