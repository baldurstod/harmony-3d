import { vec3 } from 'gl-matrix';

const tempVec3 = vec3.create();
const tempMin = vec3.create();
const tempMax = vec3.create();

export class BoundingBox {
	min = vec3.create();
	max = vec3.create();
	empty = true;

	setPoints(points: number[] | Float32Array) {
		this.reset();
		this.addPoints(points);
	}

	addPoints(pointArray: number[] | Float32Array) {
		vec3.set(tempMin, +Infinity, +Infinity, +Infinity);
		vec3.set(tempMax, -Infinity, -Infinity, -Infinity);

		for (let i = 0; i < pointArray.length; i += 3) {
			tempVec3[0] = pointArray[i + 0]!;
			tempVec3[1] = pointArray[i + 1]!;
			tempVec3[2] = pointArray[i + 2]!;
			vec3.min(tempMin, tempMin, tempVec3);
			vec3.max(tempMax, tempMax, tempVec3);
		}

		if (pointArray.length) {
			if (!this.empty) {
				vec3.min(tempMin, tempMin, this.min);
				vec3.max(tempMax, tempMax, this.max);
			}
			vec3.copy(this.min, tempMin);
			vec3.copy(this.max, tempMax);
			this.empty = false;
		}
	}

	addBoundingBox(boundingBox: BoundingBox) {
		if (boundingBox.empty) {
			return;
		}

		if (!this.empty) {
			vec3.min(this.min, boundingBox.min, this.min);
			vec3.max(this.max, boundingBox.max, this.max);
		} else {
			vec3.copy(this.min, boundingBox.min);
			vec3.copy(this.max, boundingBox.max);
		}
		this.empty = false;
	}

	reset() {
		vec3.zero(this.min);
		vec3.zero(this.max);
		this.empty = true;
	}

	get center() {
		return this.getCenter();
	}

	getCenter(center = vec3.create()) {
		return vec3.lerp(center, this.min, this.max, 0.5);
	}

	get size() {
		return this.getSize();
	}

	getSize(size = vec3.create()) {
		return vec3.sub(size, this.max, this.min);
	}
}
