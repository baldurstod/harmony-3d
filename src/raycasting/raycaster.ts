import { vec3 } from 'gl-matrix';

import { Ray } from './ray';

const a = vec3.create();
const b = vec3.create();
const c = vec3.create();

export class Raycaster {
	near: number;
	far: number;
	ray = new Ray();
	constructor(near: number = 0, far: number = Infinity) {
		this.near = near;
		this.far = far;
	}

	castRay(origin, direction, entities, recursive) {
		this.ray.set(origin, direction);
		let intersections = [];
		for (let entity of entities) {
			this.intersectEntity(entity, intersections, recursive);
		}
		return intersections;
	}

	castCameraRay(camera, normalizedX, normalizedY, entities, recursive) {
		let projectionMatrixInverse = camera.projectionMatrixInverse;
		let nearP = vec3.set(a, normalizedX, normalizedY, -1);
		let farP = vec3.set(b, normalizedX, normalizedY, 1);

		vec3.transformMat4(nearP, nearP, projectionMatrixInverse);
		vec3.transformMat4(farP, farP, projectionMatrixInverse);

		vec3.transformQuat(nearP, nearP, camera.quaternion);
		vec3.transformQuat(farP, farP, camera.quaternion);

		let rayDirection = vec3.sub(c, farP, nearP);
		vec3.normalize(rayDirection, rayDirection);

		return this.castRay(camera.position, rayDirection, entities, recursive);
	}

	intersectEntity(entity, intersections, recursive) {
		if (!entity.visible) {
			return;
		}

		entity.raycast(this, intersections);

		if (recursive) {
			for (let child of entity.children) {
				this.intersectEntity(child, intersections, recursive);
			}
		}
	}
}
