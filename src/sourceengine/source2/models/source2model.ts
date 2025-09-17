import { quat, vec3 } from 'gl-matrix';
import { BufferGeometry } from '../../../geometry/buffergeometry';
import { Kv3Element } from '../../common/keyvalue/kv3element';
import { Source2Animations } from '../animations/source2animations';
import { Source2SeqGroup } from '../animations/source2seqgroup';
import { Source2File } from '../loaders/source2file';
import { AnimManager } from './animmanager';
import { Source2Animation } from './source2animation';
import { Source2AnimationDesc } from './source2animationdesc';
import { Source2AnimGroup } from './source2animgroup';
import { Source2ModelAttachment } from './source2modelattachment';
import { SOURCE2_DEFAULT_BODY_GROUP, Source2ModelInstance } from './source2modelinstance';

const _SOURCE_MODEL_DEBUG_ = false; // removeme

export interface BodyGroupChoice {
	choice: string,
	bodyGroup: string,
	bodyGroupId: number,
}

export type BodyPart = BodyPartMesh[];
export type BodyPartMesh = BufferGeometry[];

export class Source2Model {
	#internalAnimGroup?: Source2AnimGroup;
	#includeModels: Source2Model[] = [];
	repository: string;
	vmdl: Source2File;
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

	constructor(repository: string, vmdl: Source2File) {
		this.repository = repository;
		this.vmdl = vmdl;

		this.#loadInternalAnimGroup();
		this.#createAnimGroup();
		this.#createBodyGroups();
	}

	#createAnimGroup() {
		const aseq = this.vmdl.getBlockByType('ASEQ');
		if (aseq && this.#internalAnimGroup) {
			this.#seqGroup = new Source2SeqGroup(this.#internalAnimGroup);
			this.#seqGroup.setFile(this.vmdl);
		}
	}

	#createBodyGroups(): void {
		const meshGroups = this.vmdl.getBlockStructAsArray('DATA', 'm_meshGroups') as string[];
		if (meshGroups) {

			let bodyGroupId = 0;
			let bodyGroup: string | undefined;
			for (const choice of meshGroups) {
				if (choice == SOURCE2_DEFAULT_BODY_GROUP) {
					bodyGroup = choice;
				} else {
					const result = /(.*)_@\d(_#&(.*))?$/.exec(choice);
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

	matchActivity(activity: string, modifiers: string[]) {
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

	createInstance(isDynamic: boolean): Source2ModelInstance {
		return new Source2ModelInstance(this, isDynamic);
	}

	getBones(): Kv3Element | null {
		const skeleton = this.vmdl.getBlockStructAsElement('DATA', 'm_modelSkeleton');//this.vmdl.getPermModelData('m_modelSkeleton');
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

	getSkinMaterials(skin: number): string[] | null {
		const materialGroups = this.vmdl.getBlockStructAsElementArray('DATA', 'm_materialGroups');
		if (materialGroups) {
			const materials = materialGroups[skin];
			if (materials) {
				return materials.getValueAsResourceArray('m_materials');
			}
		}
		return null;
	}

	getSkinList(): string[] {
		const skinList: string[] = [];
		const materialGroups = this.vmdl.getBlockStructAsElementArray('DATA', 'm_materialGroups');
		if (materialGroups) {
			for (const materialGroup of materialGroups) {
				const skin = materialGroup.getSubValueAsString('m_name');
				if (skin !== null) {
					skinList.push(skin);
				}
			}
		}
		return skinList;
	}

	async loadAnimGroups() {
		if (this.vmdl) {
			const m_refAnimGroups = this.vmdl.getBlockStructAsArray('DATA', 'm_refAnimGroups');
			if (m_refAnimGroups) {
				for (const meshName of m_refAnimGroups) {
					// TODO: not tested: find a test case
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
			const localAnimArray = sourceFile.getBlockStructAsResourceArray('AGRP', 'm_localHAnimArray');
			const decodeKey = sourceFile.getBlockStruct('AGRP', 'm_decodeKey');
			if (localAnimArray && (decodeKey as Kv3Element | undefined)?.isKv3Element) {
				const animGroup = new Source2AnimGroup(this, this.repository);
				animGroup.setFile(this.vmdl);
				animGroup.setAnimationGroupResourceData(localAnimArray, decodeKey as Kv3Element);
				this.#internalAnimGroup = animGroup;

				const anims = sourceFile.getBlockKeyValues('ANIM');
				if (anims) {
					const loadedAnim = new Source2Animation(animGroup);
					loadedAnim.setAnimDatas(anims);
					animGroup._changemyname = animGroup._changemyname || [];
					animGroup._changemyname.push(loadedAnim);
				}
				this.animGroups.add(animGroup);
			}
		}
	}

	getIncludeModels(): any[] {
		/*
		if (!this.vmdl) {
			return [];
		}
			*/
		return this.vmdl.getBlockStructAsArray('DATA', 'm_refAnimIncludeModels') ?? [];
		//return refAnimIncludeModels ?? [];
	}

	addIncludeModel(includeModel: Source2Model) {
		this.#includeModels.push(includeModel);
	}

	getAnim(activityName: string, activityModifiers: Set<string>) {
		const animations = this.getAnimationsByActivity(activityName);

		for (const model of this.#includeModels) {
			model.getAnimationsByActivity(activityName, animations)
		}

		return animations.getBestAnimation(activityName, activityModifiers);
		/*
		let bestMatch = animations.getAnimation(activityName);
		let bestScore = bestMatch ? 0 : -1;
		animations.getAnimation(activityName);
		for (const animDesc of animations.getAnimations()) {

			/*if (animDesc.matchModifiers(activityName, activityModifiers)) {
				return animDesc;
			}* /
			const score = animDesc.matchModifiers(activityName, activityModifiers);
			if (score > bestScore) {
				bestMatch = animDesc;
				bestScore = score;
			}
		}
		return bestMatch;
		*/

		// Fallback to no modifier
		/*for (let animDesc of animations) {
			if (animDesc.matchModifiers(activityName)) {
				return animDesc;
			}
		}*/
	}

	getAnimation(name: string): Source2AnimationDesc | null {
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
		return null;
	}

	getAnimationsByActivity(activityName: string, animations = new Source2Animations()) {
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

	_addAttachments(attachments: Kv3Element[]) {
		for (const attachment of attachments) {
			//throw 'fix attachments type';
			const attachmentValue = attachment.getValueAsElement('value');//TODO: use property 'key'
			if (attachmentValue) {
				const name = attachmentValue.getValueAsString('m_name')?.toLowerCase();
				if (!name) {
					continue;
				}
				const source2ModelAttachment = new Source2ModelAttachment(name);
				this.attachments.set(name, source2ModelAttachment);
				source2ModelAttachment.ignoreRotation = attachmentValue.getValueAsBool('m_bIgnoreRotation') ?? false/*TODO: check default value*/;

				const influencesCount = attachmentValue.getValueAsNumber('m_nInfluences');
				if (influencesCount) {
					const influenceNames = attachmentValue.getValueAsStringArray('m_influenceNames');
					const influenceWeights = attachmentValue.getValueAsNumberArray('m_influenceWeights');
					const influenceOffsets = attachmentValue.getValueAsVectorArray('m_vInfluenceOffsets');
					const influenceRotations = attachmentValue.getValueAsVectorArray('m_vInfluenceRotations');

					if (influenceNames && influenceWeights && influenceOffsets && influenceRotations) {
						for (let influenceIndex = 0; influenceIndex < influencesCount; ++influenceIndex) {
							const influenceName = influenceNames[influenceIndex];
							const influenceWeight = influenceWeights[influenceIndex];
							const influenceOffset = influenceOffsets[influenceIndex];
							const influenceRotation = influenceRotations[influenceIndex];
							if (influenceName) {
								source2ModelAttachment.influenceNames.push(influenceName.toLowerCase());
								source2ModelAttachment.influenceWeights.push(influenceWeight!);
								source2ModelAttachment.influenceOffsets.push(vec3.clone(influenceOffset as vec3));
								source2ModelAttachment.influenceRotations.push(quat.clone(influenceRotation as quat));
							}
						}
					}
				}
			}
		}
	}

	getAnimationByName(animName: string) {
		//return this.#internalAnimGroup?.getAnimationByName(animName);
		for (const animGroup of this.animGroups) {
			const anim = animGroup.getAnimationByName(animName);
			if (anim) {
				return anim;
			}
		}
	}
}
