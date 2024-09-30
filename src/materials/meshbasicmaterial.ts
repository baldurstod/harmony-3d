import { Material } from './material'
import { registerEntity } from '../entities/entities';

export class MeshBasicMaterial extends Material {
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
	constructor(params?: any) {
		super(params);
		this.setValues(params);
	}

	getShaderSource(): string {
		return 'meshbasic';
	}

	toJSON() {
		let json = super.toJSON();
		json.skinning = this.skinning;
		return json;
	}

	static async constructFromJSON(json) {
		return new MeshBasicMaterial();
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.skinning = json.skinning;
	}

	static getEntityName(): string {
		return 'MeshBasicMaterial';
	}
}
Material.materialList['MeshBasic'] = MeshBasicMaterial;
registerEntity(MeshBasicMaterial);
