import { Source2FileLoader } from './source2fileloader';
import { Source2SeqGroup } from '../animations/source2seqgroup';
import { Source2Animation } from '../models/source2animation';
import { Source2AnimGroup } from '../models/source2animgroup';
import { Source2File } from './source2file';
import { Source2Model } from '../models/source2model';

const loadingSlot = 100;//TODO
const pending: { [key: string]: boolean } = {};

export async function loadAnimGroup(source2Model: Source2Model, repository: string, animGroupName: string): Promise<Source2AnimGroup> {
	animGroupName = animGroupName.toLowerCase();
	animGroupName = animGroupName.replace(/\.(vagrp_c$|vagrp$)/, '');

	let animGroup = new Source2AnimGroup(source2Model, repository);
	await getVagrp(repository, animGroupName, animGroup);

	return animGroup;
}

async function getVagrp(repository: string, animGroupName: string, animGroup: Source2AnimGroup) {
	var agrpFile = animGroupName + '.vagrp_c';
	if (pending[agrpFile]) {
		return true;
	}
	pending[agrpFile] = true;

	await loadVagrp(repository, agrpFile, animGroup);
	/*
	let promise = new Promise((resolve, reject) => {
		fetch(new Request(agrpFile)).then((response) => {
			response.arrayBuffer().then(async (arrayBuffer) => {
				await this.#loadVagrp(repository, agrpFile, arrayBuffer, animGroup);
				pending[agrpFile] = null;
				resolve(true);
			})
		});
	});
	0*/
	return true;

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

async function loadVagrp(repository: string, fileName: string, animGroup: Source2AnimGroup) {
	let vagrp = await new Source2FileLoader().load(repository, fileName) as Source2File;
	if (vagrp) {
		animGroup.setFile(vagrp);
		var dataBlock = vagrp.blocks.DATA;
		if (dataBlock) {
			//animGroup.meshesNames = vagrp.getPermModelData('m_meshGroups');
			var m_refMeshes = vagrp.getPermModelData('m_refMeshes');
			if (m_refMeshes) {

				/*for (var meshIndex = 0; meshIndex < meshes.length; meshIndex++) {
					var mesh = meshes[meshIndex];
					if (mesh = 'default') {

					}

				}*/
			}
		}
	}
	//this.fileLoaded(model);TODOv3
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

export async function loadSequenceGroup(repository: string, seqGroupName: string, animGroup: Source2AnimGroup) {
	repository = repository.toLowerCase();
	seqGroupName = seqGroupName.replace(/\.(vseq_c$|vseq)/, '');
	//seqGroupName = repository + seqGroupName;

	let seqGroup = new Source2SeqGroup(animGroup);
	await getVseq(repository, seqGroupName, seqGroup);

	return seqGroup;
}

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
