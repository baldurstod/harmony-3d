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
}
Material.materialList['Grid'] = GridMaterial;
