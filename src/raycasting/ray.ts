import { mat4, vec3 } from 'gl-matrix';

import { Intersection } from './intersection.js';

const EPSILON = 1e-7;

const edge1 = vec3.create();
const edge2 = vec3.create();
const h = vec3.create();
const h2 = vec3.create();
const s = vec3.create();
const q = vec3.create();

const m = mat4.create();

const _segCenter = vec3.create();
const _segDir = vec3.create();
const _diff = vec3.create();

export class Ray {
	origin: vec3 = vec3.create();
	direction: vec3 = vec3.create();
	constructor(origin?: vec3, direction?: vec3) {
		if (origin) {
			vec3.copy(this.origin, origin);
		}
		if (direction) {
			vec3.copy(this.direction, direction);
		}
	}

	set(origin: vec3, direction: vec3) {
		vec3.copy(this.origin, origin);
		vec3.copy(this.direction, direction);
	}

	copy(other: Ray) {
		vec3.copy(this.origin, other.origin);
		vec3.copy(this.direction, other.direction);
	}

	copyTransform(other: Ray, worldMatrix: mat4) {
		mat4.invert(m, worldMatrix);
		vec3.transformMat4(this.origin, other.origin, m);

		let x = other.direction[0];
		let y = other.direction[1];
		let z = other.direction[2];
		this.direction[0] = m[0] * x + m[4] * y + m[8] * z;
		this.direction[1] = m[1] * x + m[5] * y + m[9] * z;
		this.direction[2] = m[2] * x + m[6] * y + m[10] * z;
	}

	setOrigin(origin: vec3) {
		vec3.copy(this.origin, origin);
	}

	setDirection(direction: vec3) {
		vec3.copy(this.direction, direction);
	}

	positionAt(distance: number, position: vec3) {
		vec3.scaleAndAdd(position, this.origin, this.direction, distance);
	}

	intersectTriangle(v0: vec3, v1: vec3, v2: vec3, intersectionPoint: vec3) {
		//Möller-Trumbore intersection algorithm
		vec3.sub(edge1, v1, v0);
		vec3.sub(edge2, v2, v0);
		vec3.cross(h, this.direction, edge2);
		let a = vec3.dot(edge1, h);
		if (a > -EPSILON && a < EPSILON) {
			return false;
		}
		let f = 1.0 / a;
		vec3.sub(s, this.origin, v0);

		let u = f * vec3.dot(s, h);
		if (u < 0.0 || u > 1.0) {
			return false;
		}
		vec3.cross(q, s, edge1);
		let v = f * vec3.dot(this.direction, q);
		if (v < 0.0 || u + v > 1.0) {
			return false;
		}
		// At this stage we can compute t to find out where the intersection point is on the line.
		let t = f * vec3.dot(edge2, q);
		if (t > EPSILON) { // ray intersection
			this.positionAt(t, intersectionPoint);
			return true;
		} else {// This means that there is a line intersection but not a ray intersection.
			return false;
		}
	}

	intersectSphere(position, radius, scale, intersectionPoint1, intersectionPoint2) {
		vec3.sub(h, this.origin, position);
		vec3.div(h, h, scale);
		vec3.div(h2, this.direction, scale);
		vec3.normalize(h2, h2);
		let p = vec3.dot(h2, h);
		let q = vec3.dot(h, h) - (radius * radius);

		let discriminant = (p * p) - q;
		if (discriminant < 0.0) {
			return false;
		}

		let dRoot = Math.sqrt(discriminant);
		let dist1 = -p - dRoot;
		let dist2 = -p + dRoot;

		vec3.scaleAndAdd(intersectionPoint1, h, h2, dist1);
		vec3.scaleAndAdd(intersectionPoint2, h, h2, dist2);

		vec3.mul(intersectionPoint1, intersectionPoint1, scale);
		vec3.mul(intersectionPoint2, intersectionPoint2, scale);

		vec3.add(intersectionPoint1, intersectionPoint1, position);
		vec3.add(intersectionPoint2, intersectionPoint2, position);

		return true;
	}


	distanceSqToSegment(v0, v1, optionalPointOnRay, optionalPointOnSegment) {

		// from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteDistRaySegment.h
		// It returns the min distance between the ray and the segment
		// defined by v0 and v1
		// It can also set two optional targets :
		// - The closest point on the ray
		// - The closest point on the segment

		//_segCenter.copy( v0 ).add( v1 ).multiplyScalar( 0.5 );
		vec3.add(_segCenter, v0, v1);
		vec3.scale(_segCenter, _segCenter, 0.5);
		//_segDir.copy( v1 ).sub( v0 ).normalize();
		vec3.sub(_segDir, v1, v0);
		vec3.normalize(_segDir, _segDir);
		//_diff.copy( this.origin ).sub( _segCenter );
		vec3.sub(_diff, this.origin, _segCenter);

		//const segExtent = v0.distanceTo( v1 ) * 0.5;
		const segExtent = vec3.dist(v0, v1) * 0.5;
		//const a01 = - this.direction.dot( _segDir );
		const a01 = - vec3.dot(this.direction, _segDir);//this.direction.dot( _segDir );
		//const b0 = _diff.dot( this.direction );
		const b0 = vec3.dot(_diff, this.direction);
		//const b1 = - _diff.dot( _segDir );
		const b1 = - vec3.dot(_diff, _segDir);
		//const c = _diff.lengthSq();
		const c = vec3.sqrLen(_diff);
		const det = Math.abs(1 - a01 * a01);
		let s0, s1, sqrDist, extDet;

		if (det > 0) {

			// The ray and segment are not parallel.

			s0 = a01 * b1 - b0;
			s1 = a01 * b0 - b1;
			extDet = segExtent * det;

			if (s0 >= 0) {

				if (s1 >= - extDet) {

					if (s1 <= extDet) {

						// region 0
						// Minimum at interior points of ray and segment.

						const invDet = 1 / det;
						s0 *= invDet;
						s1 *= invDet;
						sqrDist = s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c;

					} else {

						// region 1

						s1 = segExtent;
						s0 = Math.max(0, - (a01 * s1 + b0));
						sqrDist = - s0 * s0 + s1 * (s1 + 2 * b1) + c;

					}

				} else {

					// region 5

					s1 = - segExtent;
					s0 = Math.max(0, - (a01 * s1 + b0));
					sqrDist = - s0 * s0 + s1 * (s1 + 2 * b1) + c;

				}

			} else {

				if (s1 <= - extDet) {

					// region 4

					s0 = Math.max(0, - (- a01 * segExtent + b0));
					s1 = (s0 > 0) ? - segExtent : Math.min(Math.max(- segExtent, - b1), segExtent);
					sqrDist = - s0 * s0 + s1 * (s1 + 2 * b1) + c;

				} else if (s1 <= extDet) {

					// region 3

					s0 = 0;
					s1 = Math.min(Math.max(- segExtent, - b1), segExtent);
					sqrDist = s1 * (s1 + 2 * b1) + c;

				} else {

					// region 2

					s0 = Math.max(0, - (a01 * segExtent + b0));
					s1 = (s0 > 0) ? segExtent : Math.min(Math.max(- segExtent, - b1), segExtent);
					sqrDist = - s0 * s0 + s1 * (s1 + 2 * b1) + c;

				}

			}

		} else {

			// Ray and segment are parallel.

			s1 = (a01 > 0) ? - segExtent : segExtent;
			s0 = Math.max(0, - (a01 * s1 + b0));
			sqrDist = - s0 * s0 + s1 * (s1 + 2 * b1) + c;

		}

		if (optionalPointOnRay) {

			//optionalPointOnRay.copy( this.origin ).addScaledVector( this.direction, s0 );
			vec3.scaleAndAdd(optionalPointOnRay, this.origin, this.direction, s0);

		}

		if (optionalPointOnSegment) {

			//optionalPointOnSegment.copy( _segCenter ).addScaledVector( _segDir, s1 );
			vec3.scaleAndAdd(optionalPointOnRay, _segCenter, _segDir, s1);

		}

		return sqrDist;

	}

	createIntersection(position, normal, uv, entity, distanceFromRay) {
		return new Intersection(position, normal, uv, vec3.distance(this.origin, position), entity, distanceFromRay);
	}
}
