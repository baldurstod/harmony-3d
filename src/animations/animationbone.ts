import { quat, vec3 } from 'gl-matrix';

export class AnimationBone {
	#id: number;
	#name: string;
	refPosition: vec3;
	refQuaternion: quat;

	constructor(id: number, name: string, position: vec3, quaternion: quat) {
		this.#id = id;
		this.#name = name.toLowerCase();
		this.refPosition = vec3.clone(position);
		this.refQuaternion = quat.clone(quaternion);
	}

	get id() {
		return this.#id;
	}

	get name() {
		return this.#name;
	}
}
