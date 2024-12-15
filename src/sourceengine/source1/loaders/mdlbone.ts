import { mat4, quat, vec3, vec4 } from 'gl-matrix';
import { DEBUG } from '../../../buildoptions';
import { Skeleton } from '../../../objects/skeleton';
/*

#define BONE_CALCULATE_MASK			0x1F
#define BONE_PHYSICALLY_SIMULATED	0x01	// bone is physically simulated when physics are active
#define BONE_PHYSICS_PROCEDURAL		0x02	// procedural when physics is active
#define BONE_ALWAYS_PROCEDURAL		0x04	// bone is always procedurally animated
#define BONE_SCREEN_ALIGN_SPHERE	0x08	// bone aligns to the screen, not constrained in motion.
#define BONE_SCREEN_ALIGN_CYLINDER	0x10	// bone aligns to the screen, constrained by it's own axis.

#define BONE_USED_MASK				0x0007FF00
#define BONE_USED_BY_ANYTHING		0x0007FF00
#define BONE_USED_BY_HITBOX			0x00000100	// bone (or child) is used by a hit box
#define BONE_USED_BY_ATTACHMENT		0x00000200	// bone (or child) is used by an attachment point
#define BONE_USED_BY_VERTEX_MASK	0x0003FC00
#define BONE_USED_BY_VERTEX_LOD0	0x00000400	// bone (or child) is used by the toplevel model via skinned vertex
#define BONE_USED_BY_VERTEX_LOD1	0x00000800
#define BONE_USED_BY_VERTEX_LOD2	0x00001000
#define BONE_USED_BY_VERTEX_LOD3	0x00002000
#define BONE_USED_BY_VERTEX_LOD4	0x00004000
#define BONE_USED_BY_VERTEX_LOD5	0x00008000
#define BONE_USED_BY_VERTEX_LOD6	0x00010000
#define BONE_USED_BY_VERTEX_LOD7	0x00020000
#define BONE_USED_BY_BONE_MERGE		0x00040000	// bone is available for bone merge to occur against it

#define BONE_USED_BY_VERTEX_AT_LOD(lod) (BONE_USED_BY_VERTEX_LOD0 << (lod))
#define BONE_USED_BY_ANYTHING_AT_LOD(lod) ((BONE_USED_BY_ANYTHING & ~BONE_USED_BY_VERTEX_MASK) | BONE_USED_BY_VERTEX_AT_LOD(lod))

#define MAX_NUM_LODS 8

#define BONE_TYPE_MASK				0x00F00000
#define BONE_FIXED_ALIGNMENT		0x00100000	// bone can't spin 360 degrees, all interpolation is normalized around a fixed orientation

#define BONE_HAS_SAVEFRAME_POS		0x00200000	// Vector48
#define BONE_HAS_SAVEFRAME_ROT		0x00400000	// Quaternion64
*/
export const BONE_USED_MASK = 0x0007FF00;
export const BONE_USED_BY_ANYTHING = 0x0007FF00;
export const BONE_ALWAYS_PROCEDURAL = 0x04;
export const BONE_USED_BY_BONE_MERGE = 0x00040000;
export const BONE_USED_BY_VERTEX_LOD0 = 0x00000400;
export const BONE_USED_BY_VERTEX_LOD1 = 0x00000800;
export const BONE_FIXED_ALIGNMENT = 0x00100000;

export const BONE_HAS_SAVEFRAME_POS = 0x00200000;// Vector48
export const BONE_HAS_SAVEFRAME_ROT = 0x00400000;// Quaternion64

const tempMat4 = mat4.create();
const tempVec3 = vec3.create();
const tempQuat = quat.create();
//TODOV4: cleanup unused code
export class MdlBone {
	_poseToBone = mat4.create();
	_invPoseToBone = mat4.create();
	_initPoseToBone = mat4.create();
	_boneMat = mat4.create();
	_position = vec3.create();
	_quaternion = quat.create();
	_worldPos = vec3.create();
	_worldQuat = quat.create();
	_worldMat = mat4.create();
	_parent = null;/*TODO:remove ?*/
	dirty = true;
	lastComputed = 0;
	#skeleton;/*TODO:remove*/
	parentBone: number = -1;
	boneId: number = -1;
	name: string = '';
	lowcasename: string = '';
	bonecontroller: Array<number> = [];
	rot = vec3.create();
	posscale = vec3.create();
	rotscale = vec3.create();
	qAlignment = vec4.create();
	flags: number = 0;
	proctype: number = 0;
	procindex: number = 0;
	physicsbone: number = 0;
	surfacepropidx: number = 0;
	contents: number = 0;

	constructor(skeleton?: Skeleton/*TODO:remove*/) {
		this.#skeleton = skeleton;/*TODO:remove*/
	}

	get skeleton() {/*TODO:remove*/
		return this.#skeleton;
	}

	set quaternion(quaternion: quat) {
		quat.copy(this._quaternion, quaternion);
		this.dirty = true;
	}

	get quaternion() {
		return this._quaternion;
	}

	set position(position: vec3) {
		vec3.copy(this._position, position);
		this.dirty = true;
	}

	get position() {
		return this._position;
	}

	set parent(parent) {/*TODO:remove ?*/
		this._parent = parent;
		this.dirty = true;
	}

	get parent() {/*TODO:remove ?*/
		return this._parent;
	}

	set worldPos(worldPos: vec3) {
		vec3.copy(this._worldPos, worldPos);

		mat4.fromRotationTranslation(tempMat4, this._worldQuat, this._worldPos);
		mat4.multiply(this._boneMat, tempMat4, this._poseToBone);
	}

	set worldQuat(worldQuat: quat) {
		quat.copy(this._worldQuat, worldQuat);

		mat4.fromRotationTranslation(tempMat4, this._worldQuat, this._worldPos);
		mat4.multiply(this._boneMat, tempMat4, this._poseToBone);
	}

	getWorldPos(offset: vec3, out = vec3.create()) {
		if (DEBUG && offset == undefined) {
			throw 'This function must be called with an offset use .worldPos instead';
		}
		vec3.transformQuat(out, offset, this.worldQuat);
		vec3.add(out, this.worldPos, out);
		return out;
	}

	getRelativePos() {
		return vec3.clone(this.position);
	}

	set poseToBone(poseToBone) {
		mat4.copy(this._poseToBone, poseToBone);
		mat4.invert(this._invPoseToBone, poseToBone);
		this.dirty = true;
	}

	get poseToBone() {
		return this._poseToBone;
	}

	set initPoseToBone(initPoseToBone) {
		mat4.copy(this._initPoseToBone, initPoseToBone);
		this.dirty = true;
	}

	get initPoseToBone() {
		return this._initPoseToBone;
	}

	getWorldQuat() {
		return this.worldQuat;
	}

	/**
	 * Is a procedural bone ?
	 * @returns {bool} yes is procedural bone
	 */
	isProcedural() {
		return (this.flags & BONE_ALWAYS_PROCEDURAL) == BONE_ALWAYS_PROCEDURAL;
	}

	/**
	 * Use bone merge
	 * @returns {bool} yes bone is available for bone merge to occur against it
	 */
	useBoneMerge() {
		return (this.flags & BONE_USED_BY_BONE_MERGE) == BONE_USED_BY_BONE_MERGE; //TODO: test engine verion; TF2 seems not use this flag
	}
}
