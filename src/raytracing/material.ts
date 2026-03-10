import { vec3 } from 'gl-matrix';
import { float32 } from 'harmony-types';
import { Texture } from '../textures/texture';

export enum RtMaterial {
	Emissive = 0,
	Reflective,
	Dielectric,
	Lambertian,
	Source1VertexLitGeneric,
}

export type RaytracingMaterial = {
	index: number;
	materialType: RtMaterial;
	textures?: Map<number, Texture | null>;
	reflectionRatio: float32,
	reflectionGloss: float32,
	refractionIndex: float32,
	albedo: vec3,
}
