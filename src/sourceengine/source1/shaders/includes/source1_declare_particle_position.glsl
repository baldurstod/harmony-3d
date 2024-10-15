export default `
vec4 vec4_transformQuat(vec4 a, vec4 q) {
	vec4 ret;
	float qx = q.x;
	float qy = q.y;
	float qz = q.z;
	float qw = q.w;

	float x = a.x;
	float y = a.y;
	float z = a.z;

	// calculate quat * vec
	float ix = qw * x + qy * z - qz * y;
	float iy = qw * y + qz * x - qx * z;
	float iz = qw * z + qx * y - qy * x;
	float iw = -qx * x - qy * y - qz * z;

	// calculate result * inverse quat
	ret.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	ret.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	ret.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	ret.w = a.w;
	return ret;
}
`;
