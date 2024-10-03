import { vec3 } from 'gl-matrix';

export class Hitbox {
	#name: string;
	#boundingBoxMin = vec3.create();
	#boundingBoxMax = vec3.create();
	#parent = vec3.create();
	constructor(name: string, boundingBoxMin: vec3, boundingBoxMax: vec3, parent: vec3/*TODO: change to actual type*/) {
		this.#name = name;
		vec3.copy(this.#boundingBoxMin, boundingBoxMin);
		vec3.copy(this.#boundingBoxMax, boundingBoxMax);
		this.#parent = parent;
	}
}
