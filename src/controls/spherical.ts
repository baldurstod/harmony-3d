import { vec3 } from 'gl-matrix';

let EPSILON = 0.000001;

export class Spherical {
	theta: number;
	phi: number;
	radius: number;
	constructor(theta = 0, phi = 0, radius = 1.0) {
		this.set(theta, phi, radius);
	}

	set(theta = 0, phi = 0, radius = 1.0) {
		this.theta = theta;
		this.phi = phi;
		this.radius = radius;
	}

	clone() {
		return new Spherical().copy(this);
	}

	copy(other: Spherical) {
		this.radius = other.radius;
		this.phi = other.phi;
		this.theta = other.theta;
	}

	makeSafe() {
		this.phi = Math.max(EPSILON, Math.min(Math.PI - EPSILON, this.phi));
	}

	setFromVector3(v: vec3) {
		this.setFromCartesianCoords(v[0], v[1], v[2]);
	}

	setFromCartesianCoords(x: number, y: number, z: number) {
		this.radius = Math.sqrt(x * x + y * y + z * z);

		if (this.radius === 0) {
			this.theta = 0;
			this.phi = 0;
		} else {
			this.theta = Math.atan2(y, x);
			this.phi = Math.atan2(Math.sqrt(x * x + y * y), z);
		}
	}

	toCartesian(v: vec3) {
		let sinPhiRadius = Math.sin(this.phi) * this.radius;
		v[0] = sinPhiRadius * Math.cos(this.theta);
		v[1] = sinPhiRadius * Math.sin(this.theta);
		v[2] = Math.cos(this.phi) * this.radius;
	}
}
