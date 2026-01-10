#pragma once
/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {ReadonlyQuat} q Quaternion to create matrix from
 *
 * @returns {mat4} out
 */

fn mat4FromQuat(q: vec4f) -> mat4x4f {
	let x: f32 = q.x;
	let y: f32 = q.y;
	let z: f32 = q.z;
	let w: f32 = q.w;

	let x2: f32 = x + x;
	let y2: f32 = y + y;
	let z2: f32 = z + z;
	let xx: f32 = x * x2;
	let yx: f32 = y * x2;
	let yy: f32 = y * y2;
	let zx: f32 = z * x2;
	let zy: f32 = z * y2;
	let zz: f32 = z * z2;
	let wx: f32 = w * x2;
	let wy: f32 = w * y2;
	let wz: f32 = w * z2;

	return mat4x4f(1. - yy - zz, yx + wz, zx - wy, 0., yx - wz, 1. - xx - zz, zy + wx, 0., zx + wy, zy - wx, 1. - xx - yy, 0., 0., 0., 0., 1.,);
}
