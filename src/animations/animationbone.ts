import { quat, vec3 } from 'gl-matrix';

export class AnimationBone {
	#id: number;
	#name: string;
	#position: vec3;
	#quaternion: quat;
	constructor(id: number, name: string, position: vec3, quaternion: quat) {
		this.#id = id;
		this.#name = name;
		this.#position = vec3.clone(position);
		this.#quaternion = quat.clone(quaternion);
	}
}
