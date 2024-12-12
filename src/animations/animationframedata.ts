import { quat, vec3 } from 'gl-matrix';
import { AnimationBone } from './animationbone';

export type AnimationFrameDataTypes = vec3 | quat | number | boolean;

export enum AnimationFrameDataType {
	Vec3 = 0,
	Quat,
	Number,
	Boolean,
}

export class AnimationFrameData {
	#type: AnimationFrameDataType;
	#datas: Array<AnimationFrameDataTypes> = [];

	constructor(type: AnimationFrameDataType, datas?: Array<AnimationFrameDataTypes>) {
		this.#type = type;

		for (const data of datas) {
			this.#datas.push(data);
		}
	}

	pushData(data: AnimationFrameDataTypes) {
		this.#datas.push(data);
	}
}
