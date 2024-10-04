import { quat, vec3 } from 'gl-matrix';

import { Entity } from '../entities/entity';
import { GraphicsEvents, GraphicsEvent } from '../graphics/graphicsevents';
import { DEG_TO_RAD, RAD_TO_DEG } from '../math/constants';
import { stringToVec3 } from '../utils/utils';

const Z_VECTOR = vec3.fromValues(0, 0, 1);
const tempQuat = quat.create();

export class RotationControl extends Entity {
	#rotationSpeed: number = 1;
	#axis: vec3 = vec3.clone(Z_VECTOR);
	constructor(params?: any) {
		super(params);
		GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: CustomEvent) => this.#update(event.detail.delta));
	}

	set rotationSpeed(rotationSpeed) {
		this.#rotationSpeed = rotationSpeed;
	}

	get rotationSpeed() {
		return this.#rotationSpeed;
	}

	set axis(axis: vec3) {
		vec3.copy(this.#axis, axis);
		quat.identity(this._quaternion);
	}

	get axis() {
		return vec3.clone(this.#axis);
	}

	#update(delta: number) {
		quat.setAxisAngle(tempQuat, this.#axis, this.#rotationSpeed * delta);
		let quaternion = this._quaternion;
		quat.mul(quaternion, quaternion, tempQuat);
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			RotationControl_1: null,
			rotation_axis: { i18n: '#rotation_axis', f: () => { let v = prompt('Rotation axis', this.axis.join(' ')); if (v !== null) { this.axis = stringToVec3(v); } } },
			rotation_speed: { i18n: '#rotation_speed', f: () => { let s = prompt('Rotation speed', String(this.rotationSpeed * RAD_TO_DEG)); if (s !== null) { this.rotationSpeed = Number(s) * DEG_TO_RAD; } } },
		});
	}
}
