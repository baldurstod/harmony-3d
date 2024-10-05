import { vec3 } from 'gl-matrix';
import { BinaryReader } from 'harmony-binary-reader';

import { FlexController } from '../models/flexcontroller';
import { getLoader } from '../../../loaders/loaderfactory';
import { RemapValClamped } from '../../../math/functions';
import { MdlStudioSeqDesc } from './mdlstudioseqdesc';
import { SourceEngineMDLLoader } from './sourceenginemdlloader';

/**
 * MDL Model
 */
//TODOv3 remove parse* function
const STUDIO_FLEX_OP_CONST = 1;
const STUDIO_FLEX_OP_FETCH1 = 2;
const STUDIO_FLEX_OP_FETCH2 = 3;
const STUDIO_FLEX_OP_ADD = 4;
const STUDIO_FLEX_OP_SUB = 5;
const STUDIO_FLEX_OP_MUL = 6;
const STUDIO_FLEX_OP_DIV = 7;
const STUDIO_FLEX_OP_NEG = 8;
const STUDIO_FLEX_OP_EXP = 9;
const STUDIO_FLEX_OP_OPEN = 10;
const STUDIO_FLEX_OP_CLOSE = 11;
const STUDIO_FLEX_OP_COMMA = 12;
const STUDIO_FLEX_OP_MAX = 13;
const STUDIO_FLEX_OP_MIN = 14;
const STUDIO_FLEX_OP_2WAY_0 = 15;
const STUDIO_FLEX_OP_2WAY_1 = 16;
const STUDIO_FLEX_OP_NWAY = 17;
const STUDIO_FLEX_OP_COMBO = 18;
const STUDIO_FLEX_OP_DOMINATE = 19;
const STUDIO_FLEX_OP_DME_LOWER_EYELID = 20;
const STUDIO_FLEX_OP_DME_UPPER_EYELID = 21;

export const MAX_STUDIO_FLEX_DESC = 1024;
export const MAX_STUDIO_FLEX_CTRL = 96;

export class SourceMDL {
	repository: string;
	readonly externalMdlsV2 = [];
	readonly attachementNames = {};
	readonly flexController = new FlexController();
	readonly skinReferences: Array<Array<any>>;
	readonly textures: Array<MdlTexture>;
	readonly modelGroups: Array<MdlStudioModelGroup>;
	header;
	readonly bodyParts: Array<MdlBodyPart>;
	readonly sequences: Array<MdlStudioSeqDesc> = [];
	readonly texturesDir: string[] = [];
	readonly flexRules = [];
	readonly flexControllers = [];
	boneCount: number;
	readonly bones = [];
	readonly boneNames: string[] = [];
	numflexdesc = 0;
	readonly attachements = [];
	readonly animDesc = [];
	loader: SourceEngineMDLLoader;
	reader: BinaryReader;
	readonly poseParameters = [];
	constructor(repository: string) {
		this.repository = repository;
	}

	getMaterialName(skinId, materialId, materialOverride = []) {
		if (skinId >= this.skinReferences.length) {
			skinId = 0; // default to 0
		}

		const skinRef = this.skinReferences[skinId];
		if (!skinRef) {
			return '';
		}

		if (materialId >= skinRef.length) {
			materialId = skinRef.length - 1;
		}

		let textureId = skinRef[materialId];
		if (textureId >= this.textures.length) {
			textureId = 0;
		}
		return materialOverride[textureId] ? materialOverride[textureId].name : this.textures[textureId].name;
	}
	getSkinList() {
		const skinReferences = this.skinReferences;
		const skinList = [];
		for (let skinIndex = 0; skinIndex < skinReferences.length; ++skinIndex) {
			skinList.push(skinIndex);
		}
		return skinList;
	}

	getBodyPart(bodyPartId) {
		return this.bodyParts[bodyPartId];
	}

	getBodyParts() {
		return this.bodyParts;
	}

	async getSequence(sequenceName) {
		const list = this.sequences;
		for (let seqIndex = 0; seqIndex < list.length; ++seqIndex) {
			const seq = list[seqIndex];
			if ((seq.name == sequenceName) && seq.flags != 0x800) {//TODOV2: const
				return seq;
			}
		}

		// Seek in external Mdl's
		const extCount = this.getExternalMdlCount();
		for (let extIndex = 0; extIndex < extCount; ++extIndex) {
			const mdl = await this.getExternalMdl(extIndex);
			if (mdl) {
				const seq = await mdl.getSequence(sequenceName);
				if (seq) {
					return seq;
				}
			}
		}

		return null;
	}

	getModelGroup(modelGroupId) {
		return this.modelGroups[modelGroupId];
	}

	getModelGroups() {
		return this.modelGroups;
	}

	getExternalMdlCount() {
		return this.modelGroups.length;
	}

	async getExternalMdl(externalId) {
		if (this.externalMdlsV2[externalId] !== undefined) {
			return this.externalMdlsV2[externalId];
		}

		const modelGroup = this.modelGroups[externalId];
		if (modelGroup) {
			let p = new Promise(async resolve => {
				let mdlLoader = getLoader('SourceEngineMDLLoader');
				let mdl = await (new mdlLoader().load2(this.repository, modelGroup.name));
				if (mdl) {
					this.externalMdlsV2[externalId] = mdl;
					resolve(mdl);
				} else {
					resolve(null);
				}


			});
			this.externalMdlsV2[externalId] = p;
			return p;
		}
		return null;
	}

	getTextureDir() {
		return this.texturesDir;
	}

	getDimensions(out = vec3.create()) {
		if (this.header) {
			vec3.sub(out, this.header.hull_max, this.header.hull_min);
		}
		return out;
	}

	getBBoxMin(out = vec3.create()) {
		if (this.header) {
			vec3.copy(out, this.header.hull_min);
		}
		return out;
	}

	getBBoxMax(out = vec3.create()) {
		if (this.header) {
			vec3.copy(out, this.header.hull_max);
		}
		return out;
	}

	async getAnimList() {
		let animList = [];
		animList = animList.concat(this.getSequences());

		const extCount = this.getExternalMdlCount();
		for (let extIndex = 0; extIndex < extCount; ++extIndex) {
			const mdl = await this.getExternalMdl(extIndex);
			if (mdl) {
				animList = animList.concat(mdl.getSequences());
			}
		}
		return animList;
	}

	getFlexRules() {
		return this.flexRules;
	}

	getFlexControllers() {
		return this.flexControllers;
	}

	runFlexesRules(flexesWeight, g_flexdescweight) {
		//this.g_flexdescweight = this.g_flexdescweight || new Float32Array(MAX_STUDIO_FLEX_DESC);
		const src = new Float32Array(MAX_STUDIO_FLEX_CTRL * 4);//TODO: optimize

		const flexControllers = this.getFlexControllers();
		if (flexControllers) {
			for (let controllerIndex = 0, l = flexControllers.length; controllerIndex < l; ++controllerIndex) {
				const flexController = flexControllers[controllerIndex];

				//console.error(controllerIndex, flexController.name);

				const j = flexController.localToGlobal;

				// remap m_flexweights to full dynamic range, global flexcontroller indexes
				if (j >= 0 && j < MAX_STUDIO_FLEX_CTRL * 4) {
					const flexWeight = flexesWeight[flexController.name] ?? this.flexController.getControllerValue(flexController.name);
					src[j] = flexWeight/*m_flexweight[controllerIndex]*/ * (flexController.max - flexController.min) + flexController.min;
				}
			}
			this.#runFlexesRules(src, g_flexdescweight);
		}
		//return g_flexdescweight;
	}

	#runFlexesRules(src, dest) {
		for (let i = 0; i < this.numflexdesc; ++i) {
			dest[i] = 0;
		}

		const flexRules = this.getFlexRules();
		if (flexRules) {
			for (let i = 0, l = flexRules.length; i < l; ++i) {
				const stack = new Float32Array(32);
				let k = 0;
				const rule = flexRules[i];

				const numops = rule.ops.length;
				for (let j = 0; j < numops; j++) {
					const op = rule.ops[j];

					let pCloseLidV;
					let flCloseLidV;
					let pCloseLid;
					let flCloseLid;
					let nEyeUpDownIndex;
					let flEyeUpDown;
					switch (op.op) {
						case STUDIO_FLEX_OP_ADD: stack[k - 2] = stack[k - 2] + stack[k - 1]; k--; break;
						case STUDIO_FLEX_OP_SUB: stack[k - 2] = stack[k - 2] - stack[k - 1]; k--; break;
						case STUDIO_FLEX_OP_MUL: stack[k - 2] = stack[k - 2] * stack[k - 1]; k--; break;
						case STUDIO_FLEX_OP_DIV:
							if (stack[k - 1] > 0.0001) {
								stack[k - 2] = stack[k - 2] / stack[k - 1];
							} else {
								stack[k - 2] = 0;
							}
							k--;
							break;
						case STUDIO_FLEX_OP_NEG: stack[k - 1] = -stack[k - 1]; break;
						case STUDIO_FLEX_OP_MAX: stack[k - 2] = Math.max(stack[k - 2], stack[k - 1]); k--; break;
						case STUDIO_FLEX_OP_MIN: stack[k - 2] = Math.min(stack[k - 2], stack[k - 1]); k--; break;
						case STUDIO_FLEX_OP_CONST: stack[k] = op.value; k++; break;
						case STUDIO_FLEX_OP_FETCH1:
							const m = this.flexControllers[op.index].localToGlobal;
							stack[k] = src[m];
							++k;
							break;
						case STUDIO_FLEX_OP_DME_LOWER_EYELID:
							pCloseLidV = this.flexControllers[op.index];
							flCloseLidV = RemapValClamped(src[pCloseLidV.localToGlobal], pCloseLidV.min, pCloseLidV.max, 0.0, 1.0);

							pCloseLid = this.flexControllers[stack[k - 1]];
							flCloseLid = RemapValClamped(src[pCloseLid.localToGlobal], pCloseLid.min, pCloseLid.max, 0.0, 1.0);

							nEyeUpDownIndex = stack[k - 3];
							flEyeUpDown = 0.0;
							if (nEyeUpDownIndex >= 0) {
								const pEyeUpDown = this.flexControllers[stack[k - 3]];
								flEyeUpDown = RemapValClamped(src[pEyeUpDown.localToGlobal], pEyeUpDown.min, pEyeUpDown.max, -1.0, 1.0);
							}

							if (flEyeUpDown > 0.0) {
								stack[k - 3] = (1.0 - flEyeUpDown) * (1.0 - flCloseLidV) * flCloseLid;
							} else {
								stack[k - 3] = (1.0 - flCloseLidV) * flCloseLid;
							}
							//console.error(stack [k - 3]);
							k -= 2;
							break;
						case STUDIO_FLEX_OP_DME_UPPER_EYELID:
							pCloseLidV = this.flexControllers[op.index];
							flCloseLidV = RemapValClamped(src[pCloseLidV.localToGlobal], pCloseLidV.min, pCloseLidV.max, 0.0, 1.0);

							pCloseLid = this.flexControllers[stack[k - 1]];
							flCloseLid = RemapValClamped(src[pCloseLid.localToGlobal], pCloseLid.min, pCloseLid.max, 0.0, 1.0);

							nEyeUpDownIndex = stack[k - 3];
							flEyeUpDown = 0.0;
							if (nEyeUpDownIndex >= 0) {
								const pEyeUpDown = this.flexControllers[stack[k - 3]];
								flEyeUpDown = RemapValClamped(src[pEyeUpDown.localToGlobal], pEyeUpDown.min, pEyeUpDown.max, -1.0, 1.0);
							}

							if (flEyeUpDown < 0.0) {
								stack[k - 3] = (1.0 + flEyeUpDown) * flCloseLidV * flCloseLid;
							} else {
								stack[k - 3] = flCloseLidV * flCloseLid;
							}
							//stack [k - 3] = Math.random();
							k -= 2;
							break;


						/*
									case STUDIO_FETCH2:
										{
											stack[k] = dest[pops->d.index]; k++; break;
										}
									case STUDIO_COMBO:
										{
											int m = pops->d.index;
											int km = k - m;
											for ( int i = km + 1; i < k; ++i )
											{
												stack[ km ] *= stack[ i ];
											}
											k = k - m + 1;
										}
										break;
									case STUDIO_DOMINATE:
										{
											int m = pops->d.index;
											int km = k - m;
											float dv = stack[ km ];
											for ( int i = km + 1; i < k; ++i )
											{
												dv *= stack[ i ];
											}
											stack[ km - 1 ] *= 1.0f - dv;
											k -= m;
										}
										break;
									case STUDIO_2WAY_0:
										{
											int m = pFlexcontroller( (LocalFlexController_t)pops->d.index )->localToGlobal;
											stack[ k ] = RemapValClamped( src[m], -1.0f, 0.0f, 1.0f, 0.0f );
											k++;
										}
										break;
									case STUDIO_2WAY_1:
										{
											int m = pFlexcontroller( (LocalFlexController_t)pops->d.index )->localToGlobal;
											stack[ k ] = RemapValClamped( src[m], 0.0f, 1.0f, 0.0f, 1.0f );
											k++;
										}
										break;
									case STUDIO_NWAY:
										{
											LocalFlexController_t valueControllerIndex = static_cast< LocalFlexController_t >( (int)stack[ k - 1 ] );
											int m = pFlexcontroller( valueControllerIndex )->localToGlobal;
											float flValue = src[ m ];
											int v = pFlexcontroller( (LocalFlexController_t)pops->d.index )->localToGlobal;

											const Vector4D filterRamp( stack[ k - 5 ], stack[ k - 4 ], stack[ k - 3 ], stack[ k - 2 ] );

											// Apply multicontrol remapping
											if ( flValue <= filterRamp.x || flValue >= filterRamp.w )
											{
												flValue = 0.0f;
											}
											else if ( flValue < filterRamp.y )
											{
												flValue = RemapValClamped( flValue, filterRamp.x, filterRamp.y, 0.0f, 1.0f );
											}
											else if ( flValue > filterRamp.z )
											{
												flValue = RemapValClamped( flValue, filterRamp.z, filterRamp.w, 1.0f, 0.0f );
											}
											else
											{
												flValue = 1.0f;
											}

											stack[ k - 5 ] = flValue * src[ v ];

											k -= 4;
										}
										break;
									case STUDIO_DME_LOWER_EYELID:
										{
											const mstudioflexcontroller_t *const pCloseLidV = pFlexcontroller( (LocalFlexController_t)pops->d.index );
											const float flCloseLidV = RemapValClamped( src[ pCloseLidV->localToGlobal ], pCloseLidV->min, pCloseLidV->max, 0.0f, 1.0f );

											const mstudioflexcontroller_t *const pCloseLid = pFlexcontroller( static_cast< LocalFlexController_t >( (int)stack[ k - 1 ] ) );
											const float flCloseLid = RemapValClamped( src[ pCloseLid->localToGlobal ], pCloseLid->min, pCloseLid->max, 0.0f, 1.0f );

											int nBlinkIndex = static_cast< int >( stack[ k - 2 ] );
											float flBlink = 0.0f;
											if ( nBlinkIndex >= 0 )
											{
												const mstudioflexcontroller_t *const pBlink = pFlexcontroller( static_cast< LocalFlexController_t >( (int)stack[ k - 2 ] ) );
												flBlink = RemapValClamped( src[ pBlink->localToGlobal ], pBlink->min, pBlink->max, 0.0f, 1.0f );
											}

											int nEyeUpDownIndex = static_cast< int >( stack[ k - 3 ] );
											float flEyeUpDown = 0.0f;
											if ( nEyeUpDownIndex >= 0 )
											{
												const mstudioflexcontroller_t *const pEyeUpDown = pFlexcontroller( static_cast< LocalFlexController_t >( (int)stack[ k - 3 ] ) );
												flEyeUpDown = RemapValClamped( src[ pEyeUpDown->localToGlobal ], pEyeUpDown->min, pEyeUpDown->max, -1.0f, 1.0f );
											}

											if ( flEyeUpDown > 0.0 )
											{
												stack [ k - 3 ] = ( 1.0f - flEyeUpDown ) * ( 1.0f - flCloseLidV ) * flCloseLid;
											}
											else
											{
												stack [ k - 3 ] = ( 1.0f - flCloseLidV ) * flCloseLid;
											}
											k -= 2;
										}
										break;
									case STUDIO_DME_UPPER_EYELID:
										{
											const mstudioflexcontroller_t *const pCloseLidV = pFlexcontroller( (LocalFlexController_t)pops->d.index );
											const float flCloseLidV = RemapValClamped( src[ pCloseLidV->localToGlobal ], pCloseLidV->min, pCloseLidV->max, 0.0f, 1.0f );

											const mstudioflexcontroller_t *const pCloseLid = pFlexcontroller( static_cast< LocalFlexController_t >( (int)stack[ k - 1 ] ) );
											const float flCloseLid = RemapValClamped( src[ pCloseLid->localToGlobal ], pCloseLid->min, pCloseLid->max, 0.0f, 1.0f );

											int nBlinkIndex = static_cast< int >( stack[ k - 2 ] );
											float flBlink = 0.0f;
											if ( nBlinkIndex >= 0 )
											{
												const mstudioflexcontroller_t *const pBlink = pFlexcontroller( static_cast< LocalFlexController_t >( (int)stack[ k - 2 ] ) );
												flBlink = RemapValClamped( src[ pBlink->localToGlobal ], pBlink->min, pBlink->max, 0.0f, 1.0f );
											}

											int nEyeUpDownIndex = static_cast< int >( stack[ k - 3 ] );
											float flEyeUpDown = 0.0f;
											if ( nEyeUpDownIndex >= 0 )
											{
												const mstudioflexcontroller_t *const pEyeUpDown = pFlexcontroller( static_cast< LocalFlexController_t >( (int)stack[ k - 3 ] ) );
												flEyeUpDown = RemapValClamped( src[ pEyeUpDown->localToGlobal ], pEyeUpDown->min, pEyeUpDown->max, -1.0f, 1.0f );
											}

											if ( flEyeUpDown < 0.0f )
											{
												stack [ k - 3 ] = ( 1.0f + flEyeUpDown ) * flCloseLidV * flCloseLid;
											}
											else
											{
												stack [ k - 3 ] = flCloseLidV * flCloseLid;
											}
											k -= 2;
										}
										break;*/
						default:
						//console.error('Unknown op ' + op.op)//TODOV2
					}

					//pops++;
				}
				dest[rule.flex] = stack[0];
			}
		}
		//console.log(stack);
	}

	addExternalMdl(mdlName) {
		//TODOV2: check name exists
		const modelgroup = new MdlStudioModelGroup();
		modelgroup.label = '';
		modelgroup.name = mdlName;

		this.modelGroups.push(modelgroup);
	}

	getBoneCount() {
		return this.boneCount;
	}

	getBones() {
		return this.bones;
	}

	getBone(boneIndex: number) {
		const bones = this.getBones();
		if (bones) {
			return bones[boneIndex];
		}
		return null;
	}

	getBoneByName(boneName: string) {
		const bones = this.getBones();
		if (this.boneNames) {
			const boneIndex = this.boneNames[boneName];
			if (bones) {
				return bones[boneIndex];
			}
		}
		return null;
	}

	getBoneId(boneName: string) {
		const bones = this.getBones();
		if (bones && this.boneNames) {
			const boneIndex = this.boneNames[boneName];
			return boneIndex;
		}
		return -1;
	}

	getAttachments() {
		return this.attachements;
	}

	getAttachementsNames(out) {
		const list = this.getAttachments();
		if (list) {
			out = out || [];
			for (let i = 0, l = list.length; i < l; ++i) {
				out.push(list[i].name);
			}
		}
		return out;
	}

	getAttachementById(attachementId) {
		const list = this.getAttachments();
		if (list) {
			return list[attachementId];
		}
		return null;
	}

	getAttachement(attachementName) {
		attachementName = attachementName.toLowerCase();

		if (this.attachementNames) {
			return this.attachementNames[attachementName];
		}
		return null;
	}

	getSequenceById(sequenceId) {
		return this.sequences[sequenceId];
	}

	getSequencesList() {
		let sequencesList = [];
		sequencesList = sequencesList.concat(this.getSequences());

		const list = this.externalMdlsV2;
		for (let i = 0; i < list.length; ++i) {
			let mdl = list[i];
			sequencesList = sequencesList.concat(mdl.getSequences());
		}
		return sequencesList;
	}

	getSequencesList2() {
		let sequencesList = [];
		sequencesList = sequencesList.concat(this.getSequences2());

		const list = this.externalMdlsV2;
		for (let i = 0; i < list.length; ++i) {
			let mdl = list[i];
			sequencesList = sequencesList.concat(mdl.getSequences2());
		}
		return sequencesList;
	}

	getSequences() {
		const list = this.sequences;
		let animList = [];
		for (let seqIndex = 0; seqIndex < list.length; ++seqIndex) {
			let seq = list[seqIndex];
			animList.push(seq.name);
		}
		return animList;
	}

	getSequences2() {
		const list = this.sequences;
		const animList = [];
		for (let seqIndex = 0; seqIndex < list.length; ++seqIndex) {
			let seq = list[seqIndex];
			//if ((seq.activity != -1) && (seq.activityName != '')) {
			//if (seq.activityName != '') {
			//if (seq.name == 'run_melee') {
			if ((seq.activity == 0)) {
				animList.push(seq.name);
			}
		}
		return animList;
	}

	getAnimDescription(animIndex) {
		return this.animDesc[animIndex];
	}

	getAnimFrame(dynamicProp, animDesc, frameIndex) {
		//console.info(frameIndex);
		//const animDesc = this.getAnimDescription(animIndex);
		if (animDesc && this.getBones()) {
			const section = this.loader._parseAnimSection(this.reader, animDesc, frameIndex);//TODOv3
			//const section = animDesc.animSections[0];

			animDesc.frames = [];
			let frame = dynamicProp.frameframe;// = dynamicProp.frameframe || Object.create(null);
			if (frame === undefined) {
				frame = Object.create(null);
				frame.bones = Object.create(null);
				dynamicProp.frameframe = frame;
			}
			//frame.bones = Object.create(null);

			//for (let frameIndex=0; frameIndex < animDesc.numframes; ++frameIndex)
			{
				//frame = Object.create(null);
				//frame.bones = frame.bones || Object.create(null);
				//const sectionIndex = 0;
				let frameIndex2 = frameIndex;
				if (animDesc.sectionframes != 0) {
					//sectionIndex = Math.floor(frameIndex / animDesc.sectionframes);
					frameIndex2 = frameIndex % animDesc.sectionframes;
				}

				//frameIndex % animDesc.sectionframes;
				const blockList = section;//animDesc.animSections[sectionIndex];
				if (blockList) {
					for (let blockIndex = 0; blockIndex < blockList.length; ++blockIndex) {
						const block = blockList[blockIndex];
						const bone = this.bones[block.bone];

						if (bone != undefined) {
							//const fb1 = (this.frame && this.frame.bones) ? this.frame.bones[bone.name] || Object.create(null) : Object.create(null);
							//const fb = Object.create(null);
							let fb = frame.bones[bone.name];
							if (fb === undefined) {
								fb = Object.create(null);
								frame.bones[bone.name] = fb;
								fb.rot = vec3.create();
								fb.pos = vec3.create();
								fb.boneId = bone.boneId;//TODOv2
							}
							//frame.bones[bone.name] = fb;
							//frame.bones[bone.boneId] = fb;
							block.getRot(fb.rot, this, bone, frameIndex2);
							block.getPos(fb.pos, this, bone, frameIndex2);
							fb.valid = true;
							//console.log(bone.name, fb.pos, fb.rot);
						}
					}
					//animDesc.frames.push(frame);
					//this.frame = frame;
					return frame;
				}
			}
		}
		return null;
	}

	getLocalPoseParameter(poseIndex) {
		return this.poseParameters[poseIndex];
	}

	getPoseParameters() {
		return this.poseParameters;
	}

	getAllPoseParameters() {
		const poseList = Object.create(null);
		//poseList = poseList.concat(this.getPoseParameters());

		const list = this.externalMdlsV2.concat(this);
		for (let i = 0; i < list.length; ++i) {
			let mdl = list[i];
			let pp = mdl.getPoseParameters();
			if (!pp) {
				return null;
			}
			for (let j = 0; j < pp.length; j++) {
				poseList[pp[j].name] = 1;
			}
		}
		return poseList;
	}

	boneFlags(boneIndex: number) {//TODOV2: rename
		const bone = this.getBone(boneIndex);
		if (bone) {
			return bone.flags;
		}
		return 0;
	}
}

export class MdlStudioModelGroup {//removeme
	name;
	label;
}

export class MdlTexture {//removeme
	name;
	originalName;
}
export class MdlBodyPart {//removeme
	name;
	base;
	models;
}
