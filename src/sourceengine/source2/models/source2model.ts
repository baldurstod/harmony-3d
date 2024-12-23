import { vec3, vec4 } from 'gl-matrix';

import { Source2ModelInstance } from './source2modelinstance';
import { Source2Animation } from './source2animation';
import { Source2AnimGroup } from './source2animgroup';
import { AnimManager } from './animmanager';
import { Source2ModelAttachement } from './source2modelattachement';
import { Source2SeqGroup } from '../animations/source2seqgroup';
import { Source2Animations } from '../animations/source2animations';

const _SOURCE_MODEL_DEBUG_ = false; // removeme

export type BodyGroupChoice = {
	choice: string,
	bodyGroup: string,
	bodyGroupId: number,
}

export class Source2Model {
	#internalAnimGroup;
	#includeModels = [];
	repository: string;
	vmdl;
	requiredLod = 0;
	drawBodyPart = {};
	currentSkin = 0;
	currentSheen = null;
	animLayers = [];
	animGroups = new Set<Source2AnimGroup>();
	materialRepository = null;
	dirty = true;
	geometries = new Set();
	bodyParts = new Map();
	attachements = new Map();
	seqGroup;
	bodyGroups = new Set<string>();
	bodyGroupsChoices = new Set<BodyGroupChoice>();

	constructor(repository: string, vmdl) {
		this.repository = repository;
		this.vmdl = vmdl;

		this.#loadInternalAnimGroup();
		this.#createAnimGroup();
		this.#createBodyGroups();
	}

	#createAnimGroup() {
		let aseq = this.vmdl.getBlockByType('ASEQ');
		if (aseq) {
			this.seqGroup = new Source2SeqGroup(this.#internalAnimGroup);
			this.seqGroup.setFile(this.vmdl);
		}
	}

	#createBodyGroups() {
		let meshGroups = this.vmdl.getPermModelData('m_meshGroups') as Array<string>;
		if (meshGroups) {

			let bodyGroupId = 0;
			let bodyGroup: string | undefined;
			for (const choice of meshGroups) {
				if (choice == 'autodefault') {
					bodyGroup = choice;
				} else {
					const result = /(.*)_@\d$/.exec(choice);
					bodyGroup = result?.[1];
				}
				if (bodyGroup) {
					this.bodyGroups.add(bodyGroup);
					this.bodyGroupsChoices.add({ choice: choice, bodyGroup: bodyGroup, bodyGroupId: bodyGroupId });
				}
				bodyGroupId++;
			}
		}
	}

	matchActivity(activity, modifiers) {
		if (this.seqGroup) {
			return this.seqGroup.matchActivity(activity, modifiers);
		}
		return null;
	}

	addGeometry(geometry, bodyPartName, bodyPartModelId) {
		if (bodyPartName !== undefined) {
			let bodyPart = this.bodyParts.get(bodyPartName);
			if (bodyPart === undefined) {
				bodyPart = [];
				this.bodyParts.set(bodyPartName, bodyPart);
			}
			if (bodyPartModelId !== undefined) {
				let meshes = bodyPart[bodyPartModelId];
				if (meshes === undefined) {
					meshes = [];
					bodyPart[bodyPartModelId] = meshes;
				}
				meshes.push(geometry);
			}
		}
		this.geometries.add(geometry);
	}

	createInstance(isDynamic) {
		return new Source2ModelInstance(this, isDynamic);
	}

	getBodyNumber(bodygroups) {
		let bodyPartCount = 1;
		let bodyPartNumber = 0;
		//for (let bodyPartIndex = 0; bodyPartIndex < this.bodyParts.size; ++bodyPartIndex) {
		//			const bodyPart = this.bodyParts[bodyPartIndex];
		for (const [_, bodyPart] of this.bodyParts) {
			if (bodyPart && bodyPart.models && (bodyPart.models.length > 1)) {
				const bodyPartModel = bodygroups[bodyPart.name];
				bodyPartNumber += (bodyPartModel ? bodyPartModel.modelId : 0) * bodyPartCount;
				bodyPartCount *= (bodyPart.models.length);
			}
		}
		return bodyPartNumber;
	}

	getBones() {
		let skeleton = this.vmdl.getPermModelData('m_modelSkeleton');
		if (skeleton) {
			return skeleton;
		}
		return null;
	}
	/*
	getAttachments() {
		if (this.mdl) {
			return this.mdl.getAttachments();
		}
		return null;
	}

	getBone(boneIndex) {
		if (this.mdl) {
			return this.mdl.getBone(boneIndex);
		}
		return null;
	}

	getAttachementById(attachementIndex) {
		if (this.mdl) {
			return this.mdl.getAttachementById(attachementIndex);
		}
		return null;
	}

	getBoneByName(boneName) {
		if (this.mdl) {
			return this.mdl.getBoneByName(boneName);
		}
		return null;
	}

	getAttachement(attachementName) {
		if (this.mdl) {
			return this.mdl.getAttachement(attachementName);
		}
		return null;
	}

	getBodyPart(bodyPartId) {
		if (this.mdl) {
			return this.mdl.getBodyPart(bodyPartId);
		}
		return null;
	}

	getBodyParts() {
		if (this.mdl) {
			return this.mdl.getBodyParts();
		}
		return null;
	}
*/

	getSkinMaterials(skin) {
		let materialGroups = this.vmdl.getPermModelData('m_materialGroups');
		if (materialGroups) {
			let materials = materialGroups[skin];
			if (materials) {
				return materials.m_materials;
			}
		}
		return null;
	}

	getSkinList() {
		const skinList = [];
		let materialGroups = this.vmdl.getPermModelData('m_materialGroups');
		if (materialGroups) {
			for (let skinIndex = 0; skinIndex < materialGroups.length; skinIndex++) {
				skinList.push(materialGroups[skinIndex].m_name);
			}
		}
		return skinList;
	}

	async loadAnimGroups() {
		if (this.vmdl) {
			var m_refAnimGroups = this.vmdl.getPermModelData('m_refAnimGroups');
			if (m_refAnimGroups) {
				for (var meshIndex = 0; meshIndex < m_refAnimGroups.length; meshIndex++) {
					var meshName = m_refAnimGroups[meshIndex];
					let animGroup = await AnimManager.getAnimGroup(this, this.repository, meshName);
					this.animGroups.add(animGroup);
				}
			}
		}
	}

	#loadInternalAnimGroup() {
		//TODOv3: make a common code where external and internal group are loaded
		if (this.vmdl) {
			let sourceFile = this.vmdl;
			let localAnimArray = sourceFile.getBlockStruct('AGRP.keyValue.root.m_localHAnimArray');
			let decodeKey = sourceFile.getBlockStruct('AGRP.keyValue.root.m_decodeKey');
			if (localAnimArray && decodeKey) {
				let animGroup = new Source2AnimGroup(this, this.repository);
				animGroup.setFile(this.vmdl);
				animGroup.setAnimationGroupResourceData(localAnimArray, decodeKey);
				this.#internalAnimGroup = animGroup;

				let anims = sourceFile.getBlockStruct('ANIM.keyValue.root');
				if (anims) {
					let loadedAnim = new Source2Animation(animGroup, '');
					loadedAnim.setAnimDatas(anims);
					animGroup._changemyname = animGroup._changemyname || [];
					animGroup._changemyname.push(loadedAnim);
				}
				this.animGroups.add(animGroup);
			}
		}
	}

	getIncludeModels() {
		if (!this.vmdl) {
			return [];
		}
		const sourceFile = this.vmdl;
		const refAnimIncludeModels = sourceFile.getBlockStruct('DATA.keyValue.root.m_refAnimIncludeModels');
		return refAnimIncludeModels ?? [];
	}

	addIncludeModel(includeModel) {
		this.#includeModels.push(includeModel);
	}

	getAnim(activityName, activityModifiers) {
		const animations = this.getAnimationsByActivity(activityName);

		for (const model of this.#includeModels) {
			model.getAnimationsByActivity(activityName, animations)
		}

		return animations.getBestAnimation(activityName, activityModifiers);
		let bestMatch = animations.getAnimation(activityName);
		let bestScore = bestMatch ? 0 : -1;
		animations.getAnimation(activityName);
		for (let animDesc of animations.getAnimations()) {

			/*if (animDesc.matchModifiers(activityName, activityModifiers)) {
				return animDesc;
			}*/
			const score = animDesc.matchModifiers(activityName, activityModifiers);
			if (score > bestScore) {
				bestMatch = animDesc;
				bestScore = score;
			}
		}
		return bestMatch;

		// Fallback to no modifier
		/*for (let animDesc of animations) {
			if (animDesc.matchModifiers(activityName)) {
				return animDesc;
			}
		}*/
	}

	getAnimation(name) {
		let animation;
		animation = this.seqGroup?.getAnimDesc(name);
		if (animation) {
			return animation;
		}

		for (const animGroup of this.animGroups) {
			animation = animGroup?.getAnimDesc(name);
			if (animation) {
				return animation;
			}
		}
	}

	getAnimationsByActivity(activityName, animations = new Source2Animations()) {
		let anims = [];
		if (this.seqGroup) {
			anims.push(...this.seqGroup.getAnimationsByActivity(activityName));
		}

		for (let animGroup of this.animGroups) {
			anims.push(...animGroup.getAnimationsByActivity(activityName));
		}

		animations.addAnimations(anims);
		return animations;
	}

	async getAnimations() {
		let animations = new Set<string>();
		for (let animGroup of this.animGroups) {
			if (animGroup.localAnimArray) {
				for (var localAnimIndex = 0; localAnimIndex < animGroup.localAnimArray.length; localAnimIndex++) {
					var animRemoveMe = animGroup.getAnim(localAnimIndex);
					if (animRemoveMe) {
						animRemoveMe.getAnimations(animations);
					}
				}
			}
			if (animGroup._changemyname) {
				for (var animResIndex = 0; animResIndex < animGroup._changemyname.length; animResIndex++) {
					var animRemoveMe = animGroup._changemyname[animResIndex];
					if (animRemoveMe) {
						animRemoveMe.getAnimations(animations);
					}
				}
			}
		}
		return animations;
	}

	_addAttachements(attachements) {
		for (let attachement of attachements) {
			let attachementValue = attachement.value;
			if (attachementValue) {
				let name = attachementValue.m_name.toLowerCase();
				let source2ModelAttachement = new Source2ModelAttachement(name);
				this.attachements.set(name, source2ModelAttachement);
				source2ModelAttachement.ignoreRotation = attachementValue.m_bIgnoreRotation;
				for (let influenceIndex = 0; influenceIndex < attachementValue.m_nInfluences; ++influenceIndex) {
					let influenceName = attachementValue.m_influenceNames[influenceIndex];
					if (influenceName) {
						source2ModelAttachement.influenceNames.push(influenceName.toLowerCase());
						source2ModelAttachement.influenceWeights.push(attachementValue.m_influenceWeights[influenceIndex]);
						source2ModelAttachement.influenceOffsets.push(vec3.clone(attachementValue.m_vInfluenceOffsets[influenceIndex]));
						source2ModelAttachement.influenceRotations.push(vec4.clone(attachementValue.m_vInfluenceRotations[influenceIndex]));
					}
				}
			}
		}
	}

	getAnimationByName(animName) {
		//return this.#internalAnimGroup?.getAnimationByName(animName);
		for (let animGroup of this.animGroups) {
			let anim = animGroup.getAnimationByName(animName);
			if (anim) {
				return anim;
			}
		}
	}
}
