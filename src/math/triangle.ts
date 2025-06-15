import { vec2, vec3 } from 'gl-matrix';

const v0 = vec3.create();
const v1 = vec3.create();
const v2 = vec3.create();
const v3 = vec3.create();

export function getBarycentricCoordinates(out: vec3, position: vec3, a: vec3, b: vec3, c: vec3) {
	vec3.sub(v0, c, a);
	vec3.sub(v1, b, a);
	vec3.sub(v2, position, a);

	const dot00 = vec3.dot(v0, v0);
	const dot01 = vec3.dot(v0, v1);
	const dot02 = vec3.dot(v0, v2);
	const dot11 = vec3.dot(v1, v1);
	const dot12 = vec3.dot(v1, v2);

	const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
	const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
	const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

	// barycentric coordinates must always sum to 1
	return vec3.set(out, 1 - u - v, v, u);
}

export function getUV(out: vec2, position: vec3, a: vec3, b: vec3, c: vec3, uv1: vec2, uv2: vec2, uv3: vec2) {
	getBarycentricCoordinates(v3, position, a, b, c);

	out[0] = uv1[0] * v3[0] + uv2[0] * v3[1] + uv3[0] * v3[2];
	out[1] = uv1[1] * v3[0] + uv2[1] * v3[1] + uv3[1] * v3[2];
	return out;
}

export function getNormal(out: vec3, position: vec3, a: vec3, b: vec3, c: vec3, normal1: vec3, normal2: vec3, normal3: vec3) {
	getBarycentricCoordinates(v3, position, a, b, c);

	out[0] = normal1[0] * v3[0] + normal2[0] * v3[1] + normal3[0] * v3[2];
	out[1] = normal1[1] * v3[0] + normal2[1] * v3[1] + normal3[1] * v3[2];
	out[2] = normal1[2] * v3[0] + normal2[2] * v3[1] + normal3[2] * v3[2];
	return out;
}
