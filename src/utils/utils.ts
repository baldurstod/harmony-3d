import { quat, vec3 } from 'gl-matrix';

export function FileNameFromPath(path: string): string {
	const startIndex = path.lastIndexOf('/') + 1;
	const endIndex = path.lastIndexOf('.');
	return path.slice(startIndex, endIndex == -1 ? undefined : endIndex);
}

export function stringToVec3(s: string, v = vec3.create()): vec3 {
	const arr = s.split(' ');
	if (arr.length == 3) {
		return vec3.set(v, Number(arr[0]), Number(arr[1]), Number(arr[2]));
	}
	return v;
}

export function stringToQuat(s: string, q = quat.create()): quat {
	const arr = s.split(' ');
	if (arr.length == 4) {
		return quat.set(q, Number(arr[0]), Number(arr[1]), Number(arr[2]), Number(arr[3]));
	}
	return q;
}
