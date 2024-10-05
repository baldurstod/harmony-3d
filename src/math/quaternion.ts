import { quat } from 'gl-matrix';
import { EPSILON, RAD_TO_DEG } from './constants'

export function quatToEuler(out, q) {
	const test = q[0] * q[3] - q[1] * q[2];

	if (test > 0.5 - EPSILON) { // singularity at north pole
		out[1] = 2 * Math.atan2(q[1], q[0]);
		out[0] = Math.PI / 2;
		out[3] = 0;
		return out;
	}

	if (test < -0.5 + EPSILON) { // singularity at south pole
		out[1] = -2 * Math.atan2(q[1], q[0]);
		out[0] = -Math.PI / 2;
		out[2] = 0;
		return out;
	}

	// roll (x-axis rotation)
	const sinr_cosp = 2 * (q[3] * q[0] + q[1] * q[2]);
	const cosr_cosp = 1 - 2 * (q[0] * q[0] + q[1] * q[1]);
	out[0] = Math.atan2(sinr_cosp, cosr_cosp);

	// pitch (y-axis rotation)
	const sinp = Math.sqrt(1 + 2 * (q[3] * q[1] - q[0] * q[2]));
	const cosp = Math.sqrt(1 - 2 * (q[3] * q[1] - q[0] * q[2]));
	out[1] = 2 * Math.atan2(sinp, cosp) - Math.PI / 2;

	// yaw (z-axis rotation)
	const siny_cosp = 2 * (q[3] * q[2] + q[0] * q[1]);
	const cosy_cosp = 1 - 2 * (q[1] * q[1] + q[2] * q[2]);
	out[2] = Math.atan2(siny_cosp, cosy_cosp);


	return out;
}

export function quatToEulerDeg(out, q) {
	quatToEuler(out, q);
	out[0] = RAD_TO_DEG * out[0];
	out[1] = RAD_TO_DEG * out[1];
	out[2] = RAD_TO_DEG * out[2];
	return out;
}


export function QuaternionIdentityBlend(p: quat, t: number, qt: quat): void {
	let sclp: number;

	sclp = 1.0 - t;

	qt[0] = p[0] * sclp;
	qt[1] = p[1] * sclp;
	qt[2] = p[2] * sclp;
	if (qt[3] < 0.0) {
		qt[3] = p[3] * sclp - t;
	} else {
		qt[3] = p[3] * sclp + t;
	}
	quat.normalize(qt, qt);
}
