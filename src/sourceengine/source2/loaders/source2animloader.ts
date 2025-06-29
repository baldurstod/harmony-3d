import { Source2AnimGroup } from '../models/source2animgroup';
import { Source2Model } from '../models/source2model';
import { Source2File } from './source2file';
import { Source2FileLoader } from './source2fileloader';

const loadingSlot = 100;//TODO
const pending: Record<string, boolean> = {};

export async function loadAnimGroup(source2Model: Source2Model, repository: string, animGroupName: string): Promise<Source2AnimGroup> {
	animGroupName = animGroupName.toLowerCase();
	animGroupName = animGroupName.replace(/\.(vagrp_c$|vagrp$)/, '');

	const animGroup = new Source2AnimGroup(source2Model, repository);
	await getVagrp(repository, animGroupName, animGroup);

	return animGroup;
}

async function getVagrp(repository: string, animGroupName: string, animGroup: Source2AnimGroup) {
	const agrpFile = animGroupName + '.vagrp_c';
	if (pending[agrpFile]) {
		return true;
	}
	pending[agrpFile] = true;

	await loadVagrp(repository, agrpFile, animGroup);
	return true;
}

async function loadVagrp(repository: string, fileName: string, animGroup: Source2AnimGroup) {
	const vagrp = await new Source2FileLoader().load(repository, fileName) as Source2File;
	if (vagrp) {
		animGroup.setFile(vagrp);
		const dataBlock = vagrp.blocks.DATA;
		if (dataBlock) {
			//animGroup.meshesNames = vagrp.getPermModelData('m_meshGroups');
			const m_refMeshes = vagrp.getPermModelData('m_refMeshes');
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
