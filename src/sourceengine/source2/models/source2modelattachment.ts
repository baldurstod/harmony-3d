import { quat, vec3 } from 'gl-matrix';

import { Entity } from '../../../entities/entity';

const tempPos = vec3.create();
const tempQuat = quat.create();

export class Source2ModelAttachment {
	name: string;
	ignoreRotation = false;
	influenceNames = [];
	influenceWeights = [];
	influenceOffsets = [];
	influenceRotations = [];
	constructor(name: string) {
		this.name = name;
	}
}
export class Source2ModelAttachmentInstance extends Entity {
	model;
	attachment;
	constructor(model, attachment) {
		super({ name: attachment.name });
		this.model = model;
		this.attachment = attachment;
	}

	#getBone(boneName) {
		if (this.model) {
			return this.model.skeleton.getBoneByName(boneName);
		}
	}

	//TODO: compute with all bones, not only the first one
	getWorldPosition(vec = vec3.create()) {
		const bone = this.#getBone(this.attachment.influenceNames[0]);
		if (bone) {
			bone.getWorldPosition(vec);
			bone.getWorldQuaternion(tempQuat);
			vec3.transformQuat(tempPos, this.attachment.influenceOffsets[0], tempQuat);
			vec3.add(vec, vec, tempPos);
		} else {
			vec3.copy(vec, this._position);
		}
		return vec;
	}

	getWorldQuaternion(q = quat.create()) {
		const bone = this.#getBone(this.attachment.influenceNames[0]);
		if (bone) {
			bone.getWorldQuaternion(q);
			quat.mul(q, q, this.attachment.influenceRotations[0]);
		} else {
			quat.copy(q, this._quaternion);
		}
		return q;
	}
}
