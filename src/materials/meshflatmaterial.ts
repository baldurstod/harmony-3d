import { vec3 } from 'gl-matrix';
import { RaytracingMaterial, RtMaterial } from '../raytracing/material';
import { Texture } from '../textures/texture';
import { Material } from './material';

export class MeshFlatMaterial extends Material {
	constructor(params: any = {}) {
		super(params);
		this.setDefine('FLAT_SHADING');
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
Material.materialList['MeshFlat'] = MeshFlatMaterial;
