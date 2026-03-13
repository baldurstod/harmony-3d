import { vec3 } from 'gl-matrix';
import { RaytracingMaterial, RtMaterial } from '../../../raytracing/material';
import { Texture } from '../../../textures/texture';
import { Source1VmtLoader } from '../loaders/source1vmtloader';
import { Source1Material } from './source1material';

export class LightMappedGenericMaterial extends Source1Material {//TODOv3 removeme

	clone() {
		return new LightMappedGenericMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	override getShaderSource(): string {
		return 'source1_lightmappedgeneric';
	}

	override getRaytracingMaterial(index: number): RaytracingMaterial {
		return {
			index,
			materialType: RtMaterial.Source1LightMappedGeneric,
			reflectionRatio: 0.1,
			reflectionGloss: 1,
			refractionIndex: 0.1,
			albedo: vec3.fromValues(
				0.901960015296936,
				0.49411699175834656,
				0.1333329975605011,
			),// TODO: set actual value
			textures: new Map([
				[0, this.uniforms.colorMap as Texture],
			]),
			flatShading: true,
		}
	}
}
Source1VmtLoader.registerMaterial('lightmappedgeneric', LightMappedGenericMaterial);
