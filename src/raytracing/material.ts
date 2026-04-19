import { vec3, vec4 } from 'gl-matrix';
import { float32 } from 'harmony-types';
import { Texture } from '../textures/texture';

export enum RtMaterial {
	// The values should be consistent with the values in the raytracing shader
	Unknown = 0,
	Emissive,
	Reflective,
	Dielectric,
	Lambertian,
	Source1Material = 1000,// fallback for all source 1 materials
	Source1VertexLitGeneric,
	Source1LightMappedGeneric,
	Source1EyeRefract,
	Source1Refract,

	Source2Material = 2000,// fallback for all source 2 materials
}

export type RaytracingMaterial = {
	index: number;
	materialType: RtMaterial;
	textures?: Map<number, Texture | null>;
	reflectionRatio: float32,
	reflectionGloss: float32,
	refractionIndex: float32,
	albedo?: vec3,
	flatShading: boolean,
	v0?: vec4,
	v1?: vec4,
	v2?: vec4,
	v3?: vec4,
}
