import { vec3 } from 'gl-matrix';

let randomFloats: number[];

export const MAX_FLOATS = 4096;

export function initRandomFloats() {
	randomFloats = new Array(MAX_FLOATS)
	for (let i = 0; i < MAX_FLOATS; i++) {
		randomFloats[i] = Math.random();
	}
}

export function ParticleRandomFloat(id: number, offset: number): number {
	if (!randomFloats) {
		initRandomFloats();
	}

	return randomFloats[(id + offset) % MAX_FLOATS]!;
}

export function ParticleRandomVec3(vec: vec3, id: number, offset1: number, offset2: number, offset3: number): vec3 {
	if (!randomFloats) {
		initRandomFloats();
	}

	vec3.set(vec, randomFloats[(id + offset1) % MAX_FLOATS]!, randomFloats[(id + offset2) % MAX_FLOATS]!, randomFloats[(id + offset3) % MAX_FLOATS]!);
	return vec
}
