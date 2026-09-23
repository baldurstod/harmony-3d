import { vec3 } from 'gl-matrix';
import { RaytracingMaterial, RtMaterial } from '../raytracing/material';
import { Texture } from '../textures/texture';
import { Material } from './material';

export class MeshPhongMaterial extends Material {
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

	override getRaytracingMaterial(index: number): RaytracingMaterial {
		// TODO: check these values
		return {
			index,
			materialType: RtMaterial.Source1EyeRefract,
			reflectionRatio: 0.1,
			reflectionGloss: 1,
			refractionIndex: 0.1,
			albedo: vec3.fromValues(
				0.901960015296936,
				0.49411699175834656,
				0.1333329975605011,
			),// TODO: set actual value
			textures: new Map([
				[0, this.getUniformValue('colorMap') as Texture],
			]),
			flatShading: true,
		}
	}
}
Material.materialList['MeshPhong'] = MeshPhongMaterial;
