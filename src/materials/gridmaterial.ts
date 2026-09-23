import { vec3 } from 'gl-matrix';
import { RaytracingMaterial, RtMaterial } from '../raytracing/material';
import { Texture } from '../textures/texture';
import { RenderFace } from './constants';
import { Material, MATERIAL_BLENDING_NORMAL, MaterialParams } from './material';

export type GridMaterialParams = MaterialParams & {
	// Grid spacing, in engine unit. Default to 1
	spacing?: number;
};

export class GridMaterial extends Material {
	constructor(params: GridMaterialParams = {}) {
		super(params);
		this.setSpacing(params.spacing ?? 1);
		this.setBlending(MATERIAL_BLENDING_NORMAL);
		this.renderFace(RenderFace.Both);
	}

	/**
	 * @deprecated Use setSpacing instead
	 */
	set spacing(spacing: number) {
		this.setSpacing(spacing);
	}

	setSpacing(spacing: number): void {
		this.setUniformValue('uSpacing', spacing);
	}

	override getShaderSource(): string {
		return 'grid';
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
Material.materialList['Grid'] = GridMaterial;
