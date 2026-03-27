import { vec3 } from 'gl-matrix';
import { float32 } from 'harmony-types';
import { Texture } from '../textures/texture';

export enum RtMaterial {
	Emissive = 0,
	Reflective,
	Dielectric,
	Lambertian,
	Source1Material,// fallback for all source 1 materials
	Source1VertexLitGeneric,
	Source1LightMappedGeneric,

	Source2Material,// fallback for all source 2 materials
}

export type RaytracingMaterial = {
	index: number;
	materialType: RtMaterial;
	textures?: Map<number, Texture | null>;
	reflectionRatio: float32,
	reflectionGloss: float32,
	refractionIndex: float32,
	albedo: vec3,
	flatShading: boolean,
}
