export default `
#pragma once
/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {ReadonlyQuat} q Quaternion to create matrix from
 *
 * @returns {mat4} out
 */

mat4 mat4FromQuat(vec4 q) {
	mat4 ret;
	float x = q.x;
	float y = q.y;
	float z = q.z;
	float w = q.w;

	float x2 = x + x;
	float y2 = y + y;
	float z2 = z + z;
	float xx = x * x2;
	float yx = y * x2;
	float yy = y * y2;
	float zx = z * x2;
	float zy = z * y2;
	float zz = z * z2;
	float wx = w * x2;
	float wy = w * y2;
	float wz = w * z2;

	ret[0][0] = 1. - yy - zz;
	ret[0][1] = yx + wz;
	ret[0][2] = zx - wy;
	ret[0][3] = 0.;
	ret[1][0] = yx - wz;
	ret[1][1] = 1. - xx - zz;
	ret[1][2] = zy + wx;
	ret[1][3] = 0.;
	ret[2][0] = zx + wy;
	ret[2][1] = zy - wx;
	ret[2][2] = 1. - xx - yy;
	ret[2][3] = 0.;
	ret[3][0] = 0.;
	ret[3][1] = 0.;
	ret[3][2] = 0.;
	ret[3][3] = 1.;

	return ret;
}
`;
