import { vec3 } from 'gl-matrix';
import { Bone } from '../objects/bone';

export class Hitbox {
	name: string;
	boundingBoxMin = vec3.create();
	boundingBoxMax = vec3.create();
	parent: Bone;

	constructor(name: string, boundingBoxMin: vec3, boundingBoxMax: vec3, parent: Bone) {
		this.name = name;
		vec3.copy(this.boundingBoxMin, boundingBoxMin);
		vec3.copy(this.boundingBoxMax, boundingBoxMax);
		this.parent = parent;
	}
}
