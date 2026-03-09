import { JSONObject } from 'harmony-types';
import { registerEntity } from '../entities/entities';
import { RaytracingMaterial, RtMaterial } from '../raytracing/material';
import { Material } from './material';
import { vec3 } from 'gl-matrix';

export class EmissiveMaterial extends Material {
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

	override getShaderSource(): string {
		return 'meshbasic';
	}

	override getRaytracingMaterial(index: number): RaytracingMaterial {
		return {
			index,
			materialType: RtMaterial.Emissive,
			reflectionRatio: 0,
			reflectionGloss: 1,
			refractionIndex: 1,
			albedo: vec3.fromValues(6, 6, 6),// TODO: set actual value
		}
	}

	toJSON() {
		const json = super.toJSON();
		json.skinning = this.skinning;
		return json;
	}

	static async constructFromJSON(json: JSONObject) {
		return new EmissiveMaterial();
	}

	fromJSON(json: JSONObject) {
		super.fromJSON(json);
		this.skinning = json.skinning as boolean;
	}

	static getEntityName(): string {
		return 'EmissiveMaterial';
	}
}
Material.materialList['MeshBasic'] = EmissiveMaterial;
registerEntity(EmissiveMaterial);
