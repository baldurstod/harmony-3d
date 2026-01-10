/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
fn vec3_transformQuat(a: vec3f, q: vec4f) -> vec3f {
	let qx: f32 = q.x;
	let qy: f32 = q.y;
	let qz: f32 = q.z;
	let qw: f32 = q.w;

	let x: f32 = a.x;
	let y: f32 = a.y;
	let z: f32 = a.z;

	let uvx: f32 = qy * z - qz * y;
	let uvy: f32 = qz * x - qx * z;
	let uvz: f32 = qx * y - qy * x;

	let uuvx: f32 = qy * uvz - qz * uvy;
	let uuvy: f32 = qz * uvx - qx * uvz;
	let uuvz: f32 = qx * uvy - qy * uvx;

	let w2: f32 = qw * 2.0;
	uvx *= w2;
	uvy *= w2;
	uvz *= w2;

	uuvx *= 2.0;
	uuvy *= 2.0;
	uuvz *= 2.0;

	return vec3f(x + uvx + uuvx, y + uvy + uuvy, z + uvz + uuvz);
}
