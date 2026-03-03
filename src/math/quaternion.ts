import { quat, vec3 } from 'gl-matrix';
import { RotationOrder } from 'harmony-fbx';
import { EPSILON, RAD_TO_DEG } from './constants';

export function quatToEuler(out: vec3, q: quat): vec3 {
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

export function quatToEulerDeg(out: vec3, q: quat): vec3 {
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

/**
 * Returns the euler value of an angle, depending on a rotation order
 *
 * @param out The vector to populate. Returned values are in degrees
 * @param q The input quaternion
 * @param order The rotation order
 * @returns out
 *
 * @see ufbx, fn ufbx_quat_to_euler
 */
export function quatToEulerFbx(out: vec3, q: quat, order: RotationOrder): vec3 {
	// TODO: try to mutualize with quatToEuler
	const eps = 0.999999999;

	const qx = q[0], qy = q[1], qz = q[2], qw = q[3];
	let vx: number, vy: number, vz: number;
	let t: number;

	switch (order) {
		case RotationOrder.XYZ:
			t = 2.0 * (qw * qy - qx * qz);
			if (Math.abs(t) < eps) {
				vy = Math.asin(t);
				vz = Math.atan2(2.0 * (qw * qz + qx * qy), 2.0 * (qw * qw + qx * qx) - 1.0);
				vx = -Math.atan2(-2.0 * (qw * qx + qy * qz), 2.0 * (qw * qw + qz * qz) - 1.0);
			} else {
				vy = Math.PI * 0.5 * Math.sign(t);
				vz = Math.atan2(-2.0 * t * (qw * qx - qy * qz), t * (2.0 * qw * qy + 2.0 * qx * qz));
				vx = 0.0;
			}
			break;
		case RotationOrder.XZY:
			t = 2.0 * (qw * qz + qx * qy);
			if (Math.abs(t) < eps) {
				vz = Math.asin(t);
				vy = Math.atan2(2.0 * (qw * qy - qx * qz), 2.0 * (qw * qw + qx * qx) - 1.0);
				vx = -Math.atan2(-2.0 * (qw * qx - qy * qz), 2.0 * (qw * qw + qy * qy) - 1.0);
			} else {
				vz = Math.PI * 0.5 * Math.sign(t);
				vy = Math.atan2(2.0 * t * (qw * qx + qy * qz), -t * (2.0 * qx * qy - 2.0 * qw * qz));
				vx = 0.0;
			}
			break;
		case RotationOrder.YZX:
			t = 2.0 * (qw * qz - qx * qy);
			if (Math.abs(t) < eps) {
				vz = Math.asin(t);
				vx = Math.atan2(2.0 * (qw * qx + qy * qz), 2.0 * (qw * qw + qy * qy) - 1.0);
				vy = -Math.atan2(-2.0 * (qw * qy + qx * qz), 2.0 * (qw * qw + qx * qx) - 1.0);
			} else {
				vz = Math.PI * 0.5 * Math.sign(t);
				vx = Math.atan2(-2.0 * t * (qw * qy - qx * qz), t * (2.0 * qw * qz + 2.0 * qx * qy));
				vy = 0.0;
			}
			break;
		case RotationOrder.YXZ:
			t = 2.0 * (qw * qx + qy * qz);
			if (Math.abs(t) < eps) {
				vx = Math.asin(t);
				vz = Math.atan2(2.0 * (qw * qz - qx * qy), 2.0 * (qw * qw + qy * qy) - 1.0);
				vy = -Math.atan2(-2.0 * (qw * qy - qx * qz), 2.0 * (qw * qw + qz * qz) - 1.0);
			} else {
				vx = Math.PI * 0.5 * Math.sign(t);
				vz = Math.atan2(2.0 * t * (qw * qy + qx * qz), -t * (2.0 * qy * qz - 2.0 * qw * qx));
				vy = 0.0;
			}
			break;
		case RotationOrder.ZXY:
			t = 2.0 * (qw * qx - qy * qz);
			if (Math.abs(t) < eps) {
				vx = Math.asin(t);
				vy = Math.atan2(2.0 * (qw * qy + qx * qz), 2.0 * (qw * qw + qz * qz) - 1.0);
				vz = -Math.atan2(-2.0 * (qw * qz + qx * qy), 2.0 * (qw * qw + qy * qy) - 1.0);
			} else {
				vx = Math.PI * 0.5 * Math.sign(t);
				vy = Math.atan2(-2.0 * t * (qw * qz - qx * qy), t * (2.0 * qw * qx + 2.0 * qy * qz));
				vz = 0.0;
			}
			break;
		case RotationOrder.ZYX:
			t = 2.0 * (qw * qy + qx * qz);
			if (Math.abs(t) < eps) {
				vy = Math.asin(t);
				vx = Math.atan2(2.0 * (qw * qx - qy * qz), 2.0 * (qw * qw + qz * qz) - 1.0);
				vz = -Math.atan2(-2.0 * (qw * qz - qx * qy), 2.0 * (qw * qw + qx * qx) - 1.0);
			} else {
				vy = Math.PI * 0.5 * Math.sign(t);
				vx = Math.atan2(2.0 * t * (qw * qz + qx * qy), -t * (2.0 * qx * qz - 2.0 * qw * qy));
				vz = 0.0;
			}
			break;
		default:
			vx = vy = vz = 0.0;
			break;
	}

	vec3.set(out, vx * RAD_TO_DEG, vy * RAD_TO_DEG, vz * RAD_TO_DEG);

	return out;
}
