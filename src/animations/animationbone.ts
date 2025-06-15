import { quat, vec3 } from 'gl-matrix';

export class AnimationBone {
	#id: number;
	#parentId: number;
	#name: string;
	refPosition: vec3;
	refQuaternion: quat;

	constructor(id: number, parentId: number, name: string, position: vec3, quaternion: quat) {
		this.#id = id;
		this.#parentId = parentId;
		this.#name = name.toLowerCase();
		this.refPosition = vec3.clone(position);
		this.refQuaternion = quat.clone(quaternion);
	}

	get id(): number {
		return this.#id;
	}

	getParentId(): number {
		return this.#parentId;
	}

	get name(): string {
		return this.#name;
	}
}
