
import { Source2SeqGroup } from '../animations/source2seqgroup';
import { Source2File } from '../loaders/source2file';
import { Source2FileLoader } from '../loaders/source2fileloader';
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
				this.directHSeqGroup = await getSequenceGroup(this.repository, directHSeqGroup, this);
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
					let anim = getAnim(this.repository, animName, this);
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
					let anim = getAnim(this.repository, animName, this);
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


let seqGroupList = {};

function getSequenceGroup(repository: string, seqGroupName: string, animGroup: Source2AnimGroup) {
	var seqGroup = seqGroupList[seqGroupName];
	if (!seqGroup) {
		seqGroup = loadSequenceGroup(repository, seqGroupName, animGroup);
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

	let seqGroup = new Source2SeqGroup(animGroup);
	await getVseq(repository, seqGroupName, seqGroup);

	return seqGroup;
}

const pending: { [key: string]: boolean } = {};
async function getVseq(repository: string, seqGroupName: string, seqGroup: Source2SeqGroup) {
	var seqFile = seqGroupName + '.vseq_c';
	if (pending[seqFile]) {
		return true;
	}
	pending[seqFile] = true;

	await loadVseq(repository, seqFile, seqGroup);
	/*
	let promise = new Promise((resolve, reject) => {
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
	let vseq = await new Source2FileLoader().load(repository, fileName);
	if (vseq) {
		seqGroup.setFile(vseq);
	}
}



let animList = {};
function getAnim(repository: string, animName: string, animGroup: Source2AnimGroup) {
	if (!animName) {
		return "";
	}
	let anim = animList[animName];
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

	let anim = new Source2Animation(animGroup, animName);
	await getVanim(repository, animName, anim);

	return anim;
}

async function getVanim(repository: string, animName: string, anim: Source2Animation) {
	var animFile = animName + '.vanim_c';
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
	let promise = new Promise((resolve, reject) => {
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
	let vanim = await new Source2FileLoader().load(repository, fileName) as Source2File;
	if (vanim) {
		anim.setFile(vanim);
		let dataBlock = vanim.blocks.DATA;
		if (dataBlock) {
			anim.setAnimDatas(vanim.getBlockStruct('DATA.structs.AnimationResourceData_t') || vanim.getBlockStruct('DATA.keyValue.root'));
		}
	}
	//this.fileLoaded(model);TODOv3
}
