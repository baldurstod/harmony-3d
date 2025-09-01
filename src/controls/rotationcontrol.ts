import { quat, vec3 } from 'gl-matrix';
import { Entity, EntityParameters } from '../entities/entity';
import { GraphicsEvent, GraphicsEvents } from '../graphics/graphicsevents';
import { DEG_TO_RAD, RAD_TO_DEG } from '../math/constants';
import { stringToVec3 } from '../utils/utils';

const Z_VECTOR = vec3.fromValues(0, 0, 1);
const tempQuat = quat.create();

export type RotationControlParameters = EntityParameters & {
	axis?: vec3;
	speed?: number;

};

export class RotationControl extends Entity {
	#rotationSpeed: number;
	#axis: vec3 = vec3.clone(Z_VECTOR);

	constructor(params?: RotationControlParameters) {
		super(params);
		GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: CustomEvent) => this.#update(event.detail.delta));

		if (params.axis) {
			this.axis = params.axis;
		}

		this.#rotationSpeed = params.speed ?? 1;
	}

	setSpeed(rotationSpeed): void {
		this.#rotationSpeed = rotationSpeed;
	}

	/**
	 * @deprecated Please use `setSpeed` instead.
	 */
	set rotationSpeed(rotationSpeed) {
		this.setSpeed(rotationSpeed);
	}

	getSpeed(): number {
		return this.#rotationSpeed;
	}

	/**
	 * @deprecated Please use `getSpeed` instead.
	 */
	get rotationSpeed() {
		return this.getSpeed();
	}

	setAxis(axis: vec3): void {
		vec3.copy(this.#axis, axis);
		quat.identity(this._quaternion);
	}

	/**
	 * @deprecated Please use `setAxis` instead.
	 */
	set axis(axis: vec3) {
		this.setAxis(axis);
	}

	getAxis() {
		return vec3.clone(this.#axis);
	}

	/**
	 * @deprecated Please use `getAxis` instead.
	 */
	get axis() {
		return this.getAxis();
	}

	#update(delta: number) {
		quat.setAxisAngle(tempQuat, this.#axis, this.#rotationSpeed * delta);
		const quaternion = this._quaternion;
		quat.mul(quaternion, quaternion, tempQuat);
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			RotationControl_1: null,
			rotation_axis: { i18n: '#rotation_axis', f: () => { const v = prompt('Rotation axis', this.axis.join(' ')); if (v !== null) { this.axis = stringToVec3(v); } } },
			rotation_speed: { i18n: '#rotation_speed', f: () => { const s = prompt('Rotation speed', String(this.rotationSpeed * RAD_TO_DEG)); if (s !== null) { this.rotationSpeed = Number(s) * DEG_TO_RAD; } } },
		});
	}
}
