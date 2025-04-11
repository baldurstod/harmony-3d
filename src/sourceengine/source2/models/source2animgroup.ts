import { AnimManager } from './animmanager';
import { Source2Animation } from './source2animation';
import { Source2AnimationDesc } from './source2animationdesc';

export class Source2AnimGroup {
	#source2Model;
	#_changemyname: Array<Source2Animation> = [];
	repository: string;
	file;
	decoderArray;
	localAnimArray;
	decodeKey;
	directHSeqGroup;
	loaded = false;
	constructor(source2Model, repository: string) {
		//TODO: remove repository param. redundant with model
		this.#source2Model = source2Model;
		this.repository = repository;
	}

	setFile(sourceFile) {
		this.file = sourceFile;

		let localAnimArray;
		let decodeKey;
		let decoderArray;
		let animationGroupData = sourceFile.getBlockStruct('DATA.structs.AnimationGroupResourceData_t');

		let directHSeqGroup;
		if (animationGroupData) {
			localAnimArray = animationGroupData.m_localHAnimArray;
			decodeKey = animationGroupData.m_decodeKey;
			directHSeqGroup = animationGroupData.m_directHSeqGroup;
		} else {
			localAnimArray = sourceFile.getBlockStruct('DATA.keyValue.root.m_localHAnimArray');
			decodeKey = sourceFile.getBlockStruct('DATA.keyValue.root.m_decodeKey');
			directHSeqGroup = sourceFile.getBlockStruct('DATA.keyValue.root.m_directHSeqGroup');
		}

		this.decoderArray = sourceFile.getBlockStruct('ANIM.keyValue.root.m_decoderArray');

		if (directHSeqGroup) {
			(async () => {
				this.directHSeqGroup = await AnimManager.getSequenceGroup(this.repository, directHSeqGroup, this);
			})();
		}
		this.setAnimationGroupResourceData(localAnimArray, decodeKey);

		let anims = sourceFile.getBlockStruct('ANIM.keyValue.root');
		if (anims) {
			let loadedAnim = new Source2Animation(this, '');
			loadedAnim.setAnimDatas(anims);
			this._changemyname = this._changemyname || [];
			this._changemyname.push(loadedAnim);
			/*let m_animArray = anims.m_animArray;
			for (let i = 0; i < m_animArray.length; i++) {
			}*/
		}
		this.loaded = true;
	}

	setAnimationGroupResourceData(localAnimArray, decodeKey) {
		this.localAnimArray = localAnimArray;
		this.decodeKey = decodeKey;
		//this.getAnim(0);
		if (localAnimArray) {
			for (const localAnim of localAnimArray) {
				const anim = AnimManager.getAnim(this.repository, localAnim, this);
				console.info(anim);
			}
		}
	}

	getAnim(animIndex: number) {
		if (this.localAnimArray && this.localAnimArray[animIndex]) {
			return AnimManager.getAnim(this.repository, this.localAnimArray[animIndex], this);
		}
		return null;
	}

	getAnimDesc(name: string): Source2AnimationDesc | undefined {
		let animation: Source2AnimationDesc;
		for (const a of this.#_changemyname) {
			animation = a.getAnimDesc(name);
			if (animation) {
				return animation;
			}
		}
	}

	matchActivity(activity, modifiers) {
		if (this.directHSeqGroup) {
			return this.directHSeqGroup.matchActivity(activity, modifiers);
		}
	}

	getAnims(): Set<Source2Animation> {
		let anims = new Set<Source2Animation>();

		for (let anim of this._changemyname) {
			if (anim) {
				anims.add(anim);
			}
		}

		if (this.localAnimArray) {
			for (let animName of this.localAnimArray) {
				if (animName) {
					let anim = AnimManager.getAnim(this.repository, animName, this);
					if (anim) {
						anims.add(anim);
					}
				}
			}
		}

		return anims;
	}

	getAnimationsByActivity(activityName) {
		let anims = [];

		for (let anim of this._changemyname) {
			if (anim) {
				anims.push(...anim.getAnimationsByActivity(activityName));
			}
		}

		if (this.localAnimArray) {
			for (let animName of this.localAnimArray) {
				if (animName) {
					let anim = AnimManager.getAnim(this.repository, animName, this);
					if (anim) {
						anims.push(...anim.getAnimationsByActivity(activityName));
					}
				}
			}
		}

		if (this.directHSeqGroup) {
			anims.push(...this.directHSeqGroup.getAnimationsByActivity(activityName));
		}

		return anims;
	}

	getDecodeKey() {
		return this.decodeKey;
	}

	get source2Model() {
		return this.#source2Model;
	}

	getAnimationByName(animName: string): Source2AnimationDesc {
		//return this.#internalAnimGroup?.getAnimationByName(animName);
		for (let source2Animation of this.getAnims()) {
			let anim = source2Animation.getAnimationByName(animName);
			if (anim) {
				return anim;
			}
		}
	}

	//TODO: remove setter and getter
	set _changemyname(_changemyname) {
		this.#_changemyname = _changemyname;
	}

	get _changemyname() {
		return this.#_changemyname;
	}
}
