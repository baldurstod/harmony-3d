import { vec2, vec3 } from 'gl-matrix';
import { Entity } from '../entities/entity';

export class Intersection {
	position: vec3;
	normal?: vec3;
	uv?: vec2;
	distance: number;
	entity: Entity;
	distanceFromRay: number;

	constructor(position: vec3, normal: vec3 | null, uv: vec2 | null, distance: number, entity: Entity, distanceFromRay: number) {
		this.position = vec3.clone(position);
		if (normal) {
			this.normal = vec3.clone(normal);
		}
		if (uv) {
			this.uv = vec2.clone(uv);
		}
		this.distance = distance;
		this.entity = entity;
		this.distanceFromRay = distanceFromRay;
	}
}
