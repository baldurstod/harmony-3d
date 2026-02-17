import { Source2Material } from './source2material';
import { Source2MaterialLoader } from '../loaders/source2materialloader';
import { MATERIAL_BLENDING_ADDITIVE } from '../../../materials/material';

export class Source2Crystal extends Source2Material{
	setupUniformsOnce() {
		super.setupUniformsOnce()
		this.setBlending(MATERIAL_BLENDING_ADDITIVE);
		this.setDefine('IS_TRANSLUCENT');
	}

	override getShaderSource(): string {
		return 'source2_crystal';
	}
}
Source2MaterialLoader.registerMaterial('crystal.vfx', Source2Crystal);
