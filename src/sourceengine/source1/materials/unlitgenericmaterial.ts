import { vec4 } from 'gl-matrix';
import { MATERIAL_BLENDING_ADDITIVE } from '../../../materials/material';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';
import { SourceEngineMaterial } from './sourceenginematerial';

export class UnlitGenericMaterial extends SourceEngineMaterial {
	diffuseModulation = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
	#initialized = false;

	constructor(params: any = {}) {
		super(params);
		this.setValues(params);

		this.uniforms['g_ShaderControls'] = vec4.fromValues(1, 0, 1, 0);//TODOv3
		this.uniforms['g_DiffuseModulation'] = this.diffuseModulation;
	}

	init(): void {
		if (this.#initialized) {
			return;
		}
		const params = this.parameters;
		this.#initialized = true;
		super.init();

		if (params['$additive'] == 1) {
			//this.setBlending('additive');
			this.setBlending(MATERIAL_BLENDING_ADDITIVE);
		}
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
