import { vec3 } from 'gl-matrix';
import { Ray } from './ray';
import { Entity } from '../entities/entity';
import { Intersection } from './intersection';
import { Camera } from '../cameras/camera';

const a = vec3.create();
const b = vec3.create();
const c = vec3.create();

export class Raycaster {
	near: number;
	far: number;
	ray = new Ray();
	constructor(near = 0, far = Infinity) {
		this.near = near;
		this.far = far;
	}

	castRay(origin: vec3, direction: vec3, entities: Entity[] | Set<Entity>, recursive: boolean) {
		this.ray.set(origin, direction);
		const intersections: Intersection[] = [];
		for (const entity of entities) {
			this.intersectEntity(entity, intersections, recursive);
		}
		return intersections;
	}

	castCameraRay(camera: Camera, normalizedX: number, normalizedY: number, entities: Entity[] | Set<Entity>, recursive: boolean) {
		const projectionMatrixInverse = camera.projectionMatrixInverse;
		const nearP = vec3.set(a, normalizedX, normalizedY, -1);
		const farP = vec3.set(b, normalizedX, normalizedY, 1);

		vec3.transformMat4(nearP, nearP, projectionMatrixInverse);
		vec3.transformMat4(farP, farP, projectionMatrixInverse);

		vec3.transformQuat(nearP, nearP, camera.quaternion);
		vec3.transformQuat(farP, farP, camera.quaternion);

		const rayDirection = vec3.sub(c, farP, nearP);
		vec3.normalize(rayDirection, rayDirection);

		return this.castRay(camera.position, rayDirection, entities, recursive);
	}

	intersectEntity(entity: Entity, intersections: Intersection[], recursive: boolean) {
		if (!entity.visible) {
			return;
		}

		entity.raycast(this, intersections);

		if (recursive) {
			for (const child of entity.children) {
				this.intersectEntity(child, intersections, recursive);
			}
		}
	}
}
