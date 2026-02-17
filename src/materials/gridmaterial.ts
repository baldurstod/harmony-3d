import { RenderFace } from './constants';
import { Material, MATERIAL_BLENDING_NORMAL } from './material';

export class GridMaterial extends Material {
	constructor(params: any = {}) {
		super(params);
		this.spacing = params.spacing ?? 1;
		this.setBlending(MATERIAL_BLENDING_NORMAL);
		this.renderFace(RenderFace.Both);
	}

	set spacing(spacing: number) {
		this.uniforms['uSpacing'] = spacing;
	}

	override getShaderSource(): string {
		return 'grid';
	}
}
Material.materialList['Grid'] = GridMaterial;
