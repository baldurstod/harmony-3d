import { mat4, quat, vec3 } from 'gl-matrix';
import { Entity } from '../entities/entity';
import { Graphics } from '../graphics/graphics';
import { DEBUG } from '../buildoptions';
import { registerEntity } from '../entities/entities';
import { Skeleton } from './skeleton';
import { JSONObject } from '../types';

const tempWorldMat = mat4.create();
const tempWorldQuat = quat.create();
const tempWorldVec3 = vec3.create();
const tempWorldScale = vec3.create();
const tempPosition = vec3.create();

const tempQuat1 = quat.create();
const tempVec1 = vec3.create();

export class Bone extends Entity {
	isBone = true;
	#boneId;
	#poseToBone = mat4.create();
	#boneMat = mat4.create();
	#worldPos = vec3.create();
	#worldQuat = quat.create();
	#worldScale = vec3.fromValues(1, 1, 1);
	#parentSkeletonBone?: Bone;
	#skeleton: Skeleton;
	#refPosition = vec3.create();
	#refQuaternion = quat.create();
	dirty = true;
	lastComputed = 0;
	tempPosition = vec3.create();
	tempQuaternion = quat.create();

	constructor(params?: any/*TODO: improve type*/) {
		super(params);
		this.#boneId = params.boneId ?? -1;
		this.#skeleton = params.skeleton;
	}

	set position(position) {
		super.position = position;
		this.dirty = true;
	}

	get position() {
		return vec3.clone(this._position);
	}

	setWorldPosition(position: vec3) {
		super.setWorldPosition(position);
		this.dirty = true;
	}

	set refPosition(refPosition) {
		vec3.copy(this.#refPosition, refPosition);
	}

	get refPosition() {
		return vec3.clone(this.#refPosition);
	}

	getTotalRefPosition(position = vec3.create()) {
		let parent = this._parent;
		if (parent && (parent as Bone).isBone) {
			(parent as Bone).getTotalRefPosition(position);
			(parent as Bone).getTotalRefQuaternion(tempQuat1);

			vec3.transformQuat(tempVec1, this.#refPosition, tempQuat1);
			vec3.add(position, position, tempVec1);
		} else {
			vec3.copy(position, this.#refPosition);
		}
		return position;
	}

	getTotalRefQuaternion(quaternion = quat.create()) {
		let parent = this._parent;
		if (parent && (parent as Bone).isBone) {
			(parent as Bone).getTotalRefQuaternion(tempQuat1);
			quat.multiply(quaternion, tempQuat1, this.#refQuaternion);
		} else {
			quat.copy(quaternion, this.#refQuaternion);
		}
		return quaternion;
	}

	set quaternion(quaternion) {
		super.quaternion = quaternion;
		this.dirty = true;
	}

	get quaternion() {
		return quat.clone(this._quaternion);
	}

	set refQuaternion(refQuaternion) {
		quat.copy(this.#refQuaternion, refQuaternion);
	}

	get refQuaternion() {
		return quat.clone(this.#refQuaternion);
	}

	set scale(scale) {
		vec3.copy(this._scale, scale);
		this.dirty = true;
	}

	get scale() {
		return vec3.clone(this._scale);
	}

	set parent(parent) {
		this._parent = parent;
		this.dirty = true;
	}

	get parent() {
		return this._parent;
	}

	set skeleton(skeleton) {
		this.#skeleton = skeleton;
		this.dirty = true;
	}

	get skeleton() {
		return this.#skeleton;
	}

	set parentSkeletonBone(parentSkeletonBone) {
		if (parentSkeletonBone == this) {
			// TODO: check ancestry as well ?
			return;
		}

		if (this.#parentSkeletonBone != parentSkeletonBone) {
			this.#parentSkeletonBone = parentSkeletonBone;
			this.dirty = true;
		}
	}

	get parentSkeletonBone() {
		return this.#parentSkeletonBone;
	}

	get boneMat() {
		if (this.dirty
			|| (this._parent && (this._parent as Bone).lastComputed > this.lastComputed)
			|| (this.#parentSkeletonBone && this.#parentSkeletonBone.lastComputed > this.lastComputed)
			|| ((this._parent == undefined) && (true || (this.#skeleton.lastComputed > this.lastComputed)))//TODOv3: remove true
		) {
			this.#compute();
		}
		return this.#boneMat;
	}

	get worldPos() {
		if (this.dirty
			|| (this._parent && (this._parent as Bone).lastComputed > this.lastComputed)
			|| (this.#parentSkeletonBone && this.#parentSkeletonBone.lastComputed > this.lastComputed)
			|| ((this._parent == undefined) && (true || (this.#skeleton.lastComputed > this.lastComputed)))//TODOv3: remove true
		) {
			this.#compute();
		}
		return this.#worldPos;
	}

	get worldQuat() {
		if (this.dirty
			|| (this._parent && (this._parent as Bone).lastComputed > this.lastComputed)
			|| (this.#parentSkeletonBone && this.#parentSkeletonBone.lastComputed > this.lastComputed)
			|| ((this._parent == undefined) && (true || (this.#skeleton.lastComputed > this.lastComputed)))//TODOv3: remove true
		) {
			this.#compute();
		}
		return this.#worldQuat;
	}

	get worldScale() {
		if (this.dirty
			|| (this._parent && (this._parent as Bone).lastComputed > this.lastComputed)
			|| (this.#parentSkeletonBone && this.#parentSkeletonBone.lastComputed > this.lastComputed)
			|| ((this._parent == undefined) && (true || (this.#skeleton.lastComputed > this.lastComputed)))//TODOv3: remove true
		) {
			this.#compute();
		}
		return this.#worldScale;
	}

	getWorldPosition(vec = vec3.create()) {
		return vec3.copy(vec, this.worldPos);
	}

	getWorldQuaternion(q = quat.create()) {
		return quat.copy(q, this.worldQuat);
	}

	getWorldScale(vec = vec3.create()) {
		return vec3.copy(vec, this.worldScale);
	}

	getWorldPosOffset(offset: vec3, out = vec3.create()) {
		if (DEBUG && offset == undefined) {
			throw 'This function must be called with an offset use .worldPos instead';
		}
		vec3.transformQuat(out, offset, this.worldQuat);
		vec3.add(out, this.worldPos, out);
		return out;
	}

	set poseToBone(poseToBone) {
		mat4.copy(this.#poseToBone, poseToBone);
	}

	get poseToBone() {
		return mat4.clone(this.#poseToBone);
	}

	#compute() {
		let parent = this._parent;
		let _parentSkeletonBone = this.#parentSkeletonBone;
		if (!this.#parentSkeletonBone) {
			if (parent) {
				let parentWorldQuaternion = parent.getWorldQuaternion(tempWorldQuat);

				vec3.mul(this.#worldScale, parent.getWorldScale(tempWorldScale), this._scale);

				vec3.mul(tempPosition, this._position, tempWorldScale);

				vec3.transformQuat(this.#worldPos, tempPosition, parentWorldQuaternion);
				vec3.add(this.#worldPos, this.#worldPos, parent.getWorldPosition(tempWorldVec3));
				quat.multiply(this.#worldQuat, parentWorldQuaternion, this._quaternion);
			} else {
				if (this.#skeleton) {
					this.#skeleton.getWorldPosition(tempWorldVec3);
					this.#skeleton.getWorldQuaternion(tempWorldQuat);

					vec3.transformQuat(this.#worldPos, this._position, tempWorldQuat);
					vec3.add(this.#worldPos, this.#worldPos, tempWorldVec3);

					quat.multiply(this.#worldQuat, tempWorldQuat, this._quaternion);

					vec3.mul(this.#worldScale, this.#skeleton.getWorldScale(tempWorldScale), this._scale);
				} else {
					vec3.copy(this.#worldPos, this._position);
					quat.copy(this.#worldQuat, this._quaternion);
					vec3.copy(this.#worldScale, this._scale);
				}
			}
		} else {
			quat.copy(this.#worldQuat, this.#parentSkeletonBone.worldQuat);
			vec3.copy(this.#worldPos, this.#parentSkeletonBone.worldPos);
			vec3.copy(this.#worldScale, this.#parentSkeletonBone.worldScale);

			/*vec3.transformQuat(this.#worldPos, this._position, this.#parentSkeletonBone.worldQuat);
			vec3.add(this.#worldPos, this.#worldPos, this.#parentSkeletonBone.worldPos);

			quat.multiply(this.#worldQuat, this.#parentSkeletonBone.worldQuat, this._quaternion);*/
		}

		mat4.fromRotationTranslationScale(tempWorldMat, this.#worldQuat, this.#worldPos, this.#worldScale);
		mat4.multiply(this.#boneMat, tempWorldMat, this.#poseToBone);

		if (this.isProcedural()) {
			if (this._parent) {
				mat4.copy(this.#boneMat, (this._parent as Bone).#boneMat);
			} else {
				mat4.identity(this.#boneMat);
			}
		}

		this.dirty = false;
		this.lastComputed = new Graphics().currentTick;
	}

	set boneId(boneId) {
		this.#boneId = boneId;
	}

	get boneId() {
		return this.#boneId;
	}

	isProcedural() {
		return false;
		//return (this.flags & BONE_ALWAYS_PROCEDURAL) == BONE_ALWAYS_PROCEDURAL;
	}

	reset() {
		vec3.zero(this._position);
		quat.identity(this._quaternion);
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), this.locked ? {
			Bone_1: null,
			unlock: { i18n: '#unlock', f: (entity: Bone) => entity.locked = false },
		} : null);
	}

	toJSON() {
		let json = super.toJSON();
		json.posetobone = mat4.clone(this.#poseToBone);
		json.refposition = vec3.clone(this.#refPosition);
		json.refquaternion = quat.clone(this.#refQuaternion);
		json.boneid = this.boneId;
		return json;
	}

	static async constructFromJSON(json: JSONObject) {
		return new Bone({ name: json.name });
	}

	fromJSON(json: any) {
		console.error('warning: deprecate');
		super.fromJSON(json);
		mat4.copy(this.#poseToBone, json.posetobone ?? mat4.create());
		vec3.copy(this.#refPosition, json.refposition ?? vec3.create());
		quat.copy(this.#refQuaternion, json.refquaternion ?? quat.create());
		this.boneId = json.boneid;
	}

	static getEntityName() {
		return 'Bone';
	}
}
registerEntity(Bone);
