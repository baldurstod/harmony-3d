import { Texture } from '../textures/texture';

export enum RtMaterial {
	Emissive = 0,
	Reflective,
	Dielectric,
	Lambertian,
}

export type RaytracingMaterial = {
	type: RtMaterial;
	textures?: Map<string, Texture>;
}
