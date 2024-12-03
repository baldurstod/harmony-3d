import { quat, vec3 } from 'gl-matrix';
import { DEG_TO_RAD, RAD_TO_DEG } from './constants';

export function degToRad(deg: number): number {
	return deg * DEG_TO_RAD;
}
export function radToDeg(rad: number): number {
	return rad * RAD_TO_DEG;
}
export function clamp(val: number, min: number, max: number): number {
	return Math.min(Math.max(min, val), max);
}

export function pow2(n: number): number {
	return (n >= 0 && n < 31) ? (1 << n) : Math.pow(2, n);
}

export function RemapValClamped(val: number, A: number, B: number, C: number, D: number): number {
	if (A == B) {
		return val >= B ? D : C;
	}
	let cVal = (val - A) / (B - A);
	cVal = Math.min(Math.max(0.0, cVal), 1.0);//clamp(cVal, 0.0, 1.0);

	return C + (D - C) * cVal;
}

export function RemapValClampedBias(val: number, A: number, B: number, C: number, D: number, bias: number): number {
	if (A == B) {
		return val >= B ? D : C;
	}
	let cVal = (val - A) / (B - A);
	cVal = Math.min(Math.max(0.0, cVal), 1.0);//clamp(cVal, 0.0, 1.0);

	if (bias != 0.5) {
		cVal = Bias(cVal, bias);
	}

	return C + (D - C) * cVal;
}

// SIMD versions of mathlib simplespline functions
// hermite basis function for smooth interpolation
// Similar to Gain() above, but very cheap to call
// value should be between 0 & 1 inclusive
export function SimpleSpline(value: number): number {//TODOv3
	const valueSquared = value * value;

	return (3 * valueSquared) - (2 * value * valueSquared)
	/*// Arranged to avoid a data dependency between these two MULs:
	fltx4 valueDoubled = MulSIMD(value, Four_Twos);
	fltx4 valueSquared = MulSIMD(value, value);

	// Nice little ease-in, ease-out spline-like curve
	return SubSIMD(
		MulSIMD(Four_Threes,	valueSquared),
		MulSIMD(valueDoubled, valueSquared));*/
}



/**
 * Generates a random vector within two given vectors
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} a the second operand
 * @returns {vec3} out
 */
export function vec3RandomBox(out: vec3, a: vec3, b: vec3): vec3 {
	let ax = a[0], ay = a[1], az = a[2],
		bx = b[0], by = b[1], bz = b[2];

	out[0] = (bx - ax) * Math.random() + ax;
	out[1] = (by - ay) * Math.random() + ay;
	out[2] = (bz - az) * Math.random() + az;
	return out;
}

/**
 * Clamp each component of vec3 to scalar values
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to clamp
 * @param {Number} min Min value
 * @param {Number} max Max value
 * @returns {vec3} out
 */
export function vec3ClampScalar(out: vec3, a: vec3, min: number, max: number): vec3 {
	out[0] = clamp(a[0], min, max);
	out[1] = clamp(a[1], min, max);
	out[2] = clamp(a[2], min, max);
	return out;
}

export function RandomFloat(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function RandomFloatExp(min: number, max: number, exponent: number): number {
	let rand = Math.pow(Math.random(), exponent);
	return rand * (max - min) + min;
}

/**
 * Computes the mid point of two vectors
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
export function Vec3Middle(out: vec3, a: vec3, b: vec3): vec3 {
	var ax = a[0], ay = a[1], az = a[2],
		bx = b[0], by = b[1], bz = b[2];

	out[0] = (bx + ax) * 0.5;
	out[1] = (by + ay) * 0.5;
	out[2] = (bz + az) * 0.5;
	return out;
}

/**
 * Same as quat.fromEuler with angles in radians
 */
export function quatFromEulerRad(out: quat, x: number, y: number, z: number): quat {
	let halfToRad = 0.5;
	x *= halfToRad;
	y *= halfToRad;
	z *= halfToRad;

	let sx = Math.sin(x);
	let cx = Math.cos(x);
	let sy = Math.sin(y);
	let cy = Math.cos(y);
	let sz = Math.sin(z);
	let cz = Math.cos(z);

	out[0] = sx * cy * cz - cx * sy * sz;
	out[1] = cx * sy * cz + sx * cy * sz;
	out[2] = cx * cy * sz - sx * sy * cz;
	out[3] = cx * cy * cz + sx * sy * sz;

	return out;

}

export function isNumeric(n: any): boolean {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

export function lerp(min: number, max: number, v: number): number {
	return min + (max - min) * v;
}

export function ceilPowerOfTwo(n: number): number {
	if (n === 0) {
		return 1;
	}
	n--;
	n |= n >> 1;
	n |= n >> 2;
	n |= n >> 4;
	n |= n >> 8;
	n |= n >> 16;
	return n + 1;
}

export function RandomVectorInUnitSphere(out: vec3): number {
	// Guarantee uniform random distribution within a sphere
	// Graphics gems III contains this algorithm ('Nonuniform random point sets via warping')
	const u = Math.random();//RandomFloat(nRandomSampleId, 0.0f, 1.0f);
	const v = Math.random();//RandomFloat(nRandomSampleId+1, 0.0f, 1.0f);
	const w = Math.random();//RandomFloat(nRandomSampleId+2, 0.0f, 1.0f);

	const flPhi = Math.acos(1 - 2 * u);
	const flTheta = 2 * Math.PI * v;
	const flRadius = Math.pow(w, 1.0 / 3.0);

	const flSinPhi = Math.sin(flPhi);
	const flCosPhi = Math.cos(flPhi);
	const flSinTheta = Math.sin(flTheta);
	const flCosTheta = Math.cos(flTheta);
	//SinCos(flPhi, &flSinPhi, &flCosPhi);
	//SinCos(flTheta, &flSinTheta, &flCosTheta);

	out[0] = flRadius * flSinPhi * flCosTheta;
	out[1] = flRadius * flSinPhi * flSinTheta;
	out[2] = flRadius * flCosPhi;
	return flRadius;
}

export function ExponentialDecay(decayTo: number, decayTime: number, dt: number): number {
	return Math.exp(Math.log(decayTo) / decayTime * dt);
}

export function Bias(value: number, bias: number): number {
	return Math.pow(value, Math.log(bias) * -1.4427);
}

export function generateRandomUUID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}
