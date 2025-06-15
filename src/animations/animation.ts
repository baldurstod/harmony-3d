import { quat, vec3 } from 'gl-matrix';
import { SMD_HEADER } from '../constants';
import { AnimationBone } from './animationbone';
import { AnimationFrame } from './animationframe';
import { quatToEuler } from '../math/quaternion';

export class Animation {
	#name;
	weight = 1;
	#frame = 0;
	#frameCount = 0;
	#looping = false;
	//#sequence;
	#fps = 30;
	#frames: AnimationFrame[] = [];
	#bones: AnimationBone[] = [];
	#bonesByName = new Map<string, AnimationBone>;

	constructor(name: string) {
		this.#name = name;
	}

	[Symbol.iterator] = () => {
		return this.#frames.entries();
	}

	addFrame(animationFrame: AnimationFrame) {
		this.#frames.push(animationFrame);
		++this.#frameCount;
	}

	addBone(bone: AnimationBone) {
		this.#bones[bone.id] = bone;
		this.#bonesByName.set(bone.name, bone);
	}

	get name() {
		return this.#name;
	}

	get frameCount() {
		return this.#frameCount;
	}

	set fps(fps) {
		this.#fps = fps;
	}

	get fps() {
		return this.#fps;
	}

	get bones() {
		return this.#bones;
	}

	getFrame(id: number): AnimationFrame | undefined {
		id = Math.round(id) % Math.max(this.#frameCount, 1);
		return this.#frames[id];
	}

	toSMD(header: string = SMD_HEADER): string {
		const lines: string[] = [];

		lines.push(header);
		lines.push('version 1');

		// Start bones declaration
		lines.push('nodes');
		for (const bone of this.#bones) {// TODO: sort bones ?
			lines.push(`  ${bone.id} "${bone.name}" ${bone.getParentId()}`);
		}
		lines.push('end');

		// Start frames
		lines.push('skeleton');
		for (const frame of this.#frames) {
			lines.push(`  time ${frame.getFrameId()}`);

			const positions = frame.getData('position');
			const rotations = frame.getData('rotation');

			if (!positions || !rotations) {
				continue;
			}

			for (const bone of this.#bones) {
				const bonePos = positions.datas[bone.id] as vec3 ?? vec3.create();
				const boneRot = quatToEuler(vec3.create(), rotations.datas[bone.id] as quat ?? quat.create());

				if (!bonePos || !boneRot) {
					continue;
				}

				lines.push(`  ${bone.id} ${bonePos[0].toFixed(5)} ${bonePos[1].toFixed(5)} ${bonePos[2].toFixed(5)} ${boneRot[0].toFixed(5)} ${boneRot[1].toFixed(5)} ${boneRot[2].toFixed(5)}`);
			}
		}
		lines.push('end');

		return lines.join('\n');
	}
}
