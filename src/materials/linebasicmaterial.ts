import { vec4 } from 'gl-matrix';
import { Material, MaterialParams } from './material';

export class LineBasicMaterial extends Material {
	lineWidth: number;
	constructor(params: MaterialParams = {}) {
		super(params);

		this.color = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
		this.lineWidth = 1;

		//this.setValues(params);
	}

	override getShaderSource(): string {
		return 'meshbasic';
	}
}
Material.materialList['LineBasic'] = LineBasicMaterial;
