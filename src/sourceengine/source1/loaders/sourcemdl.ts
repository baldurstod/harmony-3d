import { vec3 } from 'gl-matrix';
import { BinaryReader } from 'harmony-binary-reader';
import { float, int, int16, int32, int8 } from 'harmony-types';
import { getLoader } from '../../../loaders/loaderfactory';
import { RemapValClamped } from '../../../math/functions';
import { Source1ModelInstance } from '../export';
import { FlexController } from '../models/flexcontroller';
import { MdlBone } from './mdlbone';
import { MdlStudioAnim } from './mdlstudioanim';
import { MdlStudioSeqDesc } from './mdlstudioseqdesc';
import { MdlSrcBoneTransform, MdlStudioFlexController, MdlStudioHitboxSet, ModelTest, Source1MdlLoader } from './source1mdlloader';

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

//export type FlexWeight = Record<string, number>;

type Tuple<
	T,
	N extends number,
	R extends readonly T[] = [],
> = R['length'] extends N ? R : Tuple<T, N, [T, ...R]>;

export class MdlAttachment {
	name = '';
	lowcasename = '';
	mdl: SourceMdl | null = null;
	flags = 0;
	localbone = 0;
	local: Tuple<number, 12> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

export class MdlStudioAnimDesc {//removeme
	name = '';
	//animSections = [];
	mdl: SourceMdl | null = null;
	startOffset = 0;
	fps = 0;
	flags = 0;
	numframes = 0;
	nummovements = 0;
	animblock = 0;
	animIndex = 0;
	numikrules = 0;
	animblockikruleOffset = 0;
	sectionOffset = 0;
	sectionframes = 0;
	zeroframespan = 0;
	zeroframecount = 0;
	zeroframeOffset = 0;
	readonly frames: never[] = [];
	readonly localHierarchy: StudioLocalHierarchy[] = [];

	pAnim(frameIndex: number/*, flStall TODOv2*/): MdlStudioAnim[] | null {
		if (this.mdl) {
			return this.mdl.loader._parseAnimSection(this.mdl.reader, this, frameIndex);
		}
		return null;
	}

	pHierarchy(i: int32): StudioLocalHierarchy | null {
		return this.localHierarchy[i] ?? null;
	}

	pZeroFrameData(): null {//TODOv2:rename
		return null;
		/*
		short				zeroframespan;	// frames per span
			short				zeroframecount; // number of spans
			int					zeroframeindex;
			byte				*pZeroFrameData() const { if (zeroframeindex) return (((byte *)this) + zeroframeindex); else return NULL; };
			*/
	}
}

export class MdlStudioFlexRule { // mstudioflexrule_t//TODO: turn to type
	readonly ops: MdlStudioFlexOp[] = [];
	flex!: number;
}

export class MdlStudioFlexOp { // mstudioflexop_t
	op = 0;//TODO: create op enum
	index = 0;
	value = 0;
}

export class MdlStudioPoseParam { // mstudioposeparamdesc_t
	name = '';
	flags = 0;
	start = 0;
	end = 0;
	loop = 0;
	midpoint = 0;
}


export type SourceMdlHeader = {
	modelFormatID: number;
	formatVersionID: number;
	checkSum: number;
	modelName: string;
	dataLength: number;
	eyeposition: vec3;
	illumposition: vec3;
	hull_min: vec3;
	hull_max: vec3;
	view_bbmin: vec3;
	view_bbmax: vec3;
	flags: number;
	activitylistversion: number;
	eventsindexed: number;
	numFlexDesc: number;
	mass: number;
	contents: number;
	virtualModel: number;
	animBlocksCount: number;
	animBlocksIndex: number;
	animBlockModel: number;
	directionaldotproduct: number;
	rootLod: number;
	numAllowedRootLods: number;
}

export class SourceMdl {
	repository: string;
	readonly externalMdlsV2: Promise<SourceMdl | null>[] = [];
	readonly attachmentNames = new Map<string, MdlAttachment>();
	readonly flexController = new FlexController();
	readonly skinReferences: any[][] = [];
	readonly textures: MdlTexture[] = [];
	readonly modelGroups: MdlStudioModelGroup[] = [];
	header!: SourceMdlHeader;
	readonly bodyParts: MdlBodyPart[] = [];
	readonly sequences: MdlStudioSeqDesc[] = [];
	readonly texturesDir: string[] = [];
	readonly flexRules: MdlStudioFlexRule[] = [];
	readonly flexControllers: MdlStudioFlexController[] = [];
	boneCount: number = 0;
	readonly bones: MdlBone[] = [];
	readonly boneNames = new Map<string, number>();
	numflexdesc = 0;
	readonly attachments: MdlAttachment[] = [];
	readonly animDesc: MdlStudioAnimDesc[] = [];
	loader!: Source1MdlLoader;
	reader!: BinaryReader;
	readonly poseParameters: MdlStudioPoseParam[] = [];
	readonly hitboxSets: MdlStudioHitboxSet[] = [];
	// Src bone transforms are transformations that will convert .dmx or .smd-based animations into .mdl-based animations
	// NOTE: The operation you should apply is: pretransform * bone transform * posttransform
	readonly srcBoneTransforms: MdlSrcBoneTransform[] = [];
	boneOffset = 0;
	boneControllerCount = 0;
	boneControllerOffset = 0;
	hitboxCount = 0;
	hitboxOffset = 0;
	localAnimCount = 0;
	localAnimOffset = 0;
	localSeqCount = 0;
	localSeqOffset = 0;
	numFlexRules = 0;
	flexRulesIndex = 0;
	textureCount = 0;
	textureOffset = 0;
	textureDirCount = 0;
	textureDirOffset = 0;
	skinReferenceCount = 0;
	skinFamilyCount = 0;
	skinReferenceOffset = 0;
	bodyPartCount = 0;
	bodyPartOffset = 0;
	attachmentCount = 0;
	attachmentOffset = 0;
	localNodeCount = 0;
	localNodeIndex = 0;
	localNodeNameIndex = 0;
	flexDescIndex = 0;
	flexControllerCount = 0;
	flexControllerIndex = 0;
	ikChainCount = 0;
	ikChainIndex = 0;
	mouthsCount = 0;
	mouthsIndex = 0;
	localPoseParamCount = 0;
	localPoseParamOffset = 0;
	surfacePropIndex = 0;
	keyValueIndex = 0;
	keyValueCount = 0;
	ikLockCount = 0;
	ikLockIndex = 0;
	includeModelCount = 0;
	includeModelOffset = 0;
	animBlocksNameIndex = 0;
	boneTableByNameIndex = 0;
	vertexBase = 0;
	offsetBase = 0;
	flexControllerUICount = 0;
	flexControllerUIIndex = 0;
	studiohdr2index = 0;
	srcbonetransform_count = 0;
	srcbonetransform_index = 0;
	illumpositionattachmentindex = 0;
	flMaxEyeDeflection = 0;
	linearboneOffset = 0;
	pLinearBones?: never;

	constructor(repository: string) {
		this.repository = repository;
	}

	getMaterialName(skinId: number, materialId: number/*, materialOverride = []*/): string {
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
		return /*materialOverride[textureId] ? materialOverride[textureId].name : */this.textures[textureId]?.name ?? '';
	}

	getSkinList(): number[] {
		const skinReferences = this.skinReferences;
		const skinList = [];
		for (let skinIndex = 0; skinIndex < skinReferences.length; ++skinIndex) {
			skinList.push(skinIndex);
		}
		return skinList;
	}

	getBodyPart(bodyPartId: number): MdlBodyPart | undefined {
		return this.bodyParts[bodyPartId];
	}

	getBodyParts(): MdlBodyPart[] {
		return this.bodyParts;
	}

	async getSequence(sequenceName: string): Promise<MdlStudioSeqDesc | null> {
		const list = this.sequences;
		for (const seq of list) {
			if ((seq.name == sequenceName) && seq.flags != 0x800) {//TODOV2: const
				return seq;
			}
		}

		// Seek in external Mdl's
		const extCount = this.getExternalMdlCount();
		for (let extIndex = 0; extIndex < extCount; ++extIndex) {
			const mdl: SourceMdl | null = await this.getExternalMdl(extIndex);
			if (mdl) {
				const seq = await mdl.getSequence(sequenceName);
				if (seq) {
					return seq;
				}
			}
		}

		return null;
	}

	/*
	getModelGroup(modelGroupId: number): MdlStudioModelGroup {
		return this.modelGroups[modelGroupId];
	}
	*/

	getModelGroups(): MdlStudioModelGroup[] {
		return this.modelGroups;
	}

	getExternalMdlCount(): number {
		return this.modelGroups.length;
	}

	async getExternalMdl(externalId: number): Promise<SourceMdl | null> {
		if (this.externalMdlsV2[externalId] !== undefined) {
			return this.externalMdlsV2[externalId];
		}

		const modelGroup = this.modelGroups[externalId];
		if (modelGroup) {
			const p = new Promise<SourceMdl | null>(async resolve => {
				const mdlLoader = getLoader('Source1MdlLoader') as typeof Source1MdlLoader;
				const mdl = await (new mdlLoader().load(this.repository, modelGroup.name));
				if (mdl) {
					//this.externalMdlsV2[externalId] = mdl;
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

	getTextureDir(): string[] {
		return this.texturesDir;
	}

	getDimensions(out = vec3.create()): vec3 {
		if (this.header) {
			vec3.sub(out, this.header.hull_max, this.header.hull_min);
		}
		return out;
	}

	getBBoxMin(out = vec3.create()): vec3 {
		if (this.header) {
			vec3.copy(out, this.header.hull_min);
		}
		return out;
	}

	getBBoxMax(out = vec3.create()): vec3 {
		if (this.header) {
			vec3.copy(out, this.header.hull_max);
		}
		return out;
	}

	async getAnimList(): Promise<Set<string>> {
		const animList = new Set<string>;
		//animList = animList.concat(this.getSequences());
		for (const seq of this.getSequences()) {
			animList.add(seq);
		}

		const extCount = this.getExternalMdlCount();
		for (let extIndex = 0; extIndex < extCount; ++extIndex) {
			const mdl = await this.getExternalMdl(extIndex);
			if (mdl) {
				for (const seq of mdl.getSequences()) {
					animList.add(seq);
				}
			}
		}
		return animList;
	}

	getFlexRules(): MdlStudioFlexRule[] {
		return this.flexRules;
	}

	getFlexControllers(): MdlStudioFlexController[] {
		return this.flexControllers;
	}

	runFlexesRules(flexesWeight: Map<string, number>, g_flexdescweight: Float32Array): void {
		//this.g_flexdescweight = this.g_flexdescweight || new Float32Array(MAX_STUDIO_FLEX_DESC);
		const src = new Float32Array(MAX_STUDIO_FLEX_CTRL * 4);//TODO: optimize

		const flexControllers = this.getFlexControllers();
		if (flexControllers) {
			for (const flexController of flexControllers) {
				const j = flexController.localToGlobal;

				// remap m_flexweights to full dynamic range, global flexcontroller indexes
				if (j >= 0 && j < MAX_STUDIO_FLEX_CTRL * 4) {
					const flexWeight = flexesWeight.get(flexController.name) ?? this.flexController.getControllerValue(flexController.name);
					src[j] = flexWeight * (flexController.max - flexController.min) + flexController.min;
				}
			}
			this.#runFlexesRules(src, g_flexdescweight);
		}
		//return g_flexdescweight;
	}

	#runFlexesRules(src: Float32Array, dest: Float32Array): void {
		for (let i = 0; i < this.numflexdesc; ++i) {
			dest[i] = 0;
		}

		const flexRules = this.getFlexRules();
		if (flexRules) {
			for (const rule of flexRules) {
				const stack = new Float32Array(32);
				let k = 0;
				//				const rule = flexRules[i];

				const numops = rule.ops.length;
				for (let j = 0; j < numops; j++) {
					const op = rule.ops[j]!;

					let pCloseLidV;
					let flCloseLidV;
					let pCloseLid;
					let flCloseLid;
					let nEyeUpDownIndex: number;
					let flEyeUpDown;
					switch (op.op) {
						case STUDIO_FLEX_OP_ADD: stack[k - 2] = stack[k - 2]! + stack[k - 1]!; k--; break;
						case STUDIO_FLEX_OP_SUB: stack[k - 2] = stack[k - 2]! - stack[k - 1]!; k--; break;
						case STUDIO_FLEX_OP_MUL: stack[k - 2] = stack[k - 2]! * stack[k - 1]!; k--; break;
						case STUDIO_FLEX_OP_DIV:
							if (stack[k - 1]! > 0.0001) {
								stack[k - 2]! = stack[k - 2]! / stack[k - 1]!;
							} else {
								stack[k - 2] = 0;
							}
							k--;
							break;
						case STUDIO_FLEX_OP_NEG: stack[k - 1] = -stack[k - 1]!; break;
						case STUDIO_FLEX_OP_MAX: stack[k - 2] = Math.max(stack[k - 2]!, stack[k - 1]!); k--; break;
						case STUDIO_FLEX_OP_MIN: stack[k - 2] = Math.min(stack[k - 2]!, stack[k - 1]!); k--; break;
						case STUDIO_FLEX_OP_CONST: stack[k] = op.value; k++; break;
						case STUDIO_FLEX_OP_FETCH1:
							const m = this.flexControllers[op.index]!.localToGlobal;
							stack[k] = src[m]!;
							++k;
							break;
						case STUDIO_FLEX_OP_DME_LOWER_EYELID:
							pCloseLidV = this.flexControllers[op.index];
							flCloseLidV = RemapValClamped(src[pCloseLidV!.localToGlobal]!, pCloseLidV!.min, pCloseLidV!.max, 0.0, 1.0);

							pCloseLid = this.flexControllers[stack[k - 1]!];
							flCloseLid = RemapValClamped(src[pCloseLid!.localToGlobal]!, pCloseLid!.min, pCloseLid!.max, 0.0, 1.0);

							nEyeUpDownIndex = stack[k - 3]!;
							flEyeUpDown = 0.0;
							if (nEyeUpDownIndex >= 0) {
								const pEyeUpDown = this.flexControllers[stack[k - 3]!];
								flEyeUpDown = RemapValClamped(src[pEyeUpDown!.localToGlobal]!, pEyeUpDown!.min, pEyeUpDown!.max, -1.0, 1.0);
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
							flCloseLidV = RemapValClamped(src[pCloseLidV!.localToGlobal]!, pCloseLidV!.min, pCloseLidV!.max, 0.0, 1.0);

							pCloseLid = this.flexControllers[stack[k - 1]!];
							flCloseLid = RemapValClamped(src[pCloseLid!.localToGlobal]!, pCloseLid!.min, pCloseLid!.max, 0.0, 1.0);

							nEyeUpDownIndex = stack[k - 3]!;
							flEyeUpDown = 0.0;
							if (nEyeUpDownIndex >= 0) {
								const pEyeUpDown = this.flexControllers[stack[k - 3]!];
								flEyeUpDown = RemapValClamped(src[pEyeUpDown!.localToGlobal]!, pEyeUpDown!.min, pEyeUpDown!.max, -1.0, 1.0);
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
				dest[rule.flex] = stack[0]!;
			}
		}
		//console.log(stack);
	}

	addExternalMdl(mdlName: string): void {
		//TODOV2: check name exists
		const modelgroup = new MdlStudioModelGroup();
		modelgroup.label = '';
		modelgroup.name = mdlName;

		this.modelGroups.push(modelgroup);
	}

	getBoneCount(): number {
		return this.boneCount;
	}

	getBones(): MdlBone[] {
		return this.bones;
	}

	getBone(boneIndex: number): MdlBone | undefined {
		const bones = this.getBones();
		if (bones) {
			return bones[boneIndex];
		}
	}

	getBoneByName(boneName: string): MdlBone | undefined {
		const bones = this.getBones();
		const boneIndex = this.boneNames.get(boneName);
		if (bones && boneIndex !== undefined) {
			return bones[boneIndex];
		}
	}

	getBoneId(boneName: string): number {
		const boneIndex = this.boneNames.get(boneName);
		return boneIndex ?? -1;
	}

	getAttachments(): MdlAttachment[] {
		return this.attachments;
	}

	getAttachmentsNames(out?: string[]): MdlAttachment[] {
		return Array.from(this.getAttachments());
	}

	getAttachmentById(attachmentId: number): MdlAttachment | undefined {
		const list = this.getAttachments();
		if (list) {
			return list[attachmentId];
		}
	}

	getAttachment(attachmentName: string): MdlAttachment | undefined {
		attachmentName = attachmentName.toLowerCase();

		return this.attachmentNames.get(attachmentName);
	}

	getSequenceById(sequenceId: number): MdlStudioSeqDesc | undefined {
		return this.sequences[sequenceId];
	}

	/*
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
	*/

	getSequences(): string[] {
		const list = this.sequences;
		const animList: string[] = [];
		for (const seq of list) {
			animList.push(seq.name);
		}
		return animList;
	}

	getSequences2(): string[] {
		const list = this.sequences;
		const animList = [];
		for (const seq of list) {
			//if ((seq.activity != -1) && (seq.activityName != '')) {
			//if (seq.activityName != '') {
			//if (seq.name == 'run_melee') {
			if ((seq.activity == 0)) {
				animList.push(seq.name);
			}
		}
		return animList;
	}

	getAnimDescription(animIndex: number | null | undefined): MdlStudioAnimDesc | null {
		return this.animDesc[animIndex ?? -1] ?? null;
	}

	getAnimFrame(dynamicProp: Source1ModelInstance, animDesc: MdlStudioAnimDesc, frameIndex: number) {
		//console.info(frameIndex);
		//const animDesc = this.getAnimDescription(animIndex);
		if (animDesc && this.getBones()) {
			const section = this.loader._parseAnimSection(this.reader, animDesc, frameIndex);//TODOv3
			//const section = animDesc.animSections[0];

			//animDesc.frames = [];
			const frame = dynamicProp.frameframe;// = dynamicProp.frameframe || Object.create(null);
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
					for (const block of blockList) {
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

	getLocalPoseParameter(poseIndex: number): MdlStudioPoseParam | undefined {
		return this.poseParameters[poseIndex];
	}

	getPoseParameters(): MdlStudioPoseParam[] {
		return this.poseParameters;
	}

	/*
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
	*/

	boneFlags(boneIndex: number): number {//TODOV2: rename
		const bone = this.getBone(boneIndex);
		if (bone) {
			return bone.flags;
		}
		return 0;
	}
}

export class MdlStudioModelGroup {//{//TODO: turn to type
	name!: string;
	label!: string;
}

export class MdlTexture {//{//TODO: turn to type
	name!: string;
	originalName!: string;
}
export class MdlBodyPart {//TODO: turn to type
	name!: string;
	base!: number;
	models!: ModelTest[];
}

export const STUDIO_LOCAL_HIERARCHY_STRUCT_SIZE = 48;

export type StudioLocalHierarchy = {// mstudiolocalhierarchy_t
	bone: int32;
	newParent: int32;

	start: float;
	peak: float;
	tail: float;
	end: float;

	iStart: int32;// first frame
	//localAnimIndex: int32;
	localAnim: StudioCompressedIkError;

	// + 16 unused bytes

	/*	struct mstudiolocalhierarchy_t
	{
		DECLARE_BYTESWAP_DATADESC();
		int			iBone;			// bone being adjusted
		int			iNewParent;		// the bones new parent

		float		start;			// beginning of influence
		float		peak;			// start of full influence
		float		tail;			// end of full influence
		float		end;			// end of all influence

		int			iStart;			// first frame

		int			localanimindex;
		inline mstudiocompressedikerror_t *pLocalAnim() const { return (mstudiocompressedikerror_t *)(((byte *)this) + localanimindex); };

		int			unused[4];
	};

	*/
}

export class StudioCompressedIkError {// mstudiocompressedikerror_t
	#reader: BinaryReader;
	#offset: number;
	#scale: [float, float, float, float, float, float,];
	#offsets: [int16, int16, int16, int16, int16, int16,];
	#values: [StudioAnimValue | null, StudioAnimValue | null, StudioAnimValue | null, StudioAnimValue | null, StudioAnimValue | null, StudioAnimValue | null,];

	constructor(
		reader: BinaryReader,
		offset: number,
		scale: [float, float, float, float, float, float,],
		offsets: [int16, int16, int16, int16, int16, int16,],
		values: [StudioAnimValue | null, StudioAnimValue | null, StudioAnimValue | null, StudioAnimValue | null, StudioAnimValue | null, StudioAnimValue | null,],
	) {
		this.#reader = reader;
		this.#offset = offset;
		this.#scale = scale;
		this.#offsets = offsets;
		this.#values = values;
	}

	getValues(frame: int, index: 0 | 1 | 2 | 3 | 4 | 5): [number, number] {
		const reader = this.#reader;
		reader.seek(this.#offset + this.#offsets[index]);
		let valid = 0;
		let total = 0;
		let value;
		let k = frame;
		let count = 0;
		const scale = this.#scale[index];

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

		return [reader.getInt16() * scale, reader.getInt16() * scale];
	}

	getValue(frame: int, index: 0 | 1 | 2 | 3 | 4 | 5): number {
		const reader = this.#reader;
		reader.seek(this.#offset)
		let valid = 0;
		let total = 0;
		let value;
		let k = frame;
		let count = 0;
		const scale = this.#scale[index];

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

		return reader.getInt16() * scale;
	}
}
/*
export type AnimationStream = { // s_animationstream_t
	numError: number;
	pError?: StreamData;

	scale: [number, number, number, number, number, number,];
	numAnim: [number, number, number, number, number, number,];
	anim: [StudioAnimValue, StudioAnimValue, StudioAnimValue, StudioAnimValue, StudioAnimValue, StudioAnimValue,];
}

export type StreamData = { // s_streamdata_t
	pos: vec3;
	q: quat;
}

*/
export type StudioAnimValue = { // mstudioanimvalue_t
	value: int16;
	valid: int8;
	total: int8;
}
