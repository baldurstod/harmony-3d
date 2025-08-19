import { vec4 } from 'gl-matrix';
import { MATERIAL_BLENDING_ADDITIVE } from '../../../materials/material';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';
import { SourceEngineMaterial, SourceEngineMaterialParams, SourceEngineMaterialVmt } from './sourceenginematerial';

export class UnlitGenericMaterial extends SourceEngineMaterial {
	#diffuseModulation = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
	#initialized = false;

	constructor(repository: string, path: string, vmt: SourceEngineMaterialVmt, params: SourceEngineMaterialParams = {}) {
		super(repository, path, vmt, params);

		this.uniforms['g_ShaderControls'] = vec4.fromValues(1, 0, 1, 0);//TODOv3
		this.uniforms['g_DiffuseModulation'] = this.#diffuseModulation;
	}

	init(): void {
		if (this.#initialized) {
			return;
		}
		const vmt = this.vmt;
		this.#initialized = true;
		super.init();

		if (vmt['$additive'] == 1) {
			//this.setBlending('additive');
			this.setBlending(MATERIAL_BLENDING_ADDITIVE);
		}
	}

	clone() {
		return new UnlitGenericMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	get shaderSource() {
		//Note: this is vertexlitgeneric without lighting
		return 'source1_unlitgeneric';
	}
}
SourceEngineVMTLoader.registerMaterial('unlitgeneric', UnlitGenericMaterial);
