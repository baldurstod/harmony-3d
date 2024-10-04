import { quat, vec3 } from 'gl-matrix';

import { Entity } from '../../../entities/entity';

const tempPos = vec3.create();
const tempQuat = quat.create();

export class Source2ModelAttachement {
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
export class Source2ModelAttachementInstance extends Entity {
	model;
	attachement;
	constructor(model, attachement) {
		super({ name: attachement.name });
		this.model = model;
		this.attachement = attachement;
	}

	#getBone(boneName) {
		if (this.model) {
			return this.model.skeleton.getBoneByName(boneName);
		}
	}

	//TODO: compute with all bones, not only the first one
	getWorldPosition(vec = vec3.create()) {
		let bone = this.#getBone(this.attachement.influenceNames[0]);
		if (bone) {
			bone.getWorldPosition(vec);
			bone.getWorldQuaternion(tempQuat);
			vec3.transformQuat(tempPos, this.attachement.influenceOffsets[0], tempQuat);
			vec3.add(vec, vec, tempPos);
		} else {
			vec3.copy(vec, this._position);
		}
		return vec;
	}

	getWorldQuaternion(q = quat.create()) {
		let bone = this.#getBone(this.attachement.influenceNames[0]);
		if (bone) {
			bone.getWorldQuaternion(q);
			quat.mul(q, q, this.attachement.influenceRotations[0]);
		} else {
			quat.copy(q, this._quaternion);
		}
		return q;
	}
}
