import { vec3 } from 'gl-matrix';
import { Entity } from '../entities/entity';

export class Hitbox {
	name: string;
	boundingBoxMin = vec3.create();
	boundingBoxMax = vec3.create();
	parent: Entity;
	constructor(name: string, boundingBoxMin: vec3, boundingBoxMax: vec3, parent: Entity) {
		this.name = name;
		vec3.copy(this.boundingBoxMin, boundingBoxMin);
		vec3.copy(this.boundingBoxMax, boundingBoxMax);
		this.parent = parent;
	}
}
