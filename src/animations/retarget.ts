import { quat, vec3 } from 'gl-matrix';
import { Skeleton } from '../objects/skeleton';

export enum RetargetMode {
	Animation = 0,
	Skeleton = 1,
	AnimationScaled = 2,
}

export interface RetargetParameters {
	source?: Skeleton;
	target?: Skeleton;
	mode?: RetargetMode;
}

export class Retarget {
	#source?: Skeleton;
	#target?: Skeleton;
	#mode = RetargetMode.Animation;

	constructor(params: RetargetParameters = {}) {
		if (params.source) {
			this.setSource(params.source);
		}
		if (params.target) {
			this.setTarget(params.target);
		}
	}

	setSource(source: Skeleton): void {
		this.#source = source;
	}

	setTarget(target: Skeleton): void {
		this.#target = target;
	}

	setMode(mode: RetargetMode): void {
		this.#mode = mode;
	}

	update(): void {
		if (!this.#target || !this.#source) {
			return;
		}

		const v = vec3.create();
		const q = quat.create();

		for (const bone of this.#target._bones) {
			const sourceBone = this.#source.getBoneByName(bone.name);
			if (!sourceBone) {
				// TODO: What should ve do ?

				bone.setPosition(bone._initialPosition);
				bone.setOrientation(bone._initialQuaternion);

				continue;
			}
			bone.setPosition(bone._initialPosition);
			bone.setOrientation(sourceBone.getOrientation(q));
		}

		this.#target.setBonesMatrix();
	}
}
