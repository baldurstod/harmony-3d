import { vec4 } from 'gl-matrix';

import { GL_SRC_ALPHA, GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_MAX } from '../../../webgl/constants';
import { SourceEngineMaterial } from './sourceenginematerial';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';

export class UnlitGenericMaterial extends SourceEngineMaterial {
	diffuseModulation = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
	constructor(params: any = {}) {
		super(params);
		this.setValues(params);

		this.uniforms['g_ShaderControls'] = vec4.fromValues(1, 0, 1, 0);//TODOv3
		this.uniforms['g_DiffuseModulation'] = this.diffuseModulation;

		if (params['$additive'] == 1) {
			this.setTransparency(GL_SRC_ALPHA, GL_ONE);
			//this.setBlending('additive');
		}
		this.modeAlpha = GL_MAX;

	}

	clone() {
		return new UnlitGenericMaterial(this.parameters);
	}

	get shaderSource() {
		//Note: this is vertexlitgeneric without lighting
		return 'source1_unlitgeneric';
	}
}
SourceEngineVMTLoader.registerMaterial('unlitgeneric', UnlitGenericMaterial);
