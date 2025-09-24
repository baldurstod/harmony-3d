import { Kv3Element } from '../../common/keyvalue/kv3element';
import { Source2SeqGroup } from '../animations/source2seqgroup';
import { Source2File } from '../loaders/source2file';
import { Source2FileLoader } from '../loaders/source2fileloader';
import { Source2Animation } from './source2animation';
import { Source2AnimationDesc } from './source2animationdesc';
import { Source2Model } from './source2model';
import { kv3ElementToDecoderArray } from './utils';

export type Source2AnimeDecoder = {
	name: string;
	version: number;
	type: number;
}

export class Source2AnimGroup {
	#source2Model: Source2Model;
	#_changemyname: Source2Animation[] = [];
	repository: string;
	file?: Source2File;
	decoderArray: Source2AnimeDecoder[] = [];
	localAnimArray: string[] | null = null;
	decodeKey?: Kv3Element;
	directHSeqGroup?: Source2SeqGroup;
	loaded = false;

	constructor(source2Model: Source2Model, repository: string) {
		//TODO: remove repository param. redundant with model
		this.#source2Model = source2Model;
		this.repository = repository;
	}

	setFile(sourceFile: Source2File) {
		this.file = sourceFile;

		let localAnimArray: string[] | null;
		let decodeKey: Kv3Element | null;
		const animationGroupData = sourceFile.getBlockStructAsElement('DATA', 'AnimationGroupResourceData_t');

		let directHSeqGroup;
		if (animationGroupData) {
			// TODO: this part is not tested find a test case
			localAnimArray = animationGroupData.getValueAsResourceArray('m_localHAnimArray');
			decodeKey = animationGroupData.getSubValueAsElement('m_decodeKey');
			directHSeqGroup = animationGroupData.getSubValueAsString('m_directHSeqGroup');
		} else {
			localAnimArray = sourceFile.getBlockStructAsResourceArray('DATA', 'm_localHAnimArray');
			decodeKey = sourceFile.getBlockStructAsElement('DATA', 'm_decodeKey');
			directHSeqGroup = sourceFile.getBlockStructAsString('DATA', 'm_directHSeqGroup');
		}

		this.decoderArray = kv3ElementToDecoderArray(sourceFile.getBlockStructAsElementArray('ANIM', 'm_decoderArray'));

		if (directHSeqGroup) {
			// TODO: this part is not tested find a test case
			(async () => {
				this.directHSeqGroup = await getSequenceGroup(this.repository, directHSeqGroup as string, this);
			})();
		}
		if (decodeKey) {
			this.setAnimationGroupResourceData(localAnimArray, decodeKey);
		}

		const anims = sourceFile.getBlockKeyValues('ANIM');
		if (anims) {
			const loadedAnim = new Source2Animation(this);
			loadedAnim.setAnimDatas(anims);
			this._changemyname = this._changemyname || [];
			this._changemyname.push(loadedAnim);
			/*let m_animArray = anims.m_animArray;
			for (let i = 0; i < m_animArray.length; i++) {
			}*/
		}
		this.loaded = true;
	}

	setAnimationGroupResourceData(localAnimArray: string[] | null, decodeKey: Kv3Element) {
		this.localAnimArray = localAnimArray;
		this.decodeKey = decodeKey;
		//this.getAnim(0);
		if (localAnimArray) {
			for (const localAnim of localAnimArray) {
				const anim = getAnim(this.repository, localAnim, this);
				//console.info(anim);
			}
		}
	}

	getAnim(animIndex: number) {
		if (this.localAnimArray && this.localAnimArray[animIndex]) {
			return getAnim(this.repository, this.localAnimArray[animIndex], this);
		}
		return null;
	}

	getAnimDesc(name: string): Source2AnimationDesc | undefined {
		let animation: Source2AnimationDesc | undefined;
		for (const a of this.#_changemyname) {
			animation = a.getAnimDesc(name);
			if (animation) {
				return animation;
			}
		}
	}

	matchActivity(activity: string, modifiers: string[]) {
		if (this.directHSeqGroup) {
			return this.directHSeqGroup.matchActivity(activity, modifiers);
		}
	}

	getAnims(): Set<Source2Animation> {
		const anims = new Set<Source2Animation>();

		for (const anim of this._changemyname) {
			if (anim) {
				anims.add(anim);
			}
		}

		if (this.localAnimArray) {
			for (const animName of this.localAnimArray) {
				if (animName) {
					const anim = getAnim(this.repository, animName, this);
					if (anim) {
						anims.add(anim);
					}
				}
			}
		}

		return anims;
	}

	getAnimationsByActivity(activityName: string) {
		const anims = [];

		for (const anim of this._changemyname) {
			if (anim) {
				anims.push(...anim.getAnimationsByActivity(activityName));
			}
		}

		if (this.localAnimArray) {
			for (const animName of this.localAnimArray) {
				if (animName) {
					const anim = getAnim(this.repository, animName, this);
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

	getAnimationByName(animName: string): Source2AnimationDesc | null {
		//return this.#internalAnimGroup?.getAnimationByName(animName);
		for (const source2Animation of this.getAnims()) {
			const anim = source2Animation.getAnimationByName(animName);
			if (anim) {
				return anim;
			}
		}
		return null
	}

	//TODO: remove setter and getter
	set _changemyname(_changemyname) {
		this.#_changemyname = _changemyname;
	}

	get _changemyname() {
		return this.#_changemyname;
	}
}


const seqGroupList: Record<string, Source2SeqGroup> = {};

async function getSequenceGroup(repository: string, seqGroupName: string, animGroup: Source2AnimGroup): Promise<Source2SeqGroup | undefined> {
	let seqGroup = seqGroupList[seqGroupName];
	if (!seqGroup) {
		seqGroup = await loadSequenceGroup(repository, seqGroupName, animGroup);
	}
	if (seqGroup) {
		seqGroupList[seqGroupName] = seqGroup;
	} else {
		//TODO; create dummy
		console.error('No anim group loaded');
	}
	return seqGroup;
}


export async function loadSequenceGroup(repository: string, seqGroupName: string, animGroup: Source2AnimGroup) {
	repository = repository.toLowerCase();
	seqGroupName = seqGroupName.replace(/\.(vseq_c$|vseq)/, '');
	//seqGroupName = repository + seqGroupName;

	const seqGroup = new Source2SeqGroup(animGroup);
	await getVseq(repository, seqGroupName, seqGroup);

	return seqGroup;
}

const pending: Record<string, boolean> = {};
async function getVseq(repository: string, seqGroupName: string, seqGroup: Source2SeqGroup) {
	const seqFile = seqGroupName + '.vseq_c';
	if (pending[seqFile]) {
		return true;
	}
	pending[seqFile] = true;

	await loadVseq(repository, seqFile, seqGroup);
	/*
	let promise = new Promise((resolve) => {
		fetch(new Request(seqFile)).then((response) => {
			response.arrayBuffer().then(async (arrayBuffer) => {
				await this.loadVseq(repository, seqFile, arrayBuffer, seqGroup);
				pending[seqFile] = null;
				resolve(true);
			})
		});
	});
	*/
	return true;
}

async function loadVseq(repository: string, fileName: string, seqGroup: Source2SeqGroup) {
	const vseq = await new Source2FileLoader().load(repository, fileName) as Source2File;
	if (vseq) {
		seqGroup.setFile(vseq);
	}
}



const animList: Record<string, Source2Animation> = {};
function getAnim(repository: string, animName: string, animGroup: Source2AnimGroup): Source2Animation | null {
	if (!animName) {
		return null;
	}
	const anim = animList[animName];
	if (anim === undefined) {
		loadAnim(repository, animName, animGroup).then(
			anim => {
				animList[animName] = anim;
				animGroup._changemyname.push(anim);
			}
		)
		return null;
	} else {
		return anim;
	}
}



export async function loadAnim(repository: string, animName: string, animGroup: Source2AnimGroup) {
	animName = animName.toLowerCase();
	animName = animName.replace(/\.(vanim_c$|vanim$)/, '');
	//this.fileName = animName;
	//animName = repository + animName;
	//this.animName = animName;

	const anim = new Source2Animation(animGroup);
	await getVanim(repository, animName, anim);

	return anim;
}

async function getVanim(repository: string, animName: string, anim: Source2Animation) {
	const animFile = animName + '.vanim_c';
	if (pending[animFile]) {
		return true;
	}
	pending[animFile] = true;
	/*
				fetch(new Request(animFile)).then((response) => {
					response.arrayBuffer().then((arrayBuffer) => {
						this.loadVanim(repository, animFile, arrayBuffer, anim);
					})
				});
				*/

	loadVanim(repository, animFile, anim);
	/*
	let promise = new Promise((resolve) => {
		fetch(new Request(animFile)).then((response) => {
			response.arrayBuffer().then(async (arrayBuffer) => {
				this.loadVanim(repository, animFile, arrayBuffer, anim);
				pending[animFile] = null;
				resolve(true);
			})
		});
	});
	*/
	return true;
}

async function loadVanim(repository: string, fileName: string, anim: Source2Animation) {
	const vanim = await new Source2FileLoader().load(repository, fileName) as Source2File;
	if (vanim) {
		anim.setFile(vanim);
		const dataBlock = vanim.getBlockStructAsElement('DATA', '');
		if (dataBlock) {
			anim.setAnimDatas(dataBlock);// || vanim.getBlockStruct('DATA.keyValue.root'));
		}
	}
	//this.fileLoaded(model);TODOv3
}
