import { Material } from './material';
import { TextureManager } from '../textures/texturemanager';

export class ShaderToyMaterial extends Material {
	constructor(params: any = {}) {
		super(params);
		this.setTexture('noiseMap', TextureManager.createNoiseTexture({
			webgpuDescriptor: {
				size: { width: 256, height: 256 },
				format: 'rgba8unorm',
				usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
			},
		}));
	}

	getShaderSource() {
		return 'shadertoy';
	}
}
Material.materialList['ShaderToy'] = ShaderToyMaterial;
