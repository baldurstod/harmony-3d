import { Material } from './material';

export class MeshFlatMaterial extends Material {
	constructor(params: any = {}) {
		super(params);
		this.setDefine('FLAT_SHADING');
	}

	getShaderSource(): string {
		return 'meshphong';
	}
}
Material.materialList['MeshFlat'] = MeshFlatMaterial;
