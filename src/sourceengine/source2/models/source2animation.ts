import { Source2AnimationDesc } from './source2animationdesc';

export class Source2Animation {
	#animArray;
	#animNames = new Map<string, Source2AnimationDesc>();
	animGroup;
	filePath;
	file;
	decoderArray;
	segmentArray;
	frameData;
	constructor(animGroup, filePath) {
		this.animGroup = animGroup;
		this.filePath = filePath;
	}

	setFile(sourceFile) {
		this.file = sourceFile;

		this.setAnimDatas(sourceFile.getBlockStruct('DATA.structs.AnimationResourceData_t')
			?? sourceFile.getBlockStruct('DATA.keyValue.root')
			?? sourceFile.getBlockStruct('DATA.keyValue.root.m_localS1SeqDescArray')
			?? sourceFile.getBlockStruct('ANIM.keyValue.root')
		);
	}

	setAnimDatas(data) {
		if (data) {
			this.#animArray = data.m_animArray ?? [];
			//console.error('data.m_animArray', data.m_animArray);
			this.decoderArray = data.m_decoderArray;
			this.segmentArray = data.m_segmentArray;
			this.frameData = data.m_frameData;

			if (this.#animArray) {
				for (let i = 0; i < this.#animArray.length; i++) {
					const anim = this.#animArray[i];
					this.#animNames.set(anim.m_name, new Source2AnimationDesc(this.animGroup.source2Model, anim, this));
				}
			}
		}
	}
	getAnimDesc(name: string): Source2AnimationDesc | undefined {
		return this.#animNames.get(name);
	}
	getDecodeKey() {
		return this.animGroup.decodeKey;
	}
	getDecoderArray() {
		return this.decoderArray;
	}
	getSegment(segmentIndex) {
		//TODO: check segement
		return this.segmentArray[segmentIndex];
	}

	async getAnimations(animations = new Set()) {
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

	getAnimationsByActivity(activityName) {
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

	getAnimationByName(animName) {
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
