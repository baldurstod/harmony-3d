import { Material } from './material';

export class MeshPhongMaterial extends Material{
	map = null;
	lightMap = null;
	lightMapIntensity = 1.0;
	aoMap = null;
	aoMapIntensity = 1.0;
	specularMap = null;
	alphaMap = null;
	envMap = null;
	combine = 0/*MultiplyOperation*/;
	reflectivity = 1;
	refractionRatio = 0.98;
	wireframe = false;
	wireframeLinewidth = 1;
	wireframeLinecap = 'round';
	wireframeLinejoin = 'round';
	skinning = false;
	morphTargets = false;

	constructor(params: any = {}) {
		super(params);
		this.setValues(params);
	}

	override getShaderSource(): string {
		return 'meshphong';
	}
}
Material.materialList['MeshPhong'] = MeshPhongMaterial;
