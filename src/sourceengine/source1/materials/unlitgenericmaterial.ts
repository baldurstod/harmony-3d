import { vec4 } from 'gl-matrix';
import { MATERIAL_BLENDING_ADDITIVE } from '../../../materials/material';
import { Source1VmtLoader } from '../loaders/source1vmtloader';
import { Source1Material, Source1MaterialParams, Source1MaterialVmt } from './source1material';

export class UnlitGenericMaterial extends Source1Material {
	#diffuseModulation = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
	#initialized = false;

	constructor(repository: string, path: string, vmt: Source1MaterialVmt, params: Source1MaterialParams = {}) {
		super(repository, path, vmt, params);
		//this.useSrgb = false;

		this.setUniformValue('g_ShaderControls', vec4.fromValues(1, 0, 1, 0));//TODOv3
		this.setUniformValue('g_DiffuseModulation', this.#diffuseModulation);
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
			this.setDefine('ADDITIVE');
		}
	}

	override clone(): UnlitGenericMaterial {
		return new UnlitGenericMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	override getShaderSource(): string {
		//Note: this is vertexlitgeneric without lighting
		return 'source1_unlitgeneric';
	}
}
Source1VmtLoader.registerMaterial('unlitgeneric', UnlitGenericMaterial);
