import { quat, vec3 } from 'gl-matrix';
import { AnimationBone } from './animationbone';

export class AnimationFrame {
	#frameId: number;
	#bones = new Map<string, AnimationBone>();
	constructor(frameId: number) {
		this.#frameId = frameId;
	}

	setBone(boneId: number, boneName: string, position: vec3, quaternion: quat) {
		this.#bones.set(boneName, new AnimationBone(boneId, boneName, position, quaternion));
	}

	getBone(boneName: string) {
		return this.#bones.get(boneName);
	}
}
