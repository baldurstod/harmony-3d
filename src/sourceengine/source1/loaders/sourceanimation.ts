import { mat4, quat, vec3 } from 'gl-matrix';

import { MdlBone, BONE_USED_BY_ANYTHING } from './mdlbone.js';
import { CalcPose, Studio_Duration } from '../animations/calcanimations.js';
import { quatFromEulerRad } from '../../../math/functions';

export class SourceAnimation {
	position = vec3.create();
	boneRot = vec3.create();//TODO: remove me ?
	quaternion = quat.create();//TODOv2
	tempPos = vec3.create();
	tempRot = vec3.create();
	constructor(sourceModel?) {
	}

	animate2(dynamicProp, poseParameters, position, orientation, sequences, bonesScale) {
		const model = dynamicProp.sourceModel;

		if (!model) {return};
		const modelBones = model.getBones();
		if (!modelBones) {return};// Ensure the bones are loaded

		const parentModel = dynamicProp.parent;
		const posRemoveMeTemp = [];
		const quatRemoveMeTemp = [];
		const modelBonesLength = modelBones.length;

		const seqlist = Object.keys(sequences);
		let posRemoveMe;// = [];//optimize
		let quatRemoveMe;// = [];//optimize
		if (seqlist.length) {
			let s;
			while (s = seqlist.shift()) {
				if (sequences[s].s) {
					const sequenceMdl = sequences[s].s.mdl;

					const t = Studio_Duration(sequenceMdl, sequences[s].s.id, poseParameters);

					//InitPose(dynamicProp, sequenceMdl, posRemoveMeTemp, quatRemoveMeTemp, BONE_USED_BY_ANYTHING);
					CalcPose(dynamicProp, sequenceMdl, undefined, posRemoveMeTemp, quatRemoveMeTemp, sequences[s].s.id, dynamicProp.frame / t, poseParameters, BONE_USED_BY_ANYTHING, 1.0, dynamicProp.frame / t);

					if (sequenceMdl != model.mdl && sequenceMdl.boneNames) {
						posRemoveMe = [];
						quatRemoveMe = [];
						const modelBoneArray = model.mdl.getBones();
						for (let boneIndex = 0, l = modelBoneArray.length; boneIndex < l; ++boneIndex) {
							const boneName = modelBoneArray[boneIndex].lowcasename;
							const seqBoneId = sequenceMdl.boneNames[boneName];

							posRemoveMe[boneIndex] = posRemoveMeTemp[seqBoneId];
							quatRemoveMe[boneIndex] = quatRemoveMeTemp[seqBoneId];
						}
					} else {
						posRemoveMe = posRemoveMeTemp;
						quatRemoveMe = quatRemoveMeTemp;
					}
				}
			}
		}
		posRemoveMe = posRemoveMe || [];
		quatRemoveMe = quatRemoveMe || [];

		//const currentFrame = mainAnimFrame%model.maxAnimLength;//TODOV2
		const blendLayers = [];

		//const currentFrame = null;
		const seqList = Object.keys(sequences);
		const bonesRemoveMe = Object.create(null);
		for (let i = 0; i < seqList.length * 0; ++i) {
			const sequenceName = seqList[i];
			const seqContext = sequences[sequenceName];
			if (seqContext) {
				const sequence = seqContext.s;
				if (sequence) {
					const sequenceBones = sequence.mdl.getBones();
					if (sequenceBones) {
						const g1 = Math.floor(sequence.groupsize1 / 2);
						const g2 = Math.floor(sequence.groupsize2 / 2);
						//g1 = g1RemoveMe;
						//g2 = g2RemoveMe;
						//g1 = 2;

						const animIndex = sequence.getBlend(g1, g2);//TODOV2
						const anim = sequence.mdl.getAnimDescription(animIndex);
						if (anim) {
							blendLayers.push(anim);//TODOv2: remove me
							/*
							if (frameTODOV2 && frameTODOV2.bones) {
								const boneList = Object.keys(frameTODOV2.bones);

								while (boneName = boneList.shift()) {
									const bone = frameTODOV2.bones[boneName];
									if (bone) {
										boneId = bone.boneId;
										weight = sequence.weightlist[boneId] > 0 ? 1 : 0;

										bonesRemoveMe[boneName] = bonesRemoveMe[boneName] || Object.create(null);
										bonesRemoveMe[boneName].count = (bonesRemoveMe[boneName].count + weight) || weight;
										bonesRemoveMe[boneName].pos = bonesRemoveMe[boneName].pos || vec3.create();
										bonesRemoveMe[boneName].rot = bonesRemoveMe[boneName].rot || vec3.create();
										bonesRemoveMe[boneName].quat = bonesRemoveMe[boneName].quat || quat.create();//TODOv2

										//tempQuatRemoveMe = quat.fromMat3(quat.create(), mat3.fromEuler(SourceEngineTempMat3, bone.rot));
										quatFromEulerRad(tempQuatRemoveMe, bone.rot[0], bone.rot[1], bone.rot[2]);

										vec3.scaleAndAdd(bonesRemoveMe[boneName].pos, bonesRemoveMe[boneName].pos, bone.pos, weight);
										vec3.scaleAndAdd(bonesRemoveMe[boneName].rot, bonesRemoveMe[boneName].rot, bone.rot, weight);
										//vec4.scaleAndAdd(bonesRemoveMe[boneName].quat, bonesRemoveMe[boneName].quat, tempQuatRemoveMe, weight);
										if (weight > 0) {
											quat.mul(bonesRemoveMe[boneName].quat, bonesRemoveMe[boneName].quat, tempQuatRemoveMe);
										}
									}
								}
							}
							*/
						}
					}
				}
			}
		}
		Object.keys(bonesRemoveMe).forEach(function(boneName) {
			vec3.scale(bonesRemoveMe[boneName].pos, bonesRemoveMe[boneName].pos, 1 / bonesRemoveMe[boneName].count);
			vec3.scale(bonesRemoveMe[boneName].rot, bonesRemoveMe[boneName].rot, 1 / bonesRemoveMe[boneName].count);
			//vec3.scale(bonesRemoveMe[boneName].quat, bonesRemoveMe[boneName].quat, 1 / bonesRemoveMe[boneName].count);
			quat.normalize(bonesRemoveMe[boneName].quat, bonesRemoveMe[boneName].quat);
		});

		let datas;
		for(let i = 0; i < modelBonesLength; ++i) {

			//let pbone = modelBones[i];
			//quatRemoveMeTemp[i] = quat.copy(quat.create(), pbone.quaternion);//removeme
			//posRemoveMeTemp[i] = vec3.copy(vec3.create(), pbone.position);

			let boneIndex = i;
			const bone = modelBones[i];

			vec3.zero(this.boneRot);
			vec3.zero(this.position);
			quat.identity(this.quaternion);

			const found = false;

			for (let addIndex=0; addIndex<blendLayers.length * 0; addIndex++) {
				const layer = blendLayers[addIndex];
				const trueFrame = (layer.frame===undefined?/*frame*/model.currentFrame:layer.frame);

				if (!datas) {
					//this.boneRot = vec3.create();
				} else {
					//if (datas)
					{
						const weight = 1;
						const pos = this.tempPos;//vec3.create();
						const rot = this.tempRot;//vec3.create();
						vec3.zero(pos);
						vec3.zero(rot);
						const animNumber = model.animNumber;
						const animNumberAnim = model.animNumberAnim;


						//pos = bone.position;
						//rot = bone.rot;
						//if (model.animNumberAnimMdl)
						{
							const currentFrame = Math.floor((layer.fps) % layer.numframes);
							const frameTODOV2 = layer.mdl.getAnimFrame(dynamicProp, layer, currentFrame);
							if (frameTODOV2) {
								let frameBone = null;//frameTODOV2[bone.boneId];

								frameBone = frameTODOV2.bones[bone.name];
								if (frameBone) {
									let pos = frameBone.pos;
									let rot = frameBone.rot;
									let found = true;
								} else {
									//console.info(bone.name + ' not found in ' + layer.name);
								}

							}
						}
						//weight = 1;

						this.position[0]+=pos[0];
						this.position[1]+=pos[1];
						this.position[2]+=pos[2];
						this.boneRot[0] =rot[0];
						this.boneRot[1] =rot[1];
						this.boneRot[2] =rot[2];
					}
				}
			}

			const bonesRemoveMeMe = bonesRemoveMe[bone.name];
			if (bonesRemoveMeMe !== undefined) {
				//this.position = bonesRemoveMeMe.pos;
				//this.boneRot = bonesRemoveMeMe.rot;
				//this.quaternion = bonesRemoveMeMe.quat;
			} else {
				vec3.copy(this.position, bone.position);
				//vec3.copy(this.boneRot, bone.rot);
				//quat.fromMat3(this.quaternion, mat3.fromEuler(SourceEngineTempMat3, bone.rot));
				quatFromEulerRad(this.quaternion, bone.rot[0], bone.rot[1], bone.rot[2]);
			}

			//const q = quat.fromMat3(quat.create(), mat3.fromEuler(SourceEngineTempMat3, this.boneRot));

			const posRemoveMeMe = posRemoveMe[bone.boneId];
			if (posRemoveMeMe !== undefined) {
				//this.position = posRemoveMeMe;
				//vec3.copy(bone._position, posRemoveMeMe);
			} else {
				//vec3.copy(bone.position, bone.position);
				//bone.position = bone._initialPosition;
			}

			const quatRemoveMeMe = quatRemoveMe[bone.boneId];
			if (quatRemoveMeMe !== undefined) {
				//this.boneQuat = quatRemoveMeMe;
				//quat.copy(bone._quaternion, quatRemoveMeMe);
			} else {
				//quat.copy(bone.boneQuat, bone.quaternion);
				//bone.quaternion = bone._initialQuaternion;
			}
			//bone.boneQuat = this.boneQuat;
			//bone.position = this.position;

			const parent = bone.parent;
			bone.parentMergedBone = null;//TODO: wtf ?
			const boneNameLowerCase = bone.lowcasename;
			if (false && /*TODOv3*/parentModel !== null) {
				bone.parentMergedBone = parentModel.getBoneByName(boneNameLowerCase);
				if (dynamicProp.parentAttachementName) {
					const atta = parentModel.getAttachement(dynamicProp.parentAttachementName);
					if (atta) {
						bone.parentMergedBone = atta;
						atta.worldQuat = atta.getWorldQuat();
						atta.worldPos = atta.getWorldPos();
					}
				}
			}

			//const parentMergedBone = bone.parentMergedBone;
			if (false && parent === null/*&&(!bone.parentMergedBone)*/) {//TODOv3
				vec3.transformQuat(bone._position, bone._position, dynamicProp.quaternion);
				quat.multiply(bone._quaternion, dynamicProp.quaternion, bone._quaternion);
				vec3.add(bone._position, bone._position, dynamicProp.position);
			}

			const dynamicPropBones = dynamicProp.skeleton._bones;//dynamicProp.bones;
			let dynamicPropBone = dynamicPropBones[boneIndex];
			if (dynamicPropBone === undefined) {
				//dynamicPropBone = {worldPos:vec3.create(), worldQuat:quat.create()};//TODO: optimize
				//dynamicPropBones[boneNameLowerCase] = dynamicPropBone;
				return;
			}
			//vec3.copy(dynamicPropBone.worldPos, bone.worldPos);
			//quat.copy(dynamicPropBone.worldQuat, bone.worldQuat);
			//dynamicProp.bones[boneNameLowerCase] = dynamicPropBones;

			if (bonesScale !== undefined) {
				const boneScale = bonesScale[bone.name];
				if (boneScale) {
					mat4.scale(bone.boneMat, bone.boneMat, [boneScale, boneScale, boneScale]);
				}
			}

			let b = dynamicPropBones[boneIndex];
			if (b) {
				if (!b.locked) {
					b.quaternion = quatRemoveMeMe ?? b._initialQuaternion;
					b.position = posRemoveMeMe ?? b._initialPosition;
				}
			} else {
				b = new MdlBone(dynamicProp.skeleton);
				dynamicProp.skeleton._bones[boneIndex] = b;
				b.boneId = bone.boneId;
				b.name = bone.name;
				b.quaternion = bone.quaternion;
				b.position = bone.position;
				b.parentBone = bone.parentBone;
				b.parent = dynamicProp.skeleton._bones[b.parentBone];
				b.poseToBone = bone.poseToBone;
				b.initPoseToBone = bone.initPoseToBone;
			}
		}
		return;
	}
}
