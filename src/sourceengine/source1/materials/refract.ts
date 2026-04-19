import { vec3, vec4 } from 'gl-matrix';
import { RaytracingMaterial, RtMaterial } from '../../../raytracing/material';
import { Texture } from '../../../textures/texture';
import { Source1VmtLoader } from '../loaders/source1vmtloader';
import { Source1Material } from './source1material';

export class RefractMaterial extends Source1Material {
	override clone(): RefractMaterial {
		return new RefractMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	override getShaderSource(): string {
		return 'source1_refract';
	}

	override getRaytracingMaterial(index: number): RaytracingMaterial {
		return {
			index,
			materialType: RtMaterial.Source1Refract,
			reflectionRatio: 0.1,
			reflectionGloss: 1,
			refractionIndex: 0.1,
			textures: new Map([
				[0, this.getUniformValue('normalTexture') as Texture],
			]),
			flatShading: false,
			v0: vec4.fromValues(0.5/*TODO: setup  material blur value*/, 0.15/*TODO: setup  material refract value*/, 0, 0),
		}
	}
}
Source1VmtLoader.registerMaterial('refract', RefractMaterial);
