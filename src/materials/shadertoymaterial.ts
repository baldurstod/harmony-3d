import { Material } from './material';
import { TextureManager } from '../textures/texturemanager';

export class ShaderToyMaterial extends Material{
	constructor(params: any = {}) {
		super(params);
		this.setTexture('noiseMap', TextureManager.createNoiseTexture(256, 256));
	}

	getShaderSource() {
		return 'shadertoy';
	}
}
Material.materialList['ShaderToy'] = ShaderToyMaterial;
