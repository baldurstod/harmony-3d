import { mat4, quat, vec3 } from 'gl-matrix';
import { JSONValue } from 'harmony-types';

export function vec3ToJSON(vec: vec3): JSONValue {
	return [...vec];
}

export function vec3FromJSON(vec: JSONValue, out: vec3 = vec3.create()): vec3 {
	return vec3.copy(out, vec as vec3)
}

export function quatToJSON(q: quat): JSONValue {
	return [...q];
}

export function quatFromJSON(q: JSONValue, out: quat = quat.create()): quat {
	return quat.copy(out, q as quat)
}

export function mat4ToJSON(mat: mat4): JSONValue {
	return [...mat];
}

export function mat4FromJSON(mat: JSONValue, out: mat4 = mat4.create()): mat4 {
	return mat4.copy(out, mat as mat4)
}
