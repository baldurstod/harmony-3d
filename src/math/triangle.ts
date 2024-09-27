import { vec3 } from 'gl-matrix';

let v0 = vec3.create();
let v1 = vec3.create();
let v2 = vec3.create();
let v3 = vec3.create();

export function getBarycentricCoordinates(out, position, a, b, c) {
	vec3.sub(v0, c, a);
	vec3.sub(v1, b, a);
	vec3.sub(v2, position, a);

	let dot00 = vec3.dot(v0, v0);
	let dot01 = vec3.dot(v0, v1);
	let dot02 = vec3.dot(v0, v2);
	let dot11 = vec3.dot(v1, v1);
	let dot12 = vec3.dot(v1, v2);

	let invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
	let u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
	let v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

	// barycentric coordinates must always sum to 1
	return vec3.set(out,  1 - u - v, v, u );
}

export function getUV(out, position, a, b, c, uv1, uv2, uv3) {
	getBarycentricCoordinates(v3, position, a, b, c);

	out[0] = uv1[0] * v3[0] + uv2[0] * v3[1] + uv3[0] * v3[2];
	out[1] = uv1[1] * v3[0] + uv2[1] * v3[1] + uv3[1] * v3[2];
	return out;
}

export function getNormal(out, position, a, b, c, normal1, normal2, normal3) {
	getBarycentricCoordinates(v3, position, a, b, c);

	out[0] = normal1[0] * v3[0] + normal2[0] * v3[1] + normal3[0] * v3[2];
	out[1] = normal1[1] * v3[0] + normal2[1] * v3[1] + normal3[1] * v3[2];
	out[2] = normal1[2] * v3[0] + normal2[2] * v3[1] + normal3[2] * v3[2];
	return out;
}
