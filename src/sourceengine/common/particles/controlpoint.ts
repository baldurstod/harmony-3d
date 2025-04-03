import { mat4, quat, vec3 } from 'gl-matrix';
import { Entity } from '../../../entities/entity';
import { Graphics } from '../../../graphics/graphics';
import { registerEntity } from '../../../entities/entities';
import { JSONObject } from '../../../types';
import { Source2Snapshot } from '../../source2/particles/source2snapshot';
import { Source2ModelInstance } from '../../export';

const identityVec3 = vec3.create();//TODO: use IDENTITY_VEC3
const identityQuat = quat.create();

const tempVec3 = vec3.create();
const tempQuat = quat.create();

let mat = mat4.create();

export class ControlPoint extends Entity {
	isControlPoint = true;
	#parentControlPoint?: ControlPoint;

	currentWorldPosition = vec3.create();
	prevWorldPosition = vec3.create();
	deltaWorldPosition = vec3.create();

	currentWorldQuaternion = quat.create();
	prevWorldQuaternion = quat.create();

	currentWorldTransformation = mat4.create();
	prevWorldTransformation = mat4.create();
	deltaWorldTransformation = mat4.create();

	//TODO: keep these vectors ?
	// Forward vector
	fVector = vec3.create();
	// Up vector
	uVector = vec3.create();
	// Right vector
	rVector = vec3.create();

	parentModel?: Entity;
	lastComputed = -1;
	snapshot?: Source2Snapshot;
	model?: Source2ModelInstance;

	getWorldTransformation(mat = mat4.create()) {
		this.getWorldQuaternion(tempQuat);
		this.getWorldPosition(tempVec3);
		return mat4.fromRotationTranslation(mat, tempQuat, tempVec3);
	}

	getWorldQuaternion(q = quat.create()) {
		if (this.#parentControlPoint) {
			this.#parentControlPoint.getWorldQuaternion(q);
			quat.mul(q, q, this._quaternion);
		} else {
			super.getWorldQuaternion(q);
		}
		return q;
	}

	parentChanged(parent: Entity | null) {
		let parentModel = this.getParentModel();
		this.forEach(entity => {
			if ((entity as ControlPoint).isControlPoint) {
				(entity as ControlPoint).parentModel = parentModel;
			}
		});
	}

	set parentControlPoint(parentControlPoint) {
		this.#parentControlPoint = parentControlPoint;
	}

	get parentControlPoint() {
		return this.#parentControlPoint;
	}

	step() {
		if (this.lastComputed < new Graphics().currentTick) {
			this.lastComputed = new Graphics().currentTick;
			vec3.copy(this.prevWorldPosition, this.currentWorldPosition);
			quat.copy(this.prevWorldQuaternion, this.currentWorldQuaternion);
			mat4.copy(this.prevWorldTransformation, this.currentWorldTransformation);
			this.#compute();
		}
	}

	resetDelta() {
		this.#compute();
		vec3.zero(this.deltaWorldPosition);
		mat4.identity(this.deltaWorldTransformation);
	}

	#compute() {
		super.getWorldPosition(this.currentWorldPosition);
		super.getWorldQuaternion(this.currentWorldQuaternion);
		mat4.fromRotationTranslation(this.currentWorldTransformation, this.currentWorldQuaternion, this.currentWorldPosition);

		// compute delta world position
		vec3.sub(this.deltaWorldPosition, this.currentWorldPosition, this.prevWorldPosition);

		// compute delta world transformation
		mat4.invert(mat, this.prevWorldTransformation);
		mat4.mul(this.deltaWorldTransformation, this.currentWorldTransformation, mat);
	}

	deltaPosFrom(other: ControlPoint, out = vec3.create()) {
		return vec3.sub(out, other.currentWorldPosition, this.currentWorldPosition);
	}

	static async constructFromJSON(json: JSONObject) {
		return new ControlPoint();
	}

	static getEntityName() {
		return 'ControlPoint';
	}
}
registerEntity(ControlPoint);
