import { Material } from '../materials/material';

export class NodeImageEditorMaterial extends Material {
	shaderName: string = '';
	constructor(params: any) {
		super(params);
		this.shaderName = params?.shaderName;
	}

	getShaderSource() {
		return this.shaderName;
	}
}
