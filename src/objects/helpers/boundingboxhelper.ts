import { quat, vec3 } from 'gl-matrix';

import { BoundingBox } from '../../math/boundingbox';
import { Box } from '../../primitives/box';

const tempVec3 = vec3.create();

export class BoundingBoxHelper extends Box {
	boundingBox = new BoundingBox();
	constructor(params: any = {}) {
		super(params);
		this.wireframe = 0;
	}

	update() {
		if (this._parent) {
			this._parent.getBoundingBox(this.boundingBox);

			this.boundingBox.getCenter(this._position);
			this.boundingBox.getSize(tempVec3);

			this.setSize(tempVec3[0], tempVec3[1], tempVec3[2]);
		}
	}

	getWorldPosition(vec = vec3.create()) {
		return vec3.copy(vec, this._position);
	}

	getWorldQuaternion(q = quat.create()) {
		return quat.identity(q);
	}

	getBoundingBox(boundingBox = new BoundingBox()) {
		boundingBox.reset();
		return boundingBox;
	}
}
