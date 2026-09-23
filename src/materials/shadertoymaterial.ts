import { vec3 } from 'gl-matrix';
import { RaytracingMaterial, RtMaterial } from '../raytracing/material';
import { Texture } from '../textures/texture';
import { TextureManager } from '../textures/texturemanager';
import { Material } from './material';

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

	override getShaderSource(): string {
		return 'shadertoy';
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
Material.materialList['ShaderToy'] = ShaderToyMaterial;
