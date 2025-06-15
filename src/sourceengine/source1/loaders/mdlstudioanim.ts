import { mat4, quat, vec3 } from 'gl-matrix';
import { FLT_EPSILON } from '../../../math/constants';
import { MdlBone } from './mdlbone';
import { SourceMdl } from './sourcemdl';

export const STUDIO_ANIM_RAWPOS = 0x01 // Vector48
export const STUDIO_ANIM_RAWROT = 0x02 // Quaternion48
export const STUDIO_ANIM_ANIMPOS = 0x04 // mstudioanim_valueptr_t
export const STUDIO_ANIM_ANIMROT = 0x08 // mstudioanim_valueptr_t
export const STUDIO_ANIM_DELTA = 0x10
export const STUDIO_ANIM_RAWROT2 = 0x20 // Quaternion64

const tempMat4 = mat4.create();
const tempQuat = quat.create();
const tempvec3 = vec3.create();

/**
 *	MdlStudioAnimValuePtr
 */
export class MdlStudioAnimValuePtr { // mstudioanim_valueptr_t
	offset: number[] = [];
	base = 0;

	getAnimValue2(i: number) {
		return this.base + this.offset[i];
	}
}

export class MdlStudioAnim {//mstudioanim_t
	readonly animValuePtrRot = new MdlStudioAnimValuePtr();
	readonly animValuePtrPos = new MdlStudioAnimValuePtr();
	readonly rawpos = vec3.create();
	readonly rawrot = quat.create();
	readonly rawrot2 = quat.create();
	flags = 0;
	bone = 0;
	nextOffset = 0;

	getRotValue(): MdlStudioAnimValuePtr | null {
		return this.animValuePtrRot;
	}

	getPosValue(): MdlStudioAnimValuePtr | null {
		return this.animValuePtrPos;
	}

	getQuaternion48(): quat {
		return this.rawrot;
	}

	getQuaternion64(): quat {
		return this.rawrot2;
	}

	/**
	 * TODO
	 */
	getRot(rot: vec3, mdl: SourceMdl, bone: MdlBone, frame: number): vec3 {
		const fromEuler5 = function (out: vec3, q: quat, i: number, j: number, k: number, h: number, parity: string, repeat: string, frame: string) {
			const M = tempMat4;//Dim M(,) As Double = {{0, 0, 0, 0}, {0, 0, 0, 0}, {0, 0, 0, 0}, {0, 0, 0, 0}}
			let Nq;
			let s;
			let xs;
			let ys;
			let zs;
			let wx;
			let wy;
			let wz;
			let xx;
			let xy;
			let xz;
			let yy;
			let yz;
			let zz;

			Nq = q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]
			if (Nq > 0) {
				s = 2.0 / Nq
			} else {
				s = 0
			}
			xs = q[0] * s
			ys = q[1] * s
			zs = q[2] * s

			wx = q[3] * xs
			wy = q[3] * ys
			wz = q[3] * zs
			xx = q[0] * xs
			xy = q[0] * ys
			xz = q[0] * zs
			yy = q[1] * ys
			yz = q[1] * zs
			zz = q[2] * zs

			M[0] = 1.0 - (yy + zz)
			M[1] = xy - wz
			M[2] = xz + wy
			M[4] = xy + wz
			M[5] = 1.0 - (xx + zz)
			M[6] = yz - wx
			M[8] = xz - wy
			M[9] = yz + wx
			M[10] = 1.0 - (xx + yy)
			M[14] = 1.0

			return Eul_FromHMatrix(out, M, i, j, k, h, parity, repeat, frame)
		}
		const fromEuler4 = function (out: vec3, q: quat) {
			fromEuler5(out, q, 0, 1, 2, 0, 'even', 'no', 'S')
			const temp = out[0];
			out[0] = out[2];
			out[2] = temp;

			return out;
		}

		var Eul_FromHMatrix = function (out: vec3, M: mat4, i: number, j: number, k: number, h: number, parity: string, repeat: string, frame: string) {
			const ea = tempvec3;

			if (repeat == 'yes') {
				const sy = Math.sqrt(M[i * 4 + j] * M[i * 4 + j] + M[i * 4 + k] * M[i * 4 + k])
				if (sy > 16 * FLT_EPSILON) {
					ea[0] = Math.atan2(M[i * 4 + j], M[i * 4 + k])
					ea[1] = Math.atan2(sy, M[i * 4 + i])
					ea[2] = Math.atan2(M[j * 4 + i], -M[k * 4 + i])
				} else {
					ea[0] = Math.atan2(-M[j * 4 + k], M[j * 4 + j])
					ea[1] = Math.atan2(sy, M[i * 4 + i])
					ea[2] = 0
				}
			} else {
				const cy = Math.sqrt(M[i * 4 + i] * M[i * 4 + i] + M[j * 4 + i] * M[j * 4 + i])
				if (cy > 16 * FLT_EPSILON) {
					ea[0] = Math.atan2(M[k * 4 + j], M[k * 4 + k])
					ea[1] = Math.atan2(-M[k * 4 + i], cy)
					ea[2] = Math.atan2(M[j * 4 + i], M[i * 4 + i])
				} else {
					ea[0] = Math.atan2(-M[j * 4 + k], M[j * 4 + j])
					ea[1] = Math.atan2(-M[k * 4 + i], cy)
					ea[2] = 0
				}
			}

			if (parity == 'odd') {
				ea[0] = -ea[0]
				ea[1] = -ea[1]
				ea[2] = -ea[2]
			}

			if (frame == 'R') {
				const t = ea[0]
				ea[0] = ea[2]
				ea[2] = t
			}

			vec3.copy(out, ea);
			return out
		}

		const flag = this.flags;
		let offset;

		if ((flag & STUDIO_ANIM_RAWROT) == STUDIO_ANIM_RAWROT) {
			//rot = vec3.add(rot, rot, this.rawrot);
			rot = fromEuler4(rot, this.rawrot2);//TODO: fix the from euler function
			return rot;
		}
		if ((flag & STUDIO_ANIM_RAWROT2) == STUDIO_ANIM_RAWROT2) {
			rot = fromEuler4(rot, this.rawrot2);//TODO: fix the from euler function
			return rot;

		}
		if ((flag & STUDIO_ANIM_ANIMROT) == STUDIO_ANIM_ANIMROT) {
			for (let i = 0; i < 3; ++i) {
				offset = this.animValuePtrRot.offset[i];
				if (offset) {
					rot[i] = this.readValue(mdl, frame, this.animValuePtrRot.base + offset/*, bone.boneId, i*/) * bone.rotscale[i];
				}
			}
		}

		if ((flag & STUDIO_ANIM_DELTA) != STUDIO_ANIM_DELTA) {
			vec3.add(rot, rot, bone.rot);
		}
		return rot;
	}

	getPos(pos: vec3, mdl: SourceMdl, bone: MdlBone, frame: number): vec3 {
		const flag = this.flags;
		let offset;
		pos[0] = 0;
		pos[1] = 0;
		pos[2] = 0;

		if ((flag & STUDIO_ANIM_RAWPOS) == STUDIO_ANIM_RAWPOS) {
			pos = vec3.add(pos, pos, this.rawpos);
			return pos;
		} else if ((flag & STUDIO_ANIM_ANIMPOS) != STUDIO_ANIM_ANIMPOS) {
			if ((flag & STUDIO_ANIM_DELTA) == STUDIO_ANIM_DELTA) {
				//vec3.add(pos, pos, bone.position);
				pos[0] = 0;
				pos[1] = 0;
				pos[2] = 0;
			} else {
				vec3.add(pos, pos, bone.position);
			}
			return pos;
		}

		if ((flag & STUDIO_ANIM_ANIMPOS) == STUDIO_ANIM_ANIMPOS) {
			for (let i = 0; i < 3; ++i) {
				offset = this.animValuePtrPos.offset[i];
				if (offset) {
					pos[i] = this.readValue(mdl, frame, this.animValuePtrPos.base + offset/*, bone.boneId, i*/) * bone.posscale[i];
				}
			}
		}

		if ((flag & STUDIO_ANIM_DELTA) != STUDIO_ANIM_DELTA) {
			vec3.add(pos, pos, bone.position);
		}
		return pos;
	}

	readValue(mdl: SourceMdl, frame: number, offset: number/*, boneid, memberid*/) {
		const reader = mdl.reader;
		reader.seek(offset)
		let valid = 0;
		let total = 0;
		let value;
		let k = frame;
		let count = 0;

		do {
			count++;
			if (count > 1) {
				const nextOffset = reader.tell() + valid * 2;

				/*if (!mdl.hasChunk(nextOffset, 2)) {//TODOv3
					return 0;
				}*/
				reader.seek(nextOffset);
			}
			k -= total;
			valid = reader.getInt8();
			total = reader.getInt8();
		} while ((total <= k) && count < 30)//TODO: change 30

		if (k >= valid) {
			k = valid - 1;
		}

		const nextOffset = reader.tell() + k * 2;
		reader.seek(nextOffset);

		return reader.getInt16();
	}
}
