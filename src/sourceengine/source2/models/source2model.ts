import { vec3, vec4 } from 'gl-matrix';
import { BufferGeometry } from '../../../geometry/buffergeometry';
import { Source2Animations } from '../animations/source2animations';
import { Source2SeqGroup } from '../animations/source2seqgroup';
import { AnimManager } from './animmanager';
import { Source2Animation } from './source2animation';
import { Source2AnimationDesc } from './source2animationdesc';
import { Source2AnimGroup } from './source2animgroup';
import { Source2ModelAttachment } from './source2modelattachment';
import { Source2ModelInstance } from './source2modelinstance';

const _SOURCE_MODEL_DEBUG_ = false; // removeme

export interface BodyGroupChoice {
	choice: string,
	bodyGroup: string,
	bodyGroupId: number,
}

export type BodyPart = BodyPartMesh[];
export type BodyPartMesh = BufferGeometry[];

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
	geometries = new Set<BufferGeometry>();
	bodyParts = new Map<string, BodyPart>();
	attachments = new Map<string, Source2ModelAttachment>();
	#seqGroup?: Source2SeqGroup;
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
		const aseq = this.vmdl.getBlockByType('ASEQ');
		if (aseq) {
			this.#seqGroup = new Source2SeqGroup(this.#internalAnimGroup);
			this.#seqGroup.setFile(this.vmdl);
		}
	}

	#createBodyGroups() {
		const meshGroups = this.vmdl.getPermModelData('m_meshGroups') as string[];
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
		if (this.#seqGroup) {
			return this.#seqGroup.matchActivity(activity, modifiers);
		}
		return null;
	}

	addGeometry(geometry: BufferGeometry, bodyPartName: string, bodyPartModelId: number) {
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

	getBones() {
		const skeleton = this.vmdl.getPermModelData('m_modelSkeleton');
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

	getAttachmentById(attachmentIndex) {
		if (this.mdl) {
			return this.mdl.getAttachmentById(attachmentIndex);
		}
		return null;
	}

	getBoneByName(boneName) {
		if (this.mdl) {
			return this.mdl.getBoneByName(boneName);
		}
		return null;
	}

	getAttachment(attachmentName) {
		if (this.mdl) {
			return this.mdl.getAttachment(attachmentName);
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
		const materialGroups = this.vmdl.getPermModelData('m_materialGroups');
		if (materialGroups) {
			const materials = materialGroups[skin];
			if (materials) {
				return materials.m_materials;
			}
		}
		return null;
	}

	getSkinList() {
		const skinList = [];
		const materialGroups = this.vmdl.getPermModelData('m_materialGroups');
		if (materialGroups) {
			for (let skinIndex = 0; skinIndex < materialGroups.length; skinIndex++) {
				skinList.push(materialGroups[skinIndex].m_name);
			}
		}
		return skinList;
	}

	async loadAnimGroups() {
		if (this.vmdl) {
			const m_refAnimGroups = this.vmdl.getPermModelData('m_refAnimGroups');
			if (m_refAnimGroups) {
				for (let meshIndex = 0; meshIndex < m_refAnimGroups.length; meshIndex++) {
					const meshName = m_refAnimGroups[meshIndex];
					const animGroup = await AnimManager.getAnimGroup(this, this.repository, meshName);
					this.animGroups.add(animGroup);
				}
			}
		}
	}

	#loadInternalAnimGroup() {
		//TODOv3: make a common code where external and internal group are loaded
		if (this.vmdl) {
			const sourceFile = this.vmdl;
			const localAnimArray = sourceFile.getBlockStruct('AGRP.keyValue.root.m_localHAnimArray');
			const decodeKey = sourceFile.getBlockStruct('AGRP.keyValue.root.m_decodeKey');
			if (localAnimArray && decodeKey) {
				const animGroup = new Source2AnimGroup(this, this.repository);
				animGroup.setFile(this.vmdl);
				animGroup.setAnimationGroupResourceData(localAnimArray, decodeKey);
				this.#internalAnimGroup = animGroup;

				const anims = sourceFile.getBlockStruct('ANIM.keyValue.root');
				if (anims) {
					const loadedAnim = new Source2Animation(animGroup, '');
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
		for (const animDesc of animations.getAnimations()) {

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

	getAnimation(name: string): Source2AnimationDesc | undefined {
		let animation: Source2AnimationDesc | undefined;
		animation = this.#seqGroup?.getAnimDesc(name);
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
		const anims = [];
		if (this.#seqGroup) {
			anims.push(...this.#seqGroup.getAnimationsByActivity(activityName));
		}

		for (const animGroup of this.animGroups) {
			anims.push(...animGroup.getAnimationsByActivity(activityName));
		}

		animations.addAnimations(anims);
		return animations;
	}

	async getAnimations() {
		const animations = new Set<string>();
		for (const animGroup of this.animGroups) {
			if (animGroup.localAnimArray) {
				for (let localAnimIndex = 0; localAnimIndex < animGroup.localAnimArray.length; localAnimIndex++) {
					const animRemoveMe = await animGroup.getAnim(localAnimIndex);
					if (animRemoveMe) {
						animRemoveMe.getAnimations(animations);
					}
				}
			}
			if (animGroup._changemyname) {
				for (let animResIndex = 0; animResIndex < animGroup._changemyname.length; animResIndex++) {
					const animRemoveMe = animGroup._changemyname[animResIndex];
					if (animRemoveMe) {
						animRemoveMe.getAnimations(animations);
					}
				}
			}
		}
		return animations;
	}

	_addAttachments(attachments) {
		for (const attachment of attachments) {
			const attachmentValue = attachment.value;
			if (attachmentValue) {
				const name = attachmentValue.m_name.toLowerCase();
				const source2ModelAttachment = new Source2ModelAttachment(name);
				this.attachments.set(name, source2ModelAttachment);
				source2ModelAttachment.ignoreRotation = attachmentValue.m_bIgnoreRotation;
				for (let influenceIndex = 0; influenceIndex < attachmentValue.m_nInfluences; ++influenceIndex) {
					const influenceName = attachmentValue.m_influenceNames[influenceIndex];
					if (influenceName) {
						source2ModelAttachment.influenceNames.push(influenceName.toLowerCase());
						source2ModelAttachment.influenceWeights.push(attachmentValue.m_influenceWeights[influenceIndex]);
						source2ModelAttachment.influenceOffsets.push(vec3.clone(attachmentValue.m_vInfluenceOffsets[influenceIndex]));
						source2ModelAttachment.influenceRotations.push(vec4.clone(attachmentValue.m_vInfluenceRotations[influenceIndex]));
					}
				}
			}
		}
	}

	getAnimationByName(animName) {
		//return this.#internalAnimGroup?.getAnimationByName(animName);
		for (const animGroup of this.animGroups) {
			const anim = animGroup.getAnimationByName(animName);
			if (anim) {
				return anim;
			}
		}
	}
}
