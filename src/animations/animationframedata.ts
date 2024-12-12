import { quat, vec3 } from 'gl-matrix';

export type AnimationFrameDataTypes = vec3 | quat | number | boolean;

export enum AnimationFrameDataType {
	Vec3 = 0,
	Quat,
	Number,
	Boolean,
}

export class AnimationFrameData {
	type: AnimationFrameDataType;
	datas: Array<AnimationFrameDataTypes> = [];

	constructor(type: AnimationFrameDataType, datas?: Array<AnimationFrameDataTypes>) {
		this.type = type;

		if (datas) {
			for (const data of datas) {
				switch (type) {
					case AnimationFrameDataType.Vec3:
						this.datas.push(vec3.clone(data as vec3));
						break;
					case AnimationFrameDataType.Quat:
						this.datas.push(quat.clone(data as quat));
						break;
					default:
						this.datas.push(data);
						break;
				}
			}
		}
	}

	pushData(data: AnimationFrameDataTypes) {
		this.datas.push(data);
	}
}
