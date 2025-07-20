import { Kv3Element } from '../../common/keyvalue/kv3element';
import { Source2File } from '../loaders/source2file';
import { Source2AnimationDesc } from './source2animationdesc';
import { Source2AnimeDecoder, Source2AnimGroup } from './source2animgroup';
import { kv3ElementToDecoderArray } from './utils';

export class Source2Animation {
	#animArray: Kv3Element[] = [];
	#animNames = new Map<string, Source2AnimationDesc>();
	#animGroup: Source2AnimGroup;
	filePath;
	file?: Source2File;
	#decoderArray: Source2AnimeDecoder[] = [];
	#segmentArray: Kv3Element[] = [];
	//#frameData;

	constructor(animGroup: Source2AnimGroup, filePath: string) {
		this.#animGroup = animGroup;
		this.filePath = filePath;
	}

	setFile(sourceFile: Source2File) {
		this.file = sourceFile;

		const animDatas =
			//sourceFile.getBlockStruct('DATA.structs.AnimationResourceData_t')
			sourceFile.getBlockKeyValues('DATA')
			//?? sourceFile.getBlockStruct('DATA', 'm_localS1SeqDescArray')
			?? sourceFile.getBlockKeyValues('ANIM');

		if (animDatas) {
			this.setAnimDatas(animDatas);
		}
	}

	setAnimDatas(data: Kv3Element) {
		if (data) {
			this.#animArray = data.getValueAsElementArray('m_animArray') ?? [];//data.m_animArray ?? [];
			//console.error('data.m_animArray', data.m_animArray);
			this.#decoderArray = kv3ElementToDecoderArray(data.getValueAsElementArray('m_decoderArray'));//this.decoderArray = data.m_decoderArray;

			this.#segmentArray = data.getValueAsElementArray('m_segmentArray') ?? [];//data.m_segmentArray;
			//this.#frameData = data.m_frameData;

			//for (let i = 0; i < this.#animArray.length; i++) {
			for (const anim of this.#animArray) {
				//const anim = this.#animArray[i];
				const animName = anim.getValueAsString('m_name');
				if (animName) {
					this.#animNames.set(animName, new Source2AnimationDesc(this.#animGroup.source2Model, anim, this));
				}
			}
		}
	}

	getAnimDesc(name: string): Source2AnimationDesc | undefined {
		return this.#animNames.get(name);
	}

	getDecodeKey() {
		return this.#animGroup.decodeKey;
	}

	getDecoderArray() {
		return this.#decoderArray;
	}

	getSegment(segmentIndex: number): Kv3Element {
		//TODO: check segement
		return this.#segmentArray[segmentIndex];
	}

	async getAnimations(animations = new Set<string>()) {
		for (let i = 0; i < this.#animArray.length; i++) {
			const anim = this.#animArray[i];
			animations.add(anim.m_name);
			for (const activity of anim.m_activityArray ?? []) {
				animations.add(activity.m_name);
			}
		}
		return animations;
	}

	getAnimationByActivity(activityName, activityModifiers) {
		if (!this.#animArray) {
			return [,];
		}
		const anims = new Map();
		let bestMatch;
		let bestScore = Infinity;
		for (const anim of this.#animArray) {
			if (!anim.m_activityArray) {
				continue;
			}
			let matchingActivity = false;
			let unmatchingModifiers = 0;
			for (const activity of anim.m_activityArray ?? []) {
				if (activity.m_name == activityName) {
					matchingActivity = true;
				}
				let modifierMatching = false;
				for (const activityModifier of activityModifiers) {
					if (activity.m_name == activityModifier) {
						modifierMatching = true;
						break;
					}
				}
				if (!modifierMatching) {
					++unmatchingModifiers;
				}
			}

			if (matchingActivity) {
				for (const activityModifier of activityModifiers) {
					let modifierMatching = false;
					for (const activity of anim.m_activityArray ?? []) {
						if (activity.m_name == activityModifier) {
							modifierMatching = true;
							break;
						}
					}
					if (!modifierMatching) {
						++unmatchingModifiers;
					}
				}
				if (unmatchingModifiers < bestScore) {
					const animDesc = this.#animNames.get(anim.m_name);
					if (animDesc) {
						bestMatch = animDesc;
						bestScore = unmatchingModifiers;
					}
				}
			}
		}
		return [bestMatch, bestScore];
	}

	getAnimationsByActivity(activityName: string) {
		const anims = [];
		for (const [animName, animDesc] of this.#animNames) {
			if (animDesc.matchActivity(activityName)) {
				anims.push(animDesc);
			}
		}
		return anims;
	}

	get animArray() {
		return this.#animArray;
	}

	getAnimationByName(animName: string) {
		return this.#animNames.get(animName);
		//return this.#internalAnimGroup?.getAnimationByName(animName);
		/*for (let source2Animation in this.#animArray) {
			let anim = source2Animation.getAnimationByName(animName);
			if (anim) {
				return anim;
			}
		}*/
	}
}
