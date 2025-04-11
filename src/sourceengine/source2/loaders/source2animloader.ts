import { Source2FileLoader } from './source2fileloader';
import { Source2SeqGroup } from '../animations/source2seqgroup';
import { Source2Animation } from '../models/source2animation';
import { Source2AnimGroup } from '../models/source2animgroup';
import { registerLoader } from '../../../loaders/loaderfactory';
import { Source2File } from './source2file';

export const Source2AnimLoader = new (function () {
	class Source2AnimLoader {
		loadingSlot = 100;//TODO
		pending = {};
		fileName: string;
		animGroupName: string;
		animName: string;

		async loadAnimGroup(source2Model, repository, animGroupName) {
			animGroupName = animGroupName.toLowerCase();
			animGroupName = animGroupName.replace(/\.(vagrp_c$|vagrp$)/, '');
			this.fileName = animGroupName;
			this.animGroupName = animGroupName;

			let animGroup = new Source2AnimGroup(source2Model, repository);
			await this.#getVagrp(repository, animGroupName, animGroup);

			return animGroup;
		}

		async #getVagrp(repository, animGroupName, animGroup) {
			var agrpFile = animGroupName + '.vagrp_c';
			if (this.pending[agrpFile]) {
				return true;
			}
			this.pending[agrpFile] = true;


			await this.#loadVagrp(repository, agrpFile, animGroup);
			/*
			let promise = new Promise((resolve, reject) => {
				fetch(new Request(agrpFile)).then((response) => {
					response.arrayBuffer().then(async (arrayBuffer) => {
						await this.#loadVagrp(repository, agrpFile, arrayBuffer, animGroup);
						this.pending[agrpFile] = null;
						resolve(true);
					})
				});
			});
			0*/
			return true;

		}

		async loadAnim(repository, animName, animGroup) {
			animName = animName.toLowerCase();
			animName = animName.replace(/\.(vanim_c$|vanim$)/, '');
			this.fileName = animName;
			//animName = repository + animName;
			this.animName = animName;

			let anim = new Source2Animation(animGroup, animName);
			await this.#getVanim(repository, animName, anim);

			return anim;
		}

		async #getVanim(repository, animName, anim) {
			var animFile = animName + '.vanim_c';
			if (this.pending[animFile]) {
				return true;
			}
			this.pending[animFile] = true;
			/*
						fetch(new Request(animFile)).then((response) => {
							response.arrayBuffer().then((arrayBuffer) => {
								this.loadVanim(repository, animFile, arrayBuffer, anim);
							})
						});
						*/

			this.#loadVanim(repository, animFile, anim);
			/*
			let promise = new Promise((resolve, reject) => {
				fetch(new Request(animFile)).then((response) => {
					response.arrayBuffer().then(async (arrayBuffer) => {
						this.loadVanim(repository, animFile, arrayBuffer, anim);
						this.pending[animFile] = null;
						resolve(true);
					})
				});
			});
			*/
			return true;
		}

		async #loadVagrp(repository, fileName, animGroup) {
			let vagrp = await new Source2FileLoader().load(repository, fileName) as Source2File;
			if (vagrp) {
				animGroup.setFile(vagrp);
				var dataBlock = vagrp.blocks.DATA;
				if (dataBlock) {
					animGroup.meshesNames = vagrp.getPermModelData('m_meshGroups');
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

		async #loadVanim(repository, fileName, anim) {
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

		async loadSequenceGroup(repository, seqGroupName, animGroup) {
			repository = repository.toLowerCase();
			seqGroupName = seqGroupName.replace(/\.(vseq_c$|vseq)/, '');
			//seqGroupName = repository + seqGroupName;

			let seqGroup = new Source2SeqGroup(animGroup);
			await this.#getVseq(repository, seqGroupName, seqGroup);

			return seqGroup;
		}

		async #getVseq(repository, seqGroupName, seqGroup) {
			var seqFile = seqGroupName + '.vseq_c';
			if (this.pending[seqFile]) {
				return true;
			}
			this.pending[seqFile] = true;

			await this.#loadVseq(repository, seqFile, seqGroup);
			/*
			let promise = new Promise((resolve, reject) => {
				fetch(new Request(seqFile)).then((response) => {
					response.arrayBuffer().then(async (arrayBuffer) => {
						await this.loadVseq(repository, seqFile, arrayBuffer, seqGroup);
						this.pending[seqFile] = null;
						resolve(true);
					})
				});
			});
			*/
			return true;
		}

		async #loadVseq(repository, fileName, seqGroup) {
			let vseq = await new Source2FileLoader().load(repository, fileName);
			if (vseq) {
				seqGroup.setFile(vseq);
			}
		}
	}
	return Source2AnimLoader;
}());
registerLoader('Source2AnimLoader', Source2AnimLoader);
