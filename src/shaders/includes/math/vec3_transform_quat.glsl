export default `
/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
vec3 vec3_transformQuat (vec3 a, vec4 q) {
	vec3 ret;
	float qx = q.x;
	float qy = q.y;
	float qz = q.z;
	float qw = q.w;

	float x = a.x;
	float y = a.y;
	float z = a.z;

	float uvx = qy * z - qz * y;
	float uvy = qz * x - qx * z;
	float uvz = qx * y - qy * x;

	float uuvx = qy * uvz - qz * uvy;
	float uuvy = qz * uvx - qx * uvz;
	float uuvz = qx * uvy - qy * uvx;

	float w2 = qw * 2.0;
	uvx *= w2;
	uvy *= w2;
	uvz *= w2;

	uuvx *= 2.0;
	uuvy *= 2.0;
	uuvz *= 2.0;

	// return vec3.add(out, a, vec3.add(out, uv, uuv));

	ret.x = x + uvx + uuvx;
	ret.y = y + uvy + uuvy;
	ret.z = z + uvz + uuvz;

	return ret;
}
`;
