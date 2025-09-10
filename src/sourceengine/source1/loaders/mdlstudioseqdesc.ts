import { vec3 } from 'gl-matrix';
import { DEBUG } from '../../../buildoptions';
import { clamp } from '../../../math/functions';
import { Source1ModelInstance } from '../export';
import { Source1ParticleControler } from '../particles/source1particlecontroler';
import { Source1SoundManager } from '../sounds/soundmanager';
import { SourceMdl } from './sourcemdl';

export const STUDIO_AL_POST = 0x0010;
export const STUDIO_AL_SPLINE = 0x0040;
export const STUDIO_AL_XFADE = 0x0080;
export const STUDIO_AL_NOBLEND = 0x0200;
export const STUDIO_AL_LOCAL = 0x1000;
export const STUDIO_AL_POSE = 0x4000;
export const AE_CL_PLAYSOUND = 5004;

export class MdlStudioSeqDesc {//mstudioseqdesc_t
	paramindex: number[] = [];
	paramstart: number[] = [];
	paramend: number[] = [];
	blend: number[][] = [];
	weightlist: number[] = [];
	groupsize: [number, number] = [0, 0];
	mdl!: SourceMdl;
	previousTime: number = -1;
	currentTime: number = -1;
	posekeyindex!: number;
	autolayer: MdlStudioAutoLayer[] = [];
	events: MdlStudioEvent[] = [];
	name!: string;
	flags!: number;
	activity!: number;
	id !: number;
	startOffset!: number;
	actweight !: number;
	numevents !: number;
	eventindex !: number;
	bbmin = vec3.create();
	bbmax = vec3.create();
	numblends!: number;
	animindexindex!: number;
	movementindex!: number;
	paramparent!: number;
	fadeintime!: number;
	fadeouttime!: number;
	localentrynode!: number;
	localexitnode!: number;
	nodeflags!: number;
	entryphase!: number;
	exitphase!: number;
	lastframe!: number;
	nextseq!: number;
	pose!: number;
	numikrules!: number;
	numautolayers!: number;
	autolayerindex!: number;
	weightlistindex !: number;
	numiklocks !: number;
	iklockindex !: number;
	keyvalueindex !: number;
	keyvaluesize !: number;
	cycleposeindex !: number;
	activityName!: string;
	keyvalueText!: string;

	pBoneweight(boneIndex: number) {
		return this.weightlist[boneIndex];
	}
	//MdlStudioSeqDesc.prototype.weight = MdlStudioSeqDesc.prototype.pBoneweight;//TODOV2

	getBlend(x: number, y: number): number | null {
		x = clamp(x, 0, this.groupsize[0] - 1);
		y = clamp(y, 0, this.groupsize[1] - 1);
		return this.blend[y]?.[x] ?? null;
	}

	poseKey(iParam: number, iAnim: number) {
		if (this.mdl && this.posekeyindex) {
			const mdl = this.mdl;
			const offset = this.posekeyindex + (iParam * this.groupsize[0] + iAnim) * 4;

			return mdl.reader.getFloat32(offset);//TODOv3
		}
		//float				*pPoseKey(int iParam, int iAnim) const { return (float *)(((byte *)this) + posekeyindex) + iParam * groupsize[0] + iAnim; }
		return 0;
	}

	getAutoLayer(autoLayerIndex: number): MdlStudioAutoLayer | null {
		return this.autolayer[autoLayerIndex] ?? null;
	}

	get length() {
		const anim = this.mdl.getAnimDescription(this.blend[0]?.[0]);
		if (!anim) {
			return 0;
		}

		return (anim.numframes - 1) / anim.fps;
	}

	play(dynamicProp: Source1ModelInstance): void {
		const anim = this.mdl.getAnimDescription(this.blend[0]?.[0]);
		if (!anim) {
			return;
		}

		this.currentTime = (this.currentTime !== undefined) ? dynamicProp.frame * anim.fps / (anim.numframes - 1) : 0;
		this.currentTime = this.currentTime % 1;
		this.previousTime = (this.previousTime !== undefined) ? this.previousTime : -1;

		if (this.previousTime > this.currentTime) {
			this.previousTime = this.currentTime;
		}

		const previousTime = this.previousTime;
		const currentTime = this.currentTime;

		const seqEvents = this.events;
		for (let eventIndex = 0; eventIndex < seqEvents.length; ++eventIndex) {
			const event = seqEvents[eventIndex]!;
			if (event.cycle > previousTime && event.cycle <= currentTime) {
				this.processEvent(event, dynamicProp);//TODOv3
			}
		}
		this.previousTime = this.currentTime;
	}

	processEvent(event: MdlStudioEvent, dynamicProp: Source1ModelInstance): void {
		let options: string[];
		switch (true) {
			case event.event == 5004 || (event.event === 0 && event.name == 'AE_CL_PLAYSOUND'):
				Source1SoundManager.playSound(this.mdl?.repository, event.options);
				break;
			case (event.event === 0 && event.name == 'AE_CL_BODYGROUP_SET_VALUE'):
				options = event.options.split(' ');
				//dynamicProp.bodyGroups[options[0]] = options[1];
				if (options.length >= 2) {
					dynamicProp.setBodyPartModel(options[0]!, Number(options[1]));
				}
				break;
			case (event.event === 0 && event.name == 'AE_WPN_HIDE'):
				//TODOV2
				//dynamicProp.setVisibility(false);
				//console.error('AE_WPN_HIDE' + dynamicProp.name);
				break;
			case (event.event === 0 && event.name == 'AE_WPN_UNHIDE'):
				//TODOV2
				//dynamicProp.setVisibility(true);
				//console.error('AE_WPN_UNHIDE' + dynamicProp.name);
				break;
			case (event.event === 0 && event.name == 'AE_CL_CREATE_PARTICLE_EFFECT'):
				options = event.options.split(' ');
				//TODOV2
				const f = async () => {
					const sys = await Source1ParticleControler.createSystem(dynamicProp.sourceModel.repository, options[0]!);
					sys.autoKill = true;
					sys.start();
					//console.log(options[0], options[1], options[2]);
					switch (options[1]) {
						case 'follow_attachment':
							dynamicProp.attachSystem(sys, options[2]);
							break;
						case 'start_at_attachment':
							dynamicProp.attachSystem(sys, options[2]);
							break;
						case 'start_at_origin':
							dynamicProp.attachSystem(sys, options[2]);
							break;
						default:
							if (DEBUG) {
								console.error(`Unknown option ${options[1]}`, options);
							}
					}
				};
				if (options.length >= 1) {
					f();
				}
				/*TODOv2
						'start_at_origin',		// PATTACH_ABSORIGIN = 0,
						'follow_origin',		// PATTACH_ABSORIGIN_FOLLOW,
						'start_at_customorigin',// PATTACH_CUSTOMORIGIN,
						'start_at_attachment',	// PATTACH_POINT,
						'follow_attachment',	// PATTACH_POINT_FOLLOW,
				*/
				break;
			case (event.event === 0 && event.name == 'AE_TAUNT_ADD_ATTRIBUTE'):
				//{ event AE_TAUNT_ADD_ATTRIBUTE 1 'taunt_attr_player_invis_percent 1 5.215' }
				options = event.options.split(' ');
				switch (options[0]) {
					case 'taunt_attr_player_invis_percent':
						dynamicProp.setVisible(false);
						if (options.length >= 3) {
							setTimeout(function () { dynamicProp.setVisible() }, Number(options[2]) * 1000);
						}
						break;
				}

				break;
			default:
				//console.warn(event);
				break;
		}

		//'AE_CL_BODYGROUP_SET_VALUE'
	}
}

export class MdlStudioAutoLayer {
	iSequence!: number;
	iPose!: number;
	flags!: number;
	start!: number;
	peak!: number;
	tail!: number;
	end!: number;
};

export class MdlStudioEvent {
	cycle!: number;
	event!: number;
	type!: number;
	options!: string;
	name!: string;
};
