import { mat4, quat, vec3 } from 'gl-matrix';

import { BONE_FIXED_ALIGNMENT, BONE_HAS_SAVEFRAME_POS, BONE_HAS_SAVEFRAME_ROT } from '../loaders/mdlbone';
import { STUDIO_AL_SPLINE, STUDIO_AL_XFADE, STUDIO_AL_NOBLEND, STUDIO_AL_LOCAL, STUDIO_AL_POSE } from '../loaders/mdlstudioseqdesc';
import { STUDIO_ANIM_RAWPOS, STUDIO_ANIM_RAWROT, STUDIO_ANIM_ANIMPOS, STUDIO_ANIM_ANIMROT, STUDIO_ANIM_DELTA, STUDIO_ANIM_RAWROT2 } from '../loaders/mdlstudioanim'
import { FLT_EPSILON } from '../../../math/constants';
import { clamp, SimpleSpline, quatFromEulerRad } from '../../../math/functions';
import { SourceMDL } from '../loaders/sourcemdl';
import { QuaternionIdentityBlend } from '../../../math/quaternion';

/**
 * Update buffers vertice count.
 */
const g1RemoveMe = 1;
const g2RemoveMe = 1;

//-----------------------------------------------------------------------------
// Purpose: returns array of animations and weightings for a sequence based on current pose parameters
//-----------------------------------------------------------------------------
//void Studio_SeqAnims(const CStudioHdr *pStudioHdr, mstudioseqdesc_t &seqdesc, int iSequence, const float poseParameter[], mstudioanimdesc_t *panim[4], float *weight)
function Studio_SeqAnims2(pStudioHdr, seqdesc, iSequence, poseParameter, panim, weight) {
	/*if (!pStudioHdr || iSequence >= pStudioHdr.GetNumSeq())
	{
		weight[0] = weight[1] = weight[2] = weight[3] = 0.0;
		return;
	}*/

	const i0 = 0, i1 = 0;
	const s0 = 0, s1 = 0;

	//Studio_LocalPoseParameter(pStudioHdr, poseParameter, seqdesc, iSequence, 0, s0, i0);TODOV2
	//	Studio_LocalPoseParameter(pStudioHdr, poseParameter, seqdesc, iSequence, 1, s1, i1);

	//panim[0] = pStudioHdr.pAnimdesc(pStudioHdr.iRelativeAnim(iSequence, seqdesc.anim(i0	, i1)));
	panim[0] = pStudioHdr.getAnimDescription(seqdesc.getBlend(i0, i1));
	weight[0] = (1 - s0) * (1 - s1);

	//panim[1] = pStudioHdr.pAnimdesc(pStudioHdr.iRelativeAnim(iSequence, seqdesc.anim(i0+1, i1)));
	panim[1] = pStudioHdr.getAnimDescription(seqdesc.getBlend(i0 + 1, i1));
	weight[1] = (s0) * (1 - s1);

	//panim[2] = pStudioHdr.pAnimdesc(pStudioHdr.iRelativeAnim(iSequence, seqdesc.anim(i0	, i1+1)));
	panim[2] = pStudioHdr.getAnimDescription(seqdesc.getBlend(i0, i1 + 1));
	weight[2] = (1 - s0) * (s1);

	//panim[3] = pStudioHdr.pAnimdesc(pStudioHdr.iRelativeAnim(iSequence, seqdesc.anim(i0+1, i1+1)));
	panim[3] = pStudioHdr.getAnimDescription(seqdesc.getBlend(i0 + 1, i1 + 1));
	weight[3] = (s0) * (s1);
}

//-----------------------------------------------------------------------------
// Purpose: returns cycles per second of a sequence (cycles/second)
//-----------------------------------------------------------------------------
//float Studio_CPS(const CStudioHdr *pStudioHdr, mstudioseqdesc_t &seqdesc, int iSequence, const float poseParameter[])
function Studio_CPS2(pStudioHdr, seqdesc, iSequence, poseParameter) {
	const panim = [];
	const weight = [];

	Studio_SeqAnims2(pStudioHdr, seqdesc, iSequence, poseParameter, panim, weight);

	let t = 0;
	for (let i = 0; i < 4; ++i) {
		if (panim[i] && weight[i] > 0 && panim[i].numframes > 1) {
			t += (panim[i].fps / (panim[i].numframes - 1)) * weight[i];
			//setAnimLength(panim[i].numframes);//TODOv3
		}
	}
	return t;
}

function Studio_Frames2(pStudioHdr, seqdesc, iSequence, poseParameter) {
	const panim = [];
	const weight = [];

	Studio_SeqAnims2(pStudioHdr, seqdesc, iSequence, poseParameter, panim, weight);

	let t = 0;
	for (let i = 0; i < 4; ++i) {
		if (panim[i] && weight[i] > 0) {
			t = Math.max(t, panim[i].numframes);
		}
	}
	return t;
}

//-----------------------------------------------------------------------------
// Purpose: returns length (in seconds) of a sequence (seconds/cycle)
//-----------------------------------------------------------------------------
//float Studio_Duration(const CStudioHdr *pStudioHdr, int iSequence, const float poseParameter[])
export function Studio_Duration2(pStudioHdr, iSequence, poseParameter) {
	const seqdesc = pStudioHdr.getSequenceById(iSequence);//pStudioHdr.pSeqdesc(iSequence);
	const cps = Studio_CPS2(pStudioHdr, seqdesc, iSequence, poseParameter);

	if (cps == 0)
		return 0.0;

	return 1.0 / cps;
}
export function StudioFrames2(pStudioHdr, iSequence, poseParameter) {
	const seqdesc = pStudioHdr.getSequenceById(iSequence);//pStudioHdr.pSeqdesc(iSequence);
	return Studio_Frames2(pStudioHdr, seqdesc, iSequence, poseParameter);
}

const SOURCE_MODEL_MAX_BONES = 256;


//-----------------------------------------------------------------------------
// Purpose: calculate a pose for a single sequence
//-----------------------------------------------------------------------------
function InitPose2(dynamicProp, pStudioHdr, pos, q, boneMask) {
	if (pStudioHdr.pLinearBones === undefined) {
		for (let i = 0, boneCount = pStudioHdr.getBoneCount(); i < boneCount; ++i) {
			if (true || pStudioHdr.boneFlags(i) & boneMask) {
				const pbone = pStudioHdr.getBone(i);
				pos[i] = pos[i] || vec3.create();//removeme
				q[i] = q[i] || quat.create();//removeme
				vec3.copy(pos[i], pbone.position);
				quat.copy(q[i], pbone.quaternion);
			}
		}
	} else {
		//TODO
		/*mstudiolinearbone_t *pLinearBones = pStudioHdr->pLinearBones();
		for (int i = 0; i < pStudioHdr->numbones(); i++)
		{
			if (pStudioHdr->boneFlags(i) & boneMask)
			{
				pos[i] = pLinearBones->pos(i);
				q[i] = pLinearBones->quat(i);
			}
		}*/
	}
}

//-----------------------------------------------------------------------------
// Purpose: calculate a pose for a single sequence
//			adds autolayers, runs local ik rukes
//-----------------------------------------------------------------------------
//function CalcPose(pStudioHdr, pIKContext, pos, q, sequence, cycle, poseParameter, boneMask, flWeight = 1.0, flTime = 0.0) {
export function CalcPose2(dynamicProp, pStudioHdr, pIKContext, pos, q, boneFlags: Array<number>, sequence, cycle, poseParameter, boneMask, flWeight, flTime) {
	cycle = cycle % 1;//TODOv2
	const seqdesc = pStudioHdr.getSequenceById(sequence);
	if (seqdesc) {

		//Assert(flWeight >= 0.0f && flWeight <= 1.0f);
		// This shouldn't be necessary, but the Assert should help us catch whoever is screwing this up
		flWeight = clamp(flWeight, 0.0, 1.0);

		// add any IK locks to prevent numautolayers from moving extremities
		//CIKContext seq_ik;TODOv2
		/*
		if (false && seqdesc.numiklocks) {//TODOV2
			seq_ik.Init(pStudioHdr, vec3_angle, vec3_origin, 0.0, 0, boneMask); // local space relative so absolute position doesn't mater
			seq_ik.AddSequenceLocks(seqdesc, pos, q);
		}
			*/

		CalcPoseSingle2(dynamicProp, pStudioHdr, pos, q, boneFlags, seqdesc, sequence, cycle, poseParameter, boneMask, flTime);

		if (pIKContext) {
			pIKContext.AddDependencies(seqdesc, sequence, cycle, poseParameter, flWeight);
		}

		AddSequenceLayers2(dynamicProp, pStudioHdr, pIKContext, pos, q, boneFlags, seqdesc, sequence, cycle, poseParameter, boneMask, flWeight, flTime);
		/*
				if (false && seqdesc.numiklocks) {//TODOV2
					seq_ik.SolveSequenceLocks(seqdesc, pos, q);
				}
					*/
	}

}

//-----------------------------------------------------------------------------
// Purpose: calculate a pose for a single sequence
//-----------------------------------------------------------------------------
//TODOv2: put somewhere else
export const STUDIO_LOOPING = 0x0001		// ending frame should be the same as the starting frame
export const STUDIO_SNAP = 0x0002		// do not interpolate between previous animation and this one
export const STUDIO_DELTA = 0x0004		// this sequence 'adds' to the base sequences, not slerp blends
export const STUDIO_AUTOPLAY = 0x0008		// temporary flag that forces the sequence to always play
export const STUDIO_POST = 0x0010		//
export const STUDIO_ALLZEROS = 0x0020		// this animation/sequence has no real animation data
//						0x0040
export const STUDIO_CYCLEPOSE = 0x0080		// cycle index is taken from a pose parameter index
export const STUDIO_REALTIME = 0x0100		// cycle index is taken from a real-time clock, not the animations cycle index
export const STUDIO_LOCAL = 0x0200		// sequence has a local context sequence
export const STUDIO_HIDDEN = 0x0400		// don't show in default selection views
export const STUDIO_OVERRIDE = 0x0800		// a forward declared sequence (empty)
export const STUDIO_ACTIVITY = 0x1000		// Has been updated at runtime to activity index
export const STUDIO_EVENT = 0x2000		// Has been updated at runtime to event index
export const STUDIO_WORLD = 0x4000		// sequence blends in worldspace

const s1RemoveMe = 0.0;
const anim_3wayblend = true;//TODO: removeme
const CalcPoseSingle_pos2 = Array(SOURCE_MODEL_MAX_BONES);
const CalcPoseSingle_q2 = Array(SOURCE_MODEL_MAX_BONES);
const CalcPoseSingle_pos3 = Array(SOURCE_MODEL_MAX_BONES);
const CalcPoseSingle_q3 = Array(SOURCE_MODEL_MAX_BONES);
for (let i = 0; i < SOURCE_MODEL_MAX_BONES; i++) {
	CalcPoseSingle_pos2[i] = vec3.create();
	CalcPoseSingle_q2[i] = quat.create();
	CalcPoseSingle_pos3[i] = vec3.create();
	CalcPoseSingle_q3[i] = quat.create();
}
function CalcPoseSingle2(dynamicProp, pStudioHdr, pos, q, boneFlags: Array<number>, seqdesc, sequence, cycle, poseParameter, boneMask, flTime) {
	let bResult = true;

	const pos2 = CalcPoseSingle_pos2;//[];//vec3.create();//TODOv2: optimize (see source)
	const q2 = CalcPoseSingle_q2;//[];//quat.create();//TODOv2: optimize (see source)
	const pos3 = CalcPoseSingle_pos3;//[];//vec3.create();//TODOv2: optimize (see source)
	const q3 = CalcPoseSingle_q3;[];//quat.create();//TODOv2: optimize (see source)

	for (let i = 0; i < SOURCE_MODEL_MAX_BONES; ++i) {
		vec3.zero(pos2[i]);
		quat.identity(q2[i]);
		vec3.zero(pos3[i]);
		quat.identity(q3[i]);
	}

	/*	if (sequence >= pStudioHdr->GetNumSeq())TODOv2
		{
			sequence = 0;
			seqdesc = pStudioHdr->pSeqdesc(sequence);
		}*/


	let i0 = 0, i1 = 0;
	let s0 = 0, s1 = 0;

	const r0 = Studio_LocalPoseParameter2(pStudioHdr, poseParameter, seqdesc, sequence, 0/*, s0, i0 */);//TODOv2
	const r1 = Studio_LocalPoseParameter2(pStudioHdr, poseParameter, seqdesc, sequence, 1/*, s1, i1 */);
	s0 = r0.s;
	i0 = r0.i;
	s1 = r1.s;
	i1 = r1.i;

	if (seqdesc.flags & STUDIO_REALTIME) {
		const cps = Studio_CPS2(pStudioHdr, seqdesc, sequence, poseParameter);
		cycle = flTime * cps;
		cycle = cycle - Math.floor(cycle);//TODOv2: rounding issues
	} else if (seqdesc.flags & STUDIO_CYCLEPOSE) {
		const iPose = pStudioHdr.GetSharedPoseParameter(sequence, seqdesc.cycleposeindex);
		if (iPose != -1) {
			cycle = poseParameter[iPose];
		} else {
			cycle = 0.0;
		}
	} else if (cycle < 0 || cycle >= 1) {
		if (seqdesc.flags & STUDIO_LOOPING) {
			cycle = cycle - Math.floor(cycle);//TODOv2: rounding issues
			if (cycle < 0) {
				cycle += 1;
			}
		} else {
			cycle = clamp(cycle, 0.0, 1.0);
		}
	}

	if (s0 < 0.001) {
		if (s1 < 0.001) {
			if (PoseIsAllZeros2(pStudioHdr, sequence, seqdesc, i0, i1)) {
				bResult = false;
			}
			else {
				CalcAnimation2(dynamicProp, pStudioHdr, pos, q, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0, i1), cycle, boneMask);
			}
		}
		else if (s1 > 0.999) {
			CalcAnimation2(dynamicProp, pStudioHdr, pos, q, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0, i1 + 1), cycle, boneMask);
		}
		else {
			CalcAnimation2(dynamicProp, pStudioHdr, pos, q, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0, i1), cycle, boneMask);
			CalcAnimation2(dynamicProp, pStudioHdr, pos2, q2, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0, i1 + 1), cycle, boneMask);
			BlendBones2(pStudioHdr, q, pos, seqdesc, sequence, q2, pos2, s1, boneMask);
		}
	}
	else if (s0 > 0.999) {
		if (s1 < 0.001) {
			if (PoseIsAllZeros2(pStudioHdr, sequence, seqdesc, i0 + 1, i1)) {
				bResult = false;
			}
			else {
				CalcAnimation2(dynamicProp, pStudioHdr, pos, q, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0 + 1, i1), cycle, boneMask);
			}
		}
		else if (s1 > 0.999) {
			CalcAnimation2(dynamicProp, pStudioHdr, pos, q, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0 + 1, i1 + 1), cycle, boneMask);
		}
		else {
			CalcAnimation2(dynamicProp, pStudioHdr, pos, q, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0 + 1, i1), cycle, boneMask);
			CalcAnimation2(dynamicProp, pStudioHdr, pos2, q2, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0 + 1, i1 + 1), cycle, boneMask);
			BlendBones2(pStudioHdr, q, pos, seqdesc, sequence, q2, pos2, s1, boneMask);
		}
	}
	else {
		if (s1 < 0.001) {
			if (PoseIsAllZeros2(pStudioHdr, sequence, seqdesc, i0 + 1, i1)) {
				CalcAnimation2(dynamicProp, pStudioHdr, pos, q, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0, i1), cycle, boneMask);
				ScaleBones2(pStudioHdr, q, pos, sequence, 1.0 - s0, boneMask);
			}
			else if (PoseIsAllZeros2(pStudioHdr, sequence, seqdesc, i0, i1)) {
				CalcAnimation2(dynamicProp, pStudioHdr, pos, q, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0 + 1, i1), cycle, boneMask);
				ScaleBones2(pStudioHdr, q, pos, sequence, s0, boneMask);
			}
			else {
				CalcAnimation2(dynamicProp, pStudioHdr, pos, q, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0, i1), cycle, boneMask);
				CalcAnimation2(dynamicProp, pStudioHdr, pos2, q2, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0 + 1, i1), cycle, boneMask);

				BlendBones2(pStudioHdr, q, pos, seqdesc, sequence, q2, pos2, s0, boneMask);
			}
		}
		else if (s1 > 0.999) {
			CalcAnimation2(dynamicProp, pStudioHdr, pos, q, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0, i1 + 1), cycle, boneMask);
			CalcAnimation2(dynamicProp, pStudioHdr, pos2, q2, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0 + 1, i1 + 1), cycle, boneMask);
			BlendBones2(pStudioHdr, q, pos, seqdesc, sequence, q2, pos2, s0, boneMask);
		}
		//else if (!anim_3wayblend.GetBool())
		else if (!anim_3wayblend) {
			CalcAnimation2(dynamicProp, pStudioHdr, pos, q, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0, i1), cycle, boneMask);
			CalcAnimation2(dynamicProp, pStudioHdr, pos2, q2, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0 + 1, i1), cycle, boneMask);
			BlendBones2(pStudioHdr, q, pos, seqdesc, sequence, q2, pos2, s0, boneMask);

			CalcAnimation2(dynamicProp, pStudioHdr, pos2, q2, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0, i1 + 1), cycle, boneMask);
			CalcAnimation2(dynamicProp, pStudioHdr, pos3, q3, boneFlags, seqdesc, sequence, seqdesc.getBlend(i0 + 1, i1 + 1), cycle, boneMask);
			BlendBones2(pStudioHdr, q2, pos2, seqdesc, sequence, q3, pos3, s0, boneMask);

			BlendBones2(pStudioHdr, q, pos, seqdesc, sequence, q2, pos2, s1, boneMask);
		}
		else {
			const iAnimIndices = [];
			const weight = [];

			Calc3WayBlendIndices2(i0, i1, s0, s1, seqdesc, iAnimIndices, weight);

			if (weight[1] < 0.001) {
				// on diagonal
				CalcAnimation2(dynamicProp, pStudioHdr, pos, q, boneFlags, seqdesc, sequence, iAnimIndices[0], cycle, boneMask);
				CalcAnimation2(dynamicProp, pStudioHdr, pos2, q2, boneFlags, seqdesc, sequence, iAnimIndices[2], cycle, boneMask);
				BlendBones2(pStudioHdr, q, pos, seqdesc, sequence, q2, pos2, weight[2] / (weight[0] + weight[2]), boneMask);
			}
			else {
				CalcAnimation2(dynamicProp, pStudioHdr, pos, q, boneFlags, seqdesc, sequence, iAnimIndices[0], cycle, boneMask);
				CalcAnimation2(dynamicProp, pStudioHdr, pos2, q2, boneFlags, seqdesc, sequence, iAnimIndices[1], cycle, boneMask);
				BlendBones2(pStudioHdr, q, pos, seqdesc, sequence, q2, pos2, weight[1] / (weight[0] + weight[1]), boneMask);

				CalcAnimation2(dynamicProp, pStudioHdr, pos3, q3, boneFlags, seqdesc, sequence, iAnimIndices[2], cycle, boneMask);
				BlendBones2(pStudioHdr, q, pos, seqdesc, sequence, q3, pos3, weight[2], boneMask);
			}
		}
	}

	//g_VectorPool.Free(pos2);
	//g_QaternionPool.Free(q2);
	//g_VectorPool.Free(pos3);
	//g_QaternionPool.Free(q3);

	return bResult;
}

//-----------------------------------------------------------------------------
// Purpose: Find and decode a sub-frame of animation
//-----------------------------------------------------------------------------
function CalcAnimation2(dynamicProp, pStudioHdr, pos, q, boneFlags: Array<number>, seqdesc, sequence, animation, cycle, boneMask) {
	/*virtualmodel_t *pVModel = pStudioHdr->GetVirtualModel();TODOV2
	if (pVModel)
	{
		CalcVirtualAnimation(pVModel, pStudioHdr, pos, q, seqdesc, sequence, animation, cycle, boneMask);
		return;
	}*/

	const animdesc = pStudioHdr.getAnimDescription(animation);
	if (!animdesc) {
		return;
	}
	const pbone = pStudioHdr.getBone(0);
	//const mstudiolinearbone_t *pLinearBones = pStudioHdr->pLinearBones();TODOV2
	let pLinearBones;

	const fFrame = cycle * (animdesc.numframes - 1);

	const iFrame = Math.floor(fFrame);
	const s = (fFrame - iFrame);
	//iFrame = 0;
	//console.log(pStudioHdr.getAnimFrame(animdesc, iFrame));
	const testRemoveMe = pStudioHdr.getAnimFrame(dynamicProp, animdesc, iFrame);
	//console.log(iFrame);

	let iLocalFrame = iFrame;
	let flStall;
	const panims = animdesc.pAnim(iLocalFrame, flStall);
	//animdesc.mdl.getAnimFrame(animdesc, 31);

	//const pweight = seqdesc.pBoneweight(0);

	// if the animation isn't available, look for the zero frame cache
	if (!panims) {
		for (let i = 0, boneCount = pStudioHdr.getBoneCount(); i < boneCount; ++i) {
			const pbone = pStudioHdr.getBone(i);
			const pweight = seqdesc.pBoneweight(i);
			if (pweight > 0 && (pStudioHdr.boneFlags(i) & boneMask)) {
				if (animdesc.flags & STUDIO_DELTA) {
					q[i] = quat.create();//TODOV2
					pos[i] = vec3.create();//TODOV2
				} else {
					//q[i] = pbone.rot;TODOv2
					q[i] = q[i] || quat.create();
					pos[i] = pos[i] || vec3.create();
					q[i] = quat.create();
					pos[i] = vec3.create();
					//quat.fromMat3(q[i], mat3.fromEuler(SourceEngineTempMat3, pbone.rot));
					quatFromEulerRad(q[i], pbone.rot[0], pbone.rot[1], pbone.rot[2]);
					vec3.copy(pos[i], pbone.position);
				}
			}
		}

		//CalcZeroframeData(pStudioHdr, pStudioHdr->GetRenderHdr(), NULL, pStudioHdr->pBone(0), animdesc, fFrame, pos, q, boneMask, 1.0);
		CalcZeroframeData2(pStudioHdr, pStudioHdr, null, pStudioHdr.getBone(0), animdesc, fFrame, pos, q, boneMask, 1.0);

		return;
	}

	// BUGBUG: the sequence, the anim, and the model can have all different bone mappings.
	//for (i = 0; i < pStudioHdr->numbones(); i++, pbone++, pweight++)
	let panim = panims[0];
	for (let i = 0, boneCount = pStudioHdr.getBoneCount(), animIndex = 0; i < boneCount; ++i) {
		const pbone = pStudioHdr.getBone(i);
		const pweight = seqdesc.pBoneweight(i);

		q[i] = q[i] || quat.create();//TODOV2
		pos[i] = pos[i] || vec3.create();//TODOV2
		q[i] = quat.create();
		pos[i] = vec3.create();

		if (panim && panim.bone == i) {
			boneFlags[i] = panim.flags;
			//if (pweight > 0 && (pStudioHdr.boneFlags(i) & boneMask))
			if (pweight > 0)//TODOv2
			{
				if (animdesc.sectionframes != 0) {
					iLocalFrame = iLocalFrame % animdesc.sectionframes;
				}

				CalcBoneQuaternion2(pStudioHdr, iLocalFrame, s, pbone, pLinearBones, panim, q[i]);
				CalcBonePosition2(pStudioHdr, iLocalFrame, s, pbone, pLinearBones, panim, pos[i]);//TODOV2
				//quat.copy(q[i], pbone.quaternion);
				//vec3.copy(pos[i], pbone.position);

			}
			//panim = panim->pNext();//TODOv2
			panim = panims[++animIndex];
			//} else if (pweight > 0 && (pStudioHdr.boneFlags(i) & boneMask)) {
		} else if (pweight > 0) {
			if (animdesc.flags & STUDIO_DELTA) {
				boneFlags[i] = STUDIO_ANIM_DELTA;
				q[i] = quat.create();//TODOV2
				pos[i] = vec3.create();//TODOV2
			} else {
				boneFlags[i] = 0;
				quat.copy(q[i], pbone.quaternion);
				vec3.copy(pos[i], pbone.position);
			}
		} else {
			boneFlags[i] = STUDIO_ANIM_DELTA;
		}

		if (false && testRemoveMe !== null) {
			const testRemoveMebones = testRemoveMe.bones[pbone.name];
			//quat.fromMat3(q[i], mat3.fromEuler(SourceEngineTempMat3, testRemoveMe.bones[pbone.name].rot));
			if (testRemoveMebones !== undefined && testRemoveMebones.valid) {
				vec3.copy(pos[i], testRemoveMebones.pos);
				//quat.fromEuler(q[i], testRemoveMebones.rot[0], testRemoveMebones.rot[1], testRemoveMebones.rot[2]);
				testRemoveMebones.valid = false;
			}
		} else {
			/*if (testRemoveMe && testRemoveMe.bones[pbone.name]) {
				//quat.fromMat3(q[i], mat3.fromEuler(SourceEngineTempMat3, testRemoveMe.bones[pbone.name].rot));
				vec3.copy(pos[i], testRemoveMe.bones[pbone.name].pos);
			} else {*/
			//quat.copy(q[i], pbone.quaternion);
			//quat.copy(pos[i], pbone.position);
		}
	}

	// cross fade in previous zeroframe data
	if (flStall > 0.0) {
		CalcZeroframeData2(pStudioHdr, pStudioHdr, null, pStudioHdr.getBone(0), animdesc, fFrame, pos, q, boneMask, flStall);
	}

	//console.error(animdesc.numlocalhierarchy);
	if (false && animdesc.numlocalhierarchy) {//TODOv2
		const boneToWorld = mat4.create();//TODOv2
		let boneComputed;

		for (let i = 0; i < animdesc.numlocalhierarchy; ++i) {
			const pHierarchy = animdesc.pHierarchy(i);

			if (!pHierarchy) {
				break;
			}
			/*

			if (pStudioHdr.boneFlags(pHierarchy.iBone) & boneMask) {
				if (pStudioHdr.boneFlags(pHierarchy.iNewParent) & boneMask) {
					CalcLocalHierarchyAnimation(pStudioHdr, boneToWorld, boneComputed, pos, q, pbone, pHierarchy, pHierarchy.iBone, pHierarchy.iNewParent, cycle, iFrame, s, boneMask);
				}
			}
				*/

		}

		//g_MatrixPool.Free(boneToWorld);TODOv2
	}
}

//-----------------------------------------------------------------------------
// Purpose: return a sub frame rotation for a single bone
//-----------------------------------------------------------------------------
/*void CalcBoneQuaternion(int frame, float s,
						const Quaternion &baseQuat, const RadianEuler &baseRot, const Vector &baseRotScale,
						int iBaseFlags, const Quaternion &baseAlignment,
						const mstudioanim_t *panim, Quaternion &q)*/
function _CalcBoneQuaternion2(pStudioHdr, frame, s, baseQuat, baseRot, baseRotScale, iBaseFlags, baseAlignment, panim, q) {
	if (panim.flags & STUDIO_ANIM_RAWROT) {
		//q = panim.pQuat48();
		quat.copy(q, panim.rawrot);//TODOv2
		return;
	}

	if (panim.flags & STUDIO_ANIM_RAWROT2) {
		//q = panim.pQuat64();
		quat.copy(q, panim.rawrot2);//TODOv2
		q[0] = panim.rawrot2[2];
		q[1] = panim.rawrot2[1];
		q[2] = panim.rawrot2[0];
		q[3] = panim.rawrot2[3];
		return;
	}

	if (!(panim.flags & STUDIO_ANIM_ANIMROT)) {
		if (panim.flags & STUDIO_ANIM_DELTA) {
			quat.identity(q);
		} else {
			quat.copy(q, baseQuat);//TODOv2
		}
		return;
	}

	const pValuesPtr = panim.animValuePtrRot;

	if (s > 0.001) {
		const angle1 = vec3.create(), angle2 = vec3.create(); // TODO: optimize
		const q1 = quat.create();
		const q2 = quat.create();

		for (let i = 0; i < 3; ++i) {
			const offset = panim.animValuePtrRot.offset[i];
			if (offset) {
				angle1[i] = panim.readValue(pStudioHdr, frame, panim.animValuePtrRot.base + offset, panim.bone, i) * baseRotScale[i];
				angle2[i] = angle1[i];
			}
		}

		if (!(panim.flags & STUDIO_ANIM_DELTA)) {
			angle1[0] = angle1[0] + baseRot[0];
			angle1[1] = angle1[1] + baseRot[1];
			angle1[2] = angle1[2] + baseRot[2];
			angle2[0] = angle2[0] + baseRot[0];
			angle2[1] = angle2[1] + baseRot[1];
			angle2[2] = angle2[2] + baseRot[2];
		}

		if (angle1[0] !== angle2[0] || angle1[1] !== angle2[1] || angle1[2] !== angle2[2]) {
			//_AngleQuaternion(angle1, q1);//TODOv2
			//_AngleQuaternion(angle2, q2);//TODOv2
			quatFromEulerRad(q1, angle1[0], angle1[1], angle1[2]);
			quatFromEulerRad(q2, angle2[0], angle2[1], angle2[2]);

			QuaternionBlend2(q1, q2, s, q);
		} else {
			//_AngleQuaternion(angle1, q);//TODOv2
			//quat.fromMat3(q, mat3.fromEuler(SourceEngineTempMat3, angle1));
			quatFromEulerRad(q, angle1[0], angle1[1], angle1[2]);
		}
	} else {
		const angle = vec3.create();
		for (let i = 0; i < 3; ++i) {
			const offset = panim.animValuePtrRot.offset[i];
			if (offset) {
				angle[i] = panim.readValue(pStudioHdr, frame, panim.animValuePtrRot.base + offset, panim.bone, i) * baseRotScale[i];
			}
		}

		if (!(panim.flags & STUDIO_ANIM_DELTA)) {
			angle[0] = angle[0] + baseRot[0];
			angle[1] = angle[1] + baseRot[1];
			angle[2] = angle[2] + baseRot[2];
		}

		//_AngleQuaternion(angle, q);//TODOv2
		//quat.fromMat3(q, mat3.fromEuler(SourceEngineTempMat3, angle));
		quatFromEulerRad(q, angle[0], angle[1], angle[2]);
	}


	// align to unified bone
	if (!(panim.flags & STUDIO_ANIM_DELTA) && (iBaseFlags & BONE_FIXED_ALIGNMENT)) {
		QuaternionAlign2(baseAlignment, q, q);
	}
}

function CalcBoneQuaternion2(pStudioHdr, frame, s, pBone, pLinearBones, panim, q) {
	if (false && pLinearBones) {//TODOv2
		//CalcBoneQuaternion(pStudioHdr,	frame, s, pLinearBones->quat(panim.bone), pLinearBones->rot(panim.bone), pLinearBones->rotscale(panim.bone), pLinearBones->flags(panim.bone), pLinearBones->qalignment(panim.bone), panim, q);
	} else {
		_CalcBoneQuaternion2(pStudioHdr, frame, s, pBone.quaternion, pBone.rot, pBone.rotscale, pBone.flags, pBone.qAlignment, panim, q);
		//_CalcBoneQuaternion(pStudioHdr, frame, s, pBone.quat, [0, 0, 0]/*pBone.rot*//*TODOV2*/, pBone.rotscale, pBone.flags, pBone.qAlignment, panim, q);
	}
}

function _CalcBonePosition2(pStudioHdr, frame, s, basePos, baseBoneScale, panim, pos) {
	if (panim.flags & STUDIO_ANIM_RAWPOS) {
		vec3.copy(pos, panim.rawpos);
		return;
	} else if (!(panim.flags & STUDIO_ANIM_ANIMPOS)) {
		if (panim.flags & STUDIO_ANIM_DELTA) {
			vec3.zero(pos);
		} else {
			vec3.copy(pos, basePos);
		}
		return;
	}

	const pValuesPtr = panim.animValuePtrPos;
	/*
		mstudioanim_valueptr_t *pPosV = panim.pPosV();
		int					j;
	*/
	if (s > 0.001) {
		let v1, v2; // TODO: optimize
		for (let i = 0; i < 3; i++) {
			const offset = panim.animValuePtrPos.offset[i];
			if (offset) {
				//ExtractAnimValue(frame, pPosV->pAnimvalue(i), baseBoneScale[i], v1, v2);
				v1 = panim.readValue(pStudioHdr, frame, panim.animValuePtrPos.base + offset, panim.bone, i) * baseBoneScale[i];
				v2 = v1;
				pos[i] = v1 * (1.0 - s) + v2 * s;
			}
		}
	} else {
		for (let i = 0; i < 3; i++) {
			//ExtractAnimValue(frame, pPosV->pAnimvalue(i), baseBoneScale[i], pos[i]);
			const offset = panim.animValuePtrPos.offset[i];
			if (offset) {
				//ExtractAnimValue(frame, pPosV->pAnimvalue(i), baseBoneScale[i], v1, v2);
				pos[i] = panim.readValue(pStudioHdr, frame, panim.animValuePtrPos.base + offset, panim.bone, i) * baseBoneScale[i];
			}
		}
	}

	if (!(panim.flags & STUDIO_ANIM_DELTA)) {
		pos[0] = pos[0] + basePos[0];
		pos[1] = pos[1] + basePos[1];
		pos[2] = pos[2] + basePos[2];
	}
}

function CalcBonePosition2(pStudioHdr, frame, s, pBone, pLinearBones, panim, pos) {
	if (false && pLinearBones) {//TODOv2
		_CalcBonePosition2(pStudioHdr, frame, s, pLinearBones.pos(panim.bone), pLinearBones.posscale(panim.bone), panim, pos);
	} else {
		_CalcBonePosition2(pStudioHdr, frame, s, pBone.position, pBone.posscale, panim, pos);
	}
}

//-----------------------------------------------------------------------------
// Do a piecewise addition of the quaternion elements. This actually makes little
// mathematical sense, but it's a cheap way to simulate a slerp.
//-----------------------------------------------------------------------------
//void QuaternionBlend(const Quaternion &p, const Quaternion &q, float t, Quaternion &qt)
function QuaternionBlend2(p, q, t, qt) {
	// decide if one of the quaternions is backwards
	const q2 = quat.create();
	QuaternionAlign2(p, q, q2);
	QuaternionBlendNoAlign2(p, q2, t, qt);
}

//void QuaternionBlendNoAlign(const Quaternion &p, const Quaternion &q, float t, Quaternion &qt)
function QuaternionBlendNoAlign2(p, q, t, qt) {
	// 0.0 returns p, 1.0 return q.
	const sclp = 1.0 - t;
	const sclq = t;
	for (let i = 0; i < 4; ++i) {
		qt[i] = sclp * p[i] + sclq * q[i];
	}
	quat.normalize(qt, qt);
}

//-----------------------------------------------------------------------------
// make sure quaternions are within 180 degrees of one another, if not, reverse q
//-----------------------------------------------------------------------------
//void QuaternionAlign(const Quaternion &p, const Quaternion &q, Quaternion &qt)
function QuaternionAlign2(p, q, qt) {
	// FIXME: can this be done with a quat dot product?

	// decide if one of the quaternions is backwards
	let a = 0;
	let b = 0;
	for (let i = 0; i < 4; ++i) {
		a += (p[i] - q[i]) * (p[i] - q[i]);
		b += (p[i] + q[i]) * (p[i] + q[i]);
	}
	if (a > b) {
		for (let i = 0; i < 4; ++i) {
			qt[i] = -q[i];
		}
	}
	else if (qt != q) {
		for (let i = 0; i < 4; ++i) {
			qt[i] = q[i];
		}
	}
}




//-----------------------------------------------------------------------------
// Purpose: Calc Zeroframe Data
//-----------------------------------------------------------------------------
function CalcZeroframeData2(pStudioHdr, pAnimStudioHdr, pAnimGroup, pAnimbone, animdesc, fFrame, pos, q, boneMask, flWeight) {
	/* TODO
		let pData = animdesc.pZeroFrameData();

		if (!pData) {
			return;
		}

		// Msg('zeroframe %s\n', animdesc.pszName());
		let i;
		if (animdesc.zeroframecount == 1) {
			for (let j = 0, boneCount = pStudioHdr.getBoneCount(); j < boneCount; ++j) {
				if (pAnimGroup)
					i = pAnimGroup.masterBone[j];
				else
					i = j;

				if (pAnimbone[j].flags & BONE_HAS_SAVEFRAME_POS) {
					if ((i >= 0) && (pStudioHdr.boneFlags(i) & boneMask)) {
						const p = vec3.create();//TODOv2
						console.error('const p = *(Vector48 *)pData;//TODOv2');
						pos[i] = pos[i] * (1.0 - flWeight) + p * flWeight;
					}
					pData += 6;//sizeof(Vector48);//TODOv2
				}
				if (pAnimbone[j].flags & BONE_HAS_SAVEFRAME_ROT) {
					if ((i >= 0) && (pStudioHdr.boneFlags(i) & boneMask)) {
						const q0 = quat.create();//*(Quaternion64 *)pData;
						console.error('const q0 = quat.create();//*(Quaternion64 *)pData;');
						QuaternionBlend(q[i], q0, flWeight, q[i]);
						//Assert(q[i].IsValid());
					}
					pData += 8;//sizeof(Quaternion64);
				}
			}
		}
		else {
			let s1;
			let index = fFrame / animdesc.zeroframespan;
			if (index >= animdesc.zeroframecount - 1) {
				index = animdesc.zeroframecount - 2;
				s1 = 1.0;
			} else {
				s1 = clamp((fFrame - index * animdesc.zeroframespan) / animdesc.zeroframespan, 0.0, 1.0);
			}
			let i0 = Math.max(index - 1, 0);
			let i1 = index;
			let i2 = Math.min(index + 1, animdesc.zeroframecount - 1);
			for (let j = 0, boneCount = pStudioHdr.getBoneCount(); j < boneCount; ++j) {
				if (pAnimGroup)
					i = pAnimGroup.masterBone[j];
				else
					i = j;

				if (pAnimbone[j].flags & BONE_HAS_SAVEFRAME_POS) {
					if ((i >= 0) && (pStudioHdr.boneFlags(i) & boneMask)) {
						const p0 = vec3.create();//*(((Vector48 *)pData) + i0);//optimize
						const p1 = vec3.create();//*(((Vector48 *)pData) + i1);
						const p2 = vec3.create();//*(((Vector48 *)pData) + i2);
						console.error('Vector p2 = *(((Vector48 *)pData) + i2);');
						let p3;
						Hermite_Spline(p0, p1, p2, s1, p3);
						pos[i] = pos[i] * (1.0 - flWeight) + p3 * flWeight;
					}
					pData += sizeof(Vector48) * animdesc.zeroframecount;
				}
				if (pAnimbone[j].flags & BONE_HAS_SAVEFRAME_ROT) {
					if ((i >= 0) && (pStudioHdr.boneFlags(i) & boneMask)) {
						const q0 = quat.create();//*(((Quaternion64 *)pData) + i0);
						const q1 = quat.create();//*(((Quaternion64 *)pData) + i1);
						const q2 = quat.create();//*(((Quaternion64 *)pData) + i2);
						console.error('Quaternion q0 = *(((Quaternion64 *)pData) + i0);');
						if (flWeight == 1.0) {
							Hermite_Spline(q0, q1, q2, s1, q[i]);
						}
						else {
							let q3;
							Hermite_Spline(q0, q1, q2, s1, q3);
							QuaternionBlend(q[i], q3, flWeight, q[i]);
						}
					}
					pData += sizeof(Quaternion64) * animdesc.zeroframecount;
				}
			}
		}
	*/
}



function PoseIsAllZeros2(pStudioHdr, sequence, seqdesc, i0, i1) {
	// remove 'zero' positional blends
	//const baseanim = pStudioHdr.iRelativeAnim(sequence, seqdesc.getBlend(i0 , i1));//TODOv2
	const baseanim = seqdesc.getBlend(i0, i1);
	const anim = pStudioHdr.getAnimDescription(baseanim);
	if (!anim) {
		return false;
	}
	return (anim.flags & STUDIO_ALLZEROS) != 0;
}

//-----------------------------------------------------------------------------
// Purpose: turn a 2x2 blend into a 3 way triangle blend
// Returns: returns the animination indices and barycentric coordinates of a triangle
//			the triangle is a right triangle, and the diagonal is between elements [0] and [2]
//-----------------------------------------------------------------------------
//void Calc3WayBlendIndices(int i0, int i1, float s0, float s1, const mstudioseqdesc_t &seqdesc, int *pAnimIndices, float *pWeight)
function Calc3WayBlendIndices2(i0, i1, s0, s1, seqdesc, pAnimIndices, pWeight) {
	// Figure out which bi-section direction we are using to make triangles.
	const bEven = (((i0 + i1) & 0x1) == 0);

	let x1, y1;
	let x2, y2;
	let x3, y3;

	// diagonal is between elements 1 & 3
	// TL to BR
	if (bEven) {
		if (s0 > s1) {
			// B
			x1 = 0; y1 = 0;
			x2 = 1; y2 = 0;
			x3 = 1; y3 = 1;
			pWeight[0] = (1.0 - s0);
			pWeight[1] = s0 - s1;
		} else {
			// C
			x1 = 1; y1 = 1;
			x2 = 0; y2 = 1;
			x3 = 0; y3 = 0;
			pWeight[0] = s0;
			pWeight[1] = s1 - s0;
		}
	}
	// BL to TR
	else {
		const flTotal = s0 + s1;

		if (flTotal > 1.0) {
			// D
			x1 = 1; y1 = 0;
			x2 = 1; y2 = 1;
			x3 = 0; y3 = 1;
			pWeight[0] = (1.0 - s1);
			pWeight[1] = s0 - 1.0 + s1;
		}
		else {
			// A
			x1 = 0; y1 = 1;
			x2 = 0; y2 = 0;
			x3 = 1; y3 = 0;
			pWeight[0] = s1;
			pWeight[1] = 1.0 - s0 - s1;
		}
	}

	pAnimIndices[0] = seqdesc.getBlend(i0 + x1, i1 + y1);
	pAnimIndices[1] = seqdesc.getBlend(i0 + x2, i1 + y2);
	pAnimIndices[2] = seqdesc.getBlend(i0 + x3, i1 + y3);

	// clamp the diagonal
	if (pWeight[1] < 0.001)
		pWeight[1] = 0.0;
	pWeight[2] = 1.0 - pWeight[0] - pWeight[1];

	//Assert(pWeight[0] >= 0.0 && pWeight[0] <= 1.0);
	//Assert(pWeight[1] >= 0.0 && pWeight[1] <= 1.0);
	//Assert(pWeight[2] >= 0.0 && pWeight[2] <= 1.0);
}

//-----------------------------------------------------------------------------
// Purpose: calculate a pose for a single sequence //TODOv2
//			adds autolayers, runs local ik rukes
//-----------------------------------------------------------------------------
const AddSequenceLayers2 = function (dynamicProp, pStudioHdr, pIKContext, pos, q, boneFlags: Array<number>, seqdesc, sequence, cycle, poseParameter, boneMask, flWeight, flTime) {
	//return;
	for (let i = 0; i < seqdesc.numautolayers; ++i) {
		const pLayer = seqdesc.getAutoLayer(i);

		if (pLayer.flags & STUDIO_AL_LOCAL) {
			continue;
		}

		let layerCycle = cycle;
		let layerWeight = flWeight;

		if (pLayer.start != pLayer.end) {
			let s = 1.0;
			let index;

			if (!(pLayer.flags & STUDIO_AL_POSE)) {
				index = cycle;
			} else {
				//TODOv2
				const iSequence = pLayer.iSequence;//int iSequence = pStudioHdr.iRelativeSeq(sequence, pLayer.iSequence);
				//const iPose = pStudioHdr.GetSharedPoseParameter(iSequence, pLayer.iPose);
				const iPose = pLayer.iPose;
				if (iPose != -1) {
					//const Pose = pStudioHdr.pPoseParameter(iPose);
					const Pose = pStudioHdr.getLocalPoseParameter(iPose);
					if (Pose) {
						index = poseParameter[iPose] * (Pose.end - Pose.start) + Pose.start;
					} else {
						index = 0;
					}
				} else {
					index = 0;
				}
			}

			if (index < pLayer.start) {
				continue;
			}
			if (index >= pLayer.end) {
				continue;
			}

			if (index < pLayer.peak && pLayer.start != pLayer.peak) {
				s = (index - pLayer.start) / (pLayer.peak - pLayer.start);
			} else if (index > pLayer.tail && pLayer.end != pLayer.tail) {
				s = (pLayer.end - index) / (pLayer.end - pLayer.tail);
			}

			if (pLayer.flags & STUDIO_AL_SPLINE) {
				s = SimpleSpline(s);
			}

			if ((pLayer.flags & STUDIO_AL_XFADE) && (index > pLayer.tail)) {
				layerWeight = (s * flWeight) / (1 - flWeight + s * flWeight);
			} else if (pLayer.flags & STUDIO_AL_NOBLEND) {
				layerWeight = s;
			} else {
				layerWeight = flWeight * s;
			}

			if (!(pLayer.flags & STUDIO_AL_POSE)) {
				layerCycle = (cycle - pLayer.start) / (pLayer.end - pLayer.start);
			}
		}

		//const iSequence = pStudioHdr.iRelativeSeq(sequence, pLayer.iSequence);//TODOV2
		const iSequence = pLayer.iSequence;//pStudioHdr.getSequenceById(pLayer.iSequence);
		AccumulatePose2(dynamicProp, pStudioHdr, pIKContext, pos, q, boneFlags, iSequence, layerCycle, poseParameter, boneMask, layerWeight, flTime);
	}
}

//-----------------------------------------------------------------------------
// Purpose: accumulate a pose for a single sequence on top of existing animation
//			adds autolayers, runs local ik rukes
//-----------------------------------------------------------------------------
const AccumulatePose_pos2 = Array(SOURCE_MODEL_MAX_BONES);
const AccumulatePose_q2 = Array(SOURCE_MODEL_MAX_BONES);
for (let i = 0; i < SOURCE_MODEL_MAX_BONES; i++) {
	AccumulatePose_pos2[i] = vec3.create();
	AccumulatePose_q2[i] = quat.create();
}
function AccumulatePose2(dynamicProp, pStudioHdr, pIKContext, pos, q, boneFlags: Array<number>, sequence, cycle, poseParameter, boneMask, flWeight, flTime) {
	//const pos2 = [];
	//const q2 = [];
	const pos2 = AccumulatePose_pos2;
	const q2 = AccumulatePose_q2;

	// This shouldn't be necessary, but the Assert should help us catch whoever is screwing this up
	flWeight = clamp(flWeight, 0.0, 1.0);

	if (sequence < 0) {
		return;
	}

	const seqdesc = pStudioHdr.getSequenceById(sequence);

	// add any IK locks to prevent extremities from moving
	let seq_ik;
	if (false && seqdesc.numiklocks) {//TODOv2
		/*
		seq_ik.Init(pStudioHdr, vec3_angle, vec3_origin, 0.0, 0, boneMask);	// local space relative so absolute position doesn't mater
		seq_ik.AddSequenceLocks(seqdesc, pos, q);
		*/
	}

	if (seqdesc.flags & STUDIO_LOCAL) {
		InitPose2(dynamicProp, pStudioHdr, pos2, q2, boneMask);
	}

	/*
	if (CalcPoseSingle(dynamicProp, pStudioHdr, pos2, q2, boneFlags, seqdesc, sequence, cycle, poseParameter, boneMask, flTime)) {
		// this weight is wrong, the IK rules won't composite at the correct intensity
		AddLocalLayers(dynamicProp, pStudioHdr, pIKContext, pos2, q2, boneFlags, seqdesc, sequence, cycle, poseParameter, boneMask, 1.0, flTime);
		SlerpBones(pStudioHdr, q, pos, seqdesc, sequence, q2, pos2, flWeight, boneMask);
	}
	*/

	if (pIKContext) {
		pIKContext.AddDependencies(seqdesc, sequence, cycle, poseParameter, flWeight);
	}

	AddSequenceLayers2(dynamicProp, pStudioHdr, pIKContext, pos, q, boneFlags, seqdesc, sequence, cycle, poseParameter, boneMask, flWeight, flTime);

	if (false && seqdesc.numiklocks)//TODOv2
	{
		seq_ik.SolveSequenceLocks(seqdesc, pos, q);
	}
}

//-----------------------------------------------------------------------------
// Purpose: calculate a pose for a single sequence
//			adds autolayers, runs local ik rukes
//-----------------------------------------------------------------------------
function AddLocalLayers2(dynamicProp, pStudioHdr, pIKContext, pos, q, boneFlags: Array<number>, seqdesc, sequence, cycle, poseParameter, boneMask, flWeight, flTime) {
	if (!(seqdesc.flags & STUDIO_LOCAL)) {
		return;
	}

	for (let i = 0; i < seqdesc.numautolayers; ++i) {
		const pLayer = seqdesc.pAutolayer(i);

		if (!(pLayer.flags & STUDIO_AL_LOCAL))
			continue;

		let layerCycle = cycle;
		let layerWeight = flWeight;

		if (pLayer.start != pLayer.end) {
			let s = 1.0;

			if (cycle < pLayer.start)
				continue;
			if (cycle >= pLayer.end)
				continue;

			if (cycle < pLayer.peak && pLayer.start != pLayer.peak) {
				s = (cycle - pLayer.start) / (pLayer.peak - pLayer.start);
			}
			else if (cycle > pLayer.tail && pLayer.end != pLayer.tail) {
				s = (pLayer.end - cycle) / (pLayer.end - pLayer.tail);
			}

			if (pLayer.flags & STUDIO_AL_SPLINE) {
				s = SimpleSpline(s);
			}

			if ((pLayer.flags & STUDIO_AL_XFADE) && (cycle > pLayer.tail)) {
				layerWeight = (s * flWeight) / (1 - flWeight + s * flWeight);
			}
			else if (pLayer.flags & STUDIO_AL_NOBLEND) {
				layerWeight = s;
			}
			else {
				layerWeight = flWeight * s;
			}

			layerCycle = (cycle - pLayer.start) / (pLayer.end - pLayer.start);
		}

		const iSequence = pLayer.iSequence;//pStudioHdr.iRelativeSeq(sequence, pLayer.iSequence);
		AccumulatePose2(dynamicProp, pStudioHdr, pIKContext, pos, q, boneFlags, iSequence, layerCycle, poseParameter, boneMask, layerWeight, flTime);
	}
}


//-----------------------------------------------------------------------------
// Purpose: blend together q1,pos1 with q2,pos2.	Return result in q1,pos1.
//			0 returns q1, pos1.	1 returns q2, pos2
//-----------------------------------------------------------------------------
function SlerpBones2(pStudioHdr, q1, pos1, seqdesc, sequence, q2, pos2, s, boneMask) {
	if (s <= 0.0)
		return;
	if (s > 1.0) {
		s = 1.0;
	}

	if (seqdesc.flags & STUDIO_WORLD) {
		//WorldSpaceSlerp(pStudioHdr, q1, pos1, seqdesc, sequence, q2, pos2, s, boneMask);
		return;
	}

	/*virtualmodel_t *pVModel = pStudioHdr->GetVirtualModel();TODOv2
	const virtualgroup_t *pSeqGroup = NULL;
	if (pVModel)
	{
		pSeqGroup = pVModel->pSeqGroup(sequence);
	} */
	let pSeqGroup;

	// Build weightlist for all bones
	const nBoneCount = pStudioHdr.getBoneCount();
	//const *pS2 = (float*)stackalloc(nBoneCount * sizeof(float));TODOv2
	const pS2 = [];
	for (let i = 0; i < nBoneCount; ++i) {


		q1[i] = q1[i] || q2[i] || quat.create();//TODOV2
		pos1[i] = pos1[i] || pos2[i] || vec3.create();
		q2[i] = q2[i] || quat.create();//TODOV2
		pos2[i] = pos2[i] || vec3.create();


		// skip unused bones
		if (false/*TODO: fix that ?*/ && !(pStudioHdr.boneFlags(i) & boneMask)) {
			pS2[i] = 0.0;
			continue;
		}

		if (!pSeqGroup) {
			pS2[i] = s * seqdesc.pBoneweight(i);	// blend in based on this bones weight
			continue;
		}

		let j = i;//pSeqGroup.boneMap[i];TODOv2
		if (j >= 0) {
			pS2[i] = s * seqdesc.weight(j);	// blend in based on this bones weight
		}
		else {
			pS2[i] = 0.0;
		}
	}

	let s1, s2;
	if (seqdesc.flags & STUDIO_DELTA) {
		for (let i = 0; i < nBoneCount; ++i) {
			s2 = pS2[i];
			if (s2 <= 0.0)
				continue;

			if (seqdesc.flags & STUDIO_POST) {
				QuaternionMA2(q1[i], s2, q2[i], q1[i]);

				// FIXME: are these correct?
				pos1[i][0] = pos1[i][0] + pos2[i][0] * s2;
				pos1[i][1] = pos1[i][1] + pos2[i][1] * s2;
				pos1[i][2] = pos1[i][2] + pos2[i][2] * s2;
			}
			else {
				QuaternionSM2(s2, q2[i], q1[i], q1[i]);

				// FIXME: are these correct?
				pos1[i][0] = pos1[i][0] + pos2[i][0] * s2;
				pos1[i][1] = pos1[i][1] + pos2[i][1] * s2;
				pos1[i][2] = pos1[i][2] + pos2[i][2] * s2;
			}
		}
		return;
	}

	const q3 = quat.create();
	for (let i = 0; i < nBoneCount; ++i) {
		s2 = pS2[i];
		if (s2 <= 0.0)
			continue;

		s1 = 1.0 - s2;

		if (pStudioHdr.boneFlags(i) & BONE_FIXED_ALIGNMENT) {
			QuaternionSlerpNoAlign2(q2[i], q1[i], s1, q3);
		} else {
			QuaternionSlerp2(q2[i], q1[i], s1, q3);
		}

		q1[i][0] = q3[0];
		q1[i][1] = q3[1];
		q1[i][2] = q3[2];
		q1[i][3] = q3[3];

		pos1[i][0] = pos1[i][0] * s1 + pos2[i][0] * s2;
		pos1[i][1] = pos1[i][1] * s1 + pos2[i][1] * s2;
		pos1[i][2] = pos1[i][2] * s1 + pos2[i][2] * s2;
	}
}

//-----------------------------------------------------------------------------
// Purpose: qt = p * (s * q)
//-----------------------------------------------------------------------------
//void QuaternionMA(const Quaternion &p, float s, const Quaternion &q, Quaternion &qt)
function QuaternionMA2(p, s, q, qt) {
	const p1 = quat.create();
	const q1 = quat.create();

	QuaternionScale2(q, s, q1);
	quat.mul(p1, p, q1);
	quat.normalize(p1, p1);
	qt[0] = p1[0];
	qt[1] = p1[1];
	qt[2] = p1[2];
	qt[3] = p1[3];
}
//-----------------------------------------------------------------------------
// Purpose: qt = (s * p) * q
//-----------------------------------------------------------------------------
//void QuaternionSM(float s, const Quaternion &p, const Quaternion &q, Quaternion &qt)
function QuaternionSM2(s, p, q, qt) {
	const p1 = quat.create();
	const q1 = quat.create();

	QuaternionScale2(p, s, p1);
	quat.mul(q1, p1, q);
	quat.normalize(q1, q1);//QuaternionNormalize(q1);
	qt[0] = q1[0];
	qt[1] = q1[1];
	qt[2] = q1[2];
	qt[3] = q1[3];
}

//void QuaternionScale(const Quaternion &p, float t, Quaternion &q);
function QuaternionScale2(p, t, q) {
	let r;

	// FIXME: nick, this isn't overly sensitive to accuracy, and it may be faster to
	// use the cos part (w) of the quaternion (sin(omega)*N,cos(omega)) to figure the new scale.
	let sinom = Math.sqrt(vec3.dot(p, p));
	sinom = Math.min(sinom, 1.0);

	const sinsom = Math.sin(Math.asin(sinom) * t);

	t = sinsom / (sinom + FLT_EPSILON);
	vec3.scale(q, p, t);

	// rescale rotation
	r = 1.0 - sinsom * sinsom;

	// Assert(r >= 0);
	if (r < 0.0) {
		r = 0.0;
	}
	r = Math.sqrt(r);

	// keep sign of rotation
	if (p.w < 0) {
		q.w = -r;
	} else {
		q.w = r;
	}

	return;
}

//-----------------------------------------------------------------------------
// Purpose: Inter-animation blend.	Assumes both types are identical.
//			blend together q1,pos1 with q2,pos2.	Return result in q1,pos1.
//			0 returns q1, pos1.	1 returns q2, pos2
//-----------------------------------------------------------------------------
/*void BlendBones(
	const CStudioHdr *pStudioHdr,
	Quaternion q1[MAXSTUDIOBONES],
	Vector pos1[MAXSTUDIOBONES],
	mstudioseqdesc_t &seqdesc,
	int sequence,
	const Quaternion q2[MAXSTUDIOBONES],
	const Vector pos2[MAXSTUDIOBONES],
	float s,
	int boneMask)*/
function BlendBones2(pStudioHdr, q1, pos1, seqdesc, sequence, q2, pos2, s, boneMask) {
	const q3 = quat.create();

	const pSeqGroup = null;
	/*virtualmodel_t *pVModel = pStudioHdr.GetVirtualModel();TODO
	const virtualgroup_t *pSeqGroup = NULL;
	if (pVModel)
	{
		pSeqGroup = pVModel.pSeqGroup(sequence);
	}*/

	if (s <= 0) {
		//Assert(0); // shouldn't have been called
		return;
	} else if (s >= 1.0) {
		//Assert(0); // shouldn't have been called
		for (let i = 0, boneCount = pStudioHdr.getBoneCount(); i < boneCount; ++i) {
			let j;
			// skip unused bones
			if (!(pStudioHdr.boneFlags(i) & boneMask)) {
				continue;
			}

			if (pSeqGroup) {
				j = pSeqGroup.boneMap[i];
			}
			else {
				j = i;
			}

			if (j >= 0 && seqdesc.pBoneweight(j) > 0.0) {
				q1[i] = q2[i];
				pos1[i] = pos2[i];
			}
		}
		return;
	}

	const s2 = s;
	const s1 = 1.0 - s2;

	for (let i = 0, boneCount = pStudioHdr.getBoneCount(); i < boneCount; ++i) {
		let j;
		// skip unused bones

		q1[i] = q1[i] || quat.create();
		pos1[i] = pos1[i] || vec3.create();
		q2[i] = q2[i] || quat.create();
		pos2[i] = pos2[i] || vec3.create();

		if (!(pStudioHdr.boneFlags(i) & boneMask)) {
			continue;
		}

		if (pSeqGroup) {
			j = pSeqGroup.boneMap[i];
		}
		else {
			j = i;
		}

		if (j >= 0 && seqdesc.pBoneweight(j) > 0.0) {
			if (pStudioHdr.boneFlags(i) & BONE_FIXED_ALIGNMENT) {
				QuaternionBlendNoAlign2(q2[i], q1[i], s1, q3);
			}
			else {
				QuaternionBlend2(q2[i], q1[i], s1, q3);
			}
			q1[i][0] = q3[0];
			q1[i][1] = q3[1];
			q1[i][2] = q3[2];
			q1[i][3] = q3[3];
			pos1[i][0] = pos1[i][0] * s1 + pos2[i][0] * s2;
			pos1[i][1] = pos1[i][1] * s1 + pos2[i][1] * s2;
			pos1[i][2] = pos1[i][2] * s1 + pos2[i][2] * s2;
		}
	}
}

//-----------------------------------------------------------------------------
// Quaternion sphereical linear interpolation
//-----------------------------------------------------------------------------
//void QuaternionSlerp(const Quaternion &p, const Quaternion &q, float t, Quaternion &qt)
function QuaternionSlerp2(p, q, t, qt) {
	const q2 = quat.create();
	// 0.0 returns p, 1.0 return q.

	// decide if one of the quaternions is backwards
	QuaternionAlign2(p, q, q2);

	QuaternionSlerpNoAlign2(p, q2, t, qt);
}

//void QuaternionSlerpNoAlign(const Quaternion &p, const Quaternion &q, float t, Quaternion &qt)
function QuaternionSlerpNoAlign2(p, q, t, qt) {
	//Assert(s_bMathlibInitialized);
	let omega, cosom, sinom, sclp, sclq;

	// 0.0 returns p, 1.0 return q.

	cosom = p[0] * q[0] + p[1] * q[1] + p[2] * q[2] + p[3] * q[3];

	if ((1.0 + cosom) > 0.000001) {
		if ((1.0 - cosom) > 0.000001) {
			omega = Math.acos(cosom);
			sinom = Math.sin(omega);
			sclp = Math.sin((1.0 - t) * omega) / sinom;
			sclq = Math.sin(t * omega) / sinom;
		}
		else {
			// TODO: add short circuit for cosom == 1.0?
			sclp = 1.0 - t;
			sclq = t;
		}
		for (let i = 0; i < 4; ++i) {
			qt[i] = sclp * p[i] + sclq * q[i];
		}
	}
	else {
		//Assert(&qt != &q);

		qt[0] = -q[1];
		qt[1] = q[0];
		qt[2] = -q[3];
		qt[3] = q[2];
		sclp = Math.sin((1.0 - t) * (0.5 * Math.PI));
		sclq = Math.sin(t * (0.5 * Math.PI));
		for (let i = 0; i < 3; i++) {
			qt[i] = sclp * p[i] + sclq * qt[i];
		}
	}

	//Assert(qt.IsValid());
}
//-----------------------------------------------------------------------------
// Purpose: resolve a global pose parameter to the specific setting for this sequence
//-----------------------------------------------------------------------------
//void Studio_LocalPoseParameter(const CStudioHdr *pStudioHdr, const float poseParameter[], mstudioseqdesc_t &seqdesc, int iSequence, int iLocalIndex, float &flSetting, int &index)
function Studio_LocalPoseParameter2(pStudioHdr, poseParameter, seqdesc, iSequence, iLocalIndex/*, flSetting, index*/) {
	let flSetting = 0;
	let index = 0;

	//const iPose = pStudioHdr.GetSharedPoseParameter(iSequence, seqdesc.paramindex[iLocalIndex]);
	const iPose = seqdesc.paramindex[iLocalIndex];//TODOV2

	if (iPose == -1) {
		flSetting = 0;
		index = 0;
		return { s: flSetting, i: index };
	}

	const Pose = pStudioHdr.getLocalPoseParameter(iPose);

	if (!Pose) {
		flSetting = 0;
		index = 0;
		return { s: flSetting, i: index };
	}

	//const flValue = poseParameter[iPose];
	let flValue = Pose.midpoint;
	if (poseParameter[Pose.name] !== undefined) {
		flValue = poseParameter[Pose.name];
	}



	if (Pose.loop) {
		const wrap = (Pose.start + Pose.end) / 2.0 + Pose.loop / 2.0;
		const shift = Pose.loop - wrap;

		flValue = flValue - Pose.loop * Math.floor((flValue + shift) / Pose.loop);
	}

	if (seqdesc.posekeyindex == 0) {
		const flLocalStart = (seqdesc.paramstart[iLocalIndex] - Pose.start) / (Pose.end - Pose.start);
		const flLocalEnd = (seqdesc.paramend[iLocalIndex] - Pose.start) / (Pose.end - Pose.start);

		// convert into local range
		flSetting = (flValue - flLocalStart) / (flLocalEnd - flLocalStart);

		// clamp.	This shouldn't ever need to happen if it's looping.
		if (flSetting < 0)
			flSetting = 0;
		if (flSetting > 1)
			flSetting = 1;

		index = 0;
		if (seqdesc.groupsize[iLocalIndex] > 2) {
			// estimate index
			index = Math.round(flSetting * (seqdesc.groupsize[iLocalIndex] - 1));
			if (index == seqdesc.groupsize[iLocalIndex] - 1) index = seqdesc.groupsize[iLocalIndex] - 2;
			flSetting = flSetting * (seqdesc.groupsize[iLocalIndex] - 1) - index;
		}
	}
	else {
		flValue = flValue * (Pose.end - Pose.start) + Pose.start;
		index = 0;

		// FIXME: this needs to be 2D
		// FIXME: this shouldn't be a linear search

		while (1) {
			flSetting = (flValue - seqdesc.poseKey(iLocalIndex, index)) / (seqdesc.poseKey(iLocalIndex, index + 1) - seqdesc.poseKey(iLocalIndex, index));
			//flSetting = 0;//TODOV2
			/*
			if (index > 0 && flSetting < 0.0)
			{
				index--;
				continue;
			}
			else
			*/
			if (index < seqdesc.groupsize[iLocalIndex] - 2 && flSetting > 1.0) {
				index++;
				continue;
			}
			break;
		}

		// clamp.
		if (flSetting < 0.0)
			flSetting = 0.0;
		if (flSetting > 1.0)
			flSetting = 1.0;
	}
	return { s: flSetting, i: index };
}

function ScaleBones2(
	pStudioHdr: SourceMDL,//const CStudioHdr *pStudioHdr,
	q1: Array<quat>,//Quaternion q1[MAXSTUDIOBONES],
	pos1: Array<vec3>,//Vector pos1[MAXSTUDIOBONES],
	sequence: number,//int sequence,
	s: number,//float s,
	boneMask: number//int boneMask
): void {
	let i: number, j: number;//int			i, j;
	let q3: quat;//Quaternion		q3;

	let seqdesc = pStudioHdr.getSequenceById(sequence)//mstudioseqdesc_t & seqdesc = ((CStudioHdr *)pStudioHdr) -> pSeqdesc(sequence);

	let pSeqGroup = null;
	/*
	virtualmodel_t * pVModel = pStudioHdr -> GetVirtualModel();
	const virtualgroup_t * pSeqGroup = NULL;
	if (pVModel) {
		pSeqGroup = pVModel -> pSeqGroup(sequence);
	}
		*/

	let s2: number = s;
	let s1: number = 1.0 - s2;

	for (i = 0; i < pStudioHdr.getBoneCount(); i++) {


		// skip unused bones
		if (!(pStudioHdr.boneFlags(i) & boneMask)) {
			continue;
		}

		if (pSeqGroup) {
			j = pSeqGroup.boneMap[i];
		}
		else {
			j = i;
		}

		if (j >= 0 && seqdesc.pBoneweight(j) > 0.0) {
			QuaternionIdentityBlend(q1[i], s1, q1[i]);
			//VectorScale(pos1[i], s2, pos1[i]);
			vec3.scale(pos1[i], pos1[i], s2);
		}
	}
}



//-----------------------------------------------------------------------------
// Purpose: translate animations done in a non-standard parent space
//-----------------------------------------------------------------------------
/*
function CalcLocalHierarchyAnimation(
	pStudioHdr,//const CStudioHdr * pStudioHdr,
	boneToWorld: mat4,//matrix3x4_t * boneToWorld,
	boneComputed,//CBoneBitList & boneComputed,
	pos,//Vector * pos,
	q,//Quaternion * q,
	//const mstudioanimdesc_t &animdesc,
	pbone,//const mstudiobone_t * pbone,
	pHierarchy,//mstudiolocalhierarchy_t * pHierarchy,
	iBone: number,//int iBone,
	iNewParent: number,//int iNewParent,
	cycle: number,//float cycle,
	iFrame: number,//int iFrame,
	flFraq: number,//float flFraq,
	boneMask: number,//int boneMask
): void {

	let localPos = vec3.create();//Vector localPos;
	let localQ = quat.create();//Quaternion localQ;

	// make fake root transform
	//static ALIGN16 matrix3x4_t rootXform ALIGN16_POST(1.0f, 0, 0, 0, 0, 1.0f, 0, 0, 0, 0, 1.0f, 0);
	let rootXform = mat4.create();

	// FIXME: missing check to see if seq has a weight for this bone
	//float weight = 1.0f;
	let weight = 1;

	// check to see if there's a ramp on the influence
	if (pHierarchy -> tail - pHierarchy -> peak < 1.0f  )
	{
		float index = cycle;

		if (pHierarchy -> end > 1.0f && index < pHierarchy -> start)
		index += 1.0f;

		if (index < pHierarchy -> start)
			return;
		if (index >= pHierarchy -> end)
			return;

		if (index < pHierarchy -> peak && pHierarchy -> start != pHierarchy -> peak) {
			weight = (index - pHierarchy -> start) / (pHierarchy -> peak - pHierarchy -> start);
		}
		else if (index > pHierarchy -> tail && pHierarchy -> end != pHierarchy -> tail) {
			weight = (pHierarchy -> end - index) / (pHierarchy -> end - pHierarchy -> tail);
		}

		weight = SimpleSpline(weight);
	}

	CalcDecompressedAnimation(pHierarchy -> pLocalAnim(), iFrame - pHierarchy -> iStart, flFraq, localPos, localQ);

	BuildBoneChain(pStudioHdr, rootXform, pos, q, iBone, boneToWorld, boneComputed);

	matrix3x4_t localXform;
	AngleMatrix(localQ, localPos, localXform);

	if (iNewParent != -1) {
		BuildBoneChain(pStudioHdr, rootXform, pos, q, iNewParent, boneToWorld, boneComputed);
		ConcatTransforms(boneToWorld[iNewParent], localXform, boneToWorld[iBone]);
	}
	else {
		boneToWorld[iBone] = localXform;
	}

	// back solve
	Vector p1;
	Quaternion q1;
	int n = pbone[iBone].parent;
	if (n == -1) {
		if (weight == 1.0f)
		{
			MatrixAngles(boneToWorld[iBone], q[iBone], pos[iBone]);
		}
		else
		{
			MatrixAngles(boneToWorld[iBone], q1, p1);
			QuaternionSlerp(q[iBone], q1, weight, q[iBone]);
			pos[iBone] = Lerp(weight, p1, pos[iBone]);
		}
	}
	else {
		matrix3x4_t worldToBone;
		MatrixInvert(boneToWorld[n], worldToBone);

		matrix3x4_t local;
		ConcatTransforms(worldToBone, boneToWorld[iBone], local);
		if (weight == 1.0f)
		{
			MatrixAngles(local, q[iBone], pos[iBone]);
		}
		else
		{
			MatrixAngles(local, q1, p1);
			QuaternionSlerp(q[iBone], q1, weight, q[iBone]);
			pos[iBone] = Lerp(weight, p1, pos[iBone]);
		}
	}
}
	*/



//-----------------------------------------------------------------------------
// Purpose: blend together in world space q1,pos1 with q2,pos2.  Return result in q1,pos1.
//			0 returns q1, pos1.  1 returns q2, pos2
//-----------------------------------------------------------------------------
/*
function WorldSpaceSlerp(
	pStudioHdr,//const CStudioHdr *pStudioHdr,
	q1: Array<quat>,//Quaternion q1[MAXSTUDIOBONES],
	pos1: Array<vec3>,//Vector pos1[MAXSTUDIOBONES],
	seqdesc,//mstudioseqdesc_t &seqdesc,
	sequence: number,//int sequence,
	q2: Array<quat>,//const Quaternion q2[MAXSTUDIOBONES],
	pos2: Array<vec3>,//const Vector pos2[MAXSTUDIOBONES],
	s: number,//float s,
	boneMask: number//int boneMask
): void {
	int			i, j;
	float		s1; // weight of parent for q2, pos2
	float		s2; // weight for q2, pos2

	// make fake root transform
	matrix3x4_t rootXform;
	SetIdentityMatrix(rootXform);

	// matrices for q2, pos2
	matrix3x4_t * srcBoneToWorld = g_MatrixPool.Alloc();
	CBoneBitList srcBoneComputed;

	matrix3x4_t * destBoneToWorld = g_MatrixPool.Alloc();
	CBoneBitList destBoneComputed;

	matrix3x4_t * targetBoneToWorld = g_MatrixPool.Alloc();
	CBoneBitList targetBoneComputed;

	virtualmodel_t * pVModel = pStudioHdr -> GetVirtualModel();
	const virtualgroup_t * pSeqGroup = NULL;
	if (pVModel) {
		pSeqGroup = pVModel -> pSeqGroup(sequence);
	}

	mstudiobone_t * pbone = pStudioHdr -> pBone(0);

	for (i = 0; i < pStudioHdr -> numbones(); i++) {
		// skip unused bones
		if (!(pStudioHdr -> boneFlags(i) & boneMask)) {
			continue;
		}

		int n = pbone[i].parent;
		s1 = 0.0;
		if (pSeqGroup) {
			j = pSeqGroup -> boneMap[i];
			if (j >= 0) {
				s2 = s * seqdesc.weight(j);	// blend in based on this bones weight
				if (n != -1) {
					s1 = s * seqdesc.weight(pSeqGroup -> boneMap[n]);
				}
			}
			else {
				s2 = 0.0;
			}
		}
		else {
			s2 = s * seqdesc.weight(i);	// blend in based on this bones weight
			if (n != -1) {
				s1 = s * seqdesc.weight(n);
			}
		}

		if (s1 == 1.0 && s2 == 1.0) {
			pos1[i] = pos2[i];
			q1[i] = q2[i];
		}
		else if (s2 > 0.0) {
			Quaternion srcQ, destQ;
			Vector srcPos, destPos;
			Quaternion targetQ;
			Vector targetPos;
			Vector tmp;

			BuildBoneChain(pStudioHdr, rootXform, pos1, q1, i, destBoneToWorld, destBoneComputed);
			BuildBoneChain(pStudioHdr, rootXform, pos2, q2, i, srcBoneToWorld, srcBoneComputed);

			MatrixAngles(destBoneToWorld[i], destQ, destPos);
			MatrixAngles(srcBoneToWorld[i], srcQ, srcPos);

			QuaternionSlerp(destQ, srcQ, s2, targetQ);
			AngleMatrix(targetQ, destPos, targetBoneToWorld[i]);

			// back solve
			if (n == -1) {
				MatrixAngles(targetBoneToWorld[i], q1[i], tmp);
			}
			else {
				matrix3x4_t worldToBone;
				MatrixInvert(targetBoneToWorld[n], worldToBone);

				matrix3x4_t local;
				ConcatTransforms(worldToBone, targetBoneToWorld[i], local);
				MatrixAngles(local, q1[i], tmp);

				// blend bone lengths (local space)
				pos1[i] = Lerp(s2, pos1[i], pos2[i]);
			}
		}
	}
	g_MatrixPool.Free(srcBoneToWorld);
	g_MatrixPool.Free(destBoneToWorld);
	g_MatrixPool.Free(targetBoneToWorld);
}
*/
