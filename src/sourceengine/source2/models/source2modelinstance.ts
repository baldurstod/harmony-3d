import { mat4, quat, vec3 } from 'gl-matrix';
import { HarmonyMenuItemsDict } from 'harmony-ui';
import { Camera } from '../../../cameras/camera';
import { Entity } from '../../../entities/entity';
import { Animated } from '../../../interfaces/animated';
import { HasMaterials } from '../../../interfaces/hasmaterials';
import { HasSkeleton } from '../../../interfaces/hasskeleton';
import { RandomPointOnModel } from '../../../interfaces/randompointonmodel';
import { Material } from '../../../materials/material';
import { MeshBasicMaterial } from '../../../materials/meshbasicmaterial';
import { Bone } from '../../../objects/bone';
import { Group } from '../../../objects/group';
import { Mesh } from '../../../objects/mesh';
import { SkeletalMesh } from '../../../objects/skeletalmesh';
import { Skeleton } from '../../../objects/skeleton';
import { Scene } from '../../../scenes/scene';
import { Interaction } from '../../../utils/interaction';
import { Source2MaterialManager } from '../materials/source2materialmanager';
import { Source2AnimationDesc } from './source2animationdesc';
import { Source2Model } from './source2model';
import { Source2ModelAttachmentInstance } from './source2modelattachment';


export const SOURCE2_DEFAULT_BODY_GROUP = 'autodefault';

const identityVec3 = vec3.create();
const identityQuat = quat.create();

const initSkeletonTempVec3 = vec3.create();
const initSkeletonTempQuat = quat.create();

let animSpeed = 1.0;

const defaultMaterial = new MeshBasicMaterial();

export class Source2ModelInstance extends Entity implements Animated, HasMaterials, HasSkeleton, RandomPointOnModel {
	isSource2ModelInstance = true;
	#skeleton: Skeleton | null = null;
	#skin = 0;
	#materialsUsed = new Set<Material>();
	#animName?: string;
	animable = true;
	#lod = 1n;
	bodyParts: Record<string, Mesh[][]> = {};
	poseParameters: Record<string, number> = {};
	meshes = new Set<Mesh>();
	attachments = new Map<string, Source2ModelAttachmentInstance>();
	activity = '';
	activityModifiers = new Set<string>();
	sequences = {};
	mainAnimFrame = 0;
	animationSpeed = 1.0;
	sourceModel: Source2Model;
	hasAnimations = true as const;
	#bodyGroups = new Map<string, number | undefined>();

	static {
		defaultMaterial.addUser(Source2ModelInstance);
	}

	constructor(sourceModel: Source2Model, isDynamic: boolean) {
		super();
		this.sourceModel = sourceModel;
		this.name = sourceModel?.vmdl?.getDisplayName();
		if (isDynamic) {
			this.#skeleton = new Skeleton({ name: `Skeleton ${this.name}` });
			this.addChild(this.#skeleton);
		}


		if (isDynamic) {
			this.#initSkeleton();
			this.#initAttachments();
		}
		this.#init();
		this.#updateMaterials();
	}

	#initDefaultBodyGroups(): void {
		this.#bodyGroups.set(SOURCE2_DEFAULT_BODY_GROUP, undefined);

		for (const bodyGroup of this.sourceModel.bodyGroups) {
			this.#bodyGroups.set(bodyGroup, 0);
		}
		this.#refreshMeshesVisibility();
	}

	setBodyGroup(name: string, choice: number): void {
		if (this.sourceModel.bodyGroups.has(name)) {
			this.#bodyGroups.set(name, choice);
		}
		this.#refreshMeshesVisibility();
	}

	resetBodyGroups(): void {
		this.#bodyGroups.clear();
		this.#refreshMeshesVisibility();
	}

	#refreshMeshesVisibility(): void {
		let mask = 0n;

		for (const bodyGroupsChoice of this.sourceModel.bodyGroupsChoices) {
			const choice = this.#bodyGroups.get(bodyGroupsChoice.bodyGroup);
			if (bodyGroupsChoice.bodyGroup == SOURCE2_DEFAULT_BODY_GROUP || (choice === undefined) || (bodyGroupsChoice.choice.startsWith(`${bodyGroupsChoice.bodyGroup}_@${choice}`))) {
				mask += BigInt(Math.pow(2, bodyGroupsChoice.bodyGroupId));
			}
		}

		if (mask == 0n) {
			mask = 0xFFFFFFFFFFFFFFFFn;
		}

		for (const mesh of this.meshes) {
			const geometry = mesh.getGeometry();
			mesh.setVisible(undefined);
			if (geometry) {
				const meshGroupMask = geometry.properties.getBigint('mesh_group_mask') ?? 0xFFFFFFFFFFFFFFFFn;
				const lodGroupMask = BigInt(geometry.properties.getBigint('lodGroupMask') ?? geometry.properties.getNumber('lodGroupMask') ?? 0);
				mesh.setVisible((meshGroupMask & mask) > 0 ? undefined : false);

				if (lodGroupMask && ((lodGroupMask & this.#lod) == 0n)) {
					mesh.setVisible(false);
				}
			}
		}
	}

	get skeleton(): Skeleton | null {
		return this.#skeleton;
	}

	override setPosition(position: vec3): void {
		super.setPosition(position);
		if (this.#skeleton) {
			this.#skeleton.dirty();
		}
	}

	override addChild(child?: Entity | null): Entity | null {
		if (!child) {
			return null;
		}
		const ret = super.addChild(child);
		const skeleton = (child as Source2ModelInstance).skeleton;
		if (skeleton) {
			skeleton.setParentSkeleton(this.#skeleton);
		}
		/*if (child instanceof Source2ModelInstance) {
			for (let mesh of child.meshes) {
				if (mesh.skeleton) {
					mesh.skeleton.setParentSkeleton(this.#skeleton);
				}
			}
		}*/
		if ((this.#skeleton != child) && child instanceof Skeleton) {
			child.setParentSkeleton(this.#skeleton);
		}
		return ret;
	}

	override removeChild(child: Entity): void {
		super.removeChild(child);
		const skeleton = (child as Source2ModelInstance).skeleton;
		if (skeleton) {
			skeleton.setParentSkeleton(null);
		}
	}

	set skin(skin) {// TODO: deprecate
		this.#skin = skin;
		this.#updateMaterials();
	}

	get skin(): number {
		return this.#skin;
	}

	setSkin(skin: string): Promise<void> {
		this.#skin = Number(skin);
		this.#updateMaterials();
		return Promise.resolve();
	}

	setLOD(lod: number): void {
		this.#lod = BigInt(lod);
		this.#refreshMeshesVisibility();
		this.forEach((child) => {
			if (child != this && (child as Source2ModelInstance).setLOD) {
				(child as Source2ModelInstance).setLOD(lod);
			}
		});
	}

	setPoseParameter(paramName: string, paramValue: number): void {
		this.poseParameters[paramName] = paramValue;
	}

	playSequence(activity: string, activityModifiers: string[] = []): void {
		this.activity = activity;
		this.setActivityModifiers(activityModifiers);
	}

	playAnimation(name: string): void {
		this.#animName = name;
	}

	setAnimation(id: number, name: string/*, weight: number*/): void {
		this.#animName = name;
	}

	setActivityModifiers(activityModifiers: string[] = []): void {
		this.activityModifiers.clear();
		for (const modifier of activityModifiers) {
			if (modifier) {
				this.activityModifiers.add(modifier);
			}
		}
	}

	update(scene: Scene, camera: Camera, delta: number): void {
		if (this.#skeleton && this.isPlaying()) {
			this.#playSequences(delta * animSpeed * this.animationSpeed);
			this.#skeleton.setBonesMatrix();
		}
		for (const mesh of this.meshes) {
			(mesh as SkeletalMesh).skeleton?.setBonesMatrix();
		}
	}

	#playSequences(delta: number): void {
		if (this.#skeleton === null) {
			return;
		}

		let animDesc: Source2AnimationDesc | null;
		if (this.#animName) {
			animDesc = this.sourceModel.getAnimation(this.#animName);
		} else {
			animDesc = this.sourceModel.getAnim(this.activity, this.activityModifiers);
		}

		if (animDesc) {
			const posArray = animDesc.getFrame(Math.floor(this.mainAnimFrame % (animDesc.lastFrame + 1)));
			this.mainAnimFrame += delta * animDesc.fps;

			for (const pos of posArray) {
				const boneName = pos.name.toLowerCase();

				const propBone = this.#skeleton.getBoneByName(boneName);
				if (propBone) {
					if (!propBone.lockPosition) {
						propBone.setPosition(pos.Position || identityVec3);
					}
					if (!propBone.lockRotation) {
						propBone.setQuaternion(pos.Angle || identityQuat);
					}
				}
			}
		} else {
			for (const bone of this.#skeleton.bones) {
				if (!bone.lockPosition) {
					bone.setPosition(bone.refPosition);
				}
				if (!bone.lockRotation) {
					bone.setQuaternion(bone.refQuaternion);
				}
			}
		}
	}

	#updateMaterials(): void {//TODO: turn to async, remove then
		//console.error(this);
		const materials0 = this.sourceModel.getSkinMaterials(0);
		const materials = this.sourceModel.getSkinMaterials(this.#skin);
		/*if (!materials) {
			return;
		}*/
		//console.error(materials, this);
		for (const mesh of this.meshes) {
			if (materials0 && materials) {
				for (let i = 0; i < materials0.length; i++) {
					if (materials0[i] == mesh.getGeometry()?.properties.getString('materialPath')) {
						const materialPath = materials[i];
						if (materialPath) {
							mesh.properties.setString('materialPath', materialPath);
						}
						break;
					}
				}
				/*let materialPath = materials[mesh.geometry.materialId];
				if (materialPath) {
					mesh.materialPath = materialPath;
				}*/
			} else {
				const materialPath = mesh.getGeometry()?.properties.getString('materialPath');
				if (materialPath) {
					mesh.properties.setString('materialPath', materialPath);
				}
			}

			const materialPath = mesh.properties.getString('materialPath');
			if (materialPath) {
				Source2MaterialManager.getMaterial(this.sourceModel.repository, materialPath).then(
					material => {
						if (material) {
							material.addUser(this);
							mesh.setMaterial(material);
							this.#materialsUsed.add(material);
						}
					}
				);
			}
		}
	}

	getSkins(): Promise<Set<string>> {
		const skins = this.sourceModel.getSkinList();
		if (skins.length == 0) {
			skins.push('default');
		}
		return Promise.resolve(new Set(skins));
	}

	getMaterialsName(skin: string): Promise<[string, Set<string>]> {
		const materials = this.sourceModel.getSkinMaterials(Number(skin));

		const s = new Set<string>();

		if (materials) {
			for (const material of materials) {
				s.add(material.replace(/\.vmat_c$/, '').replace(/\.vmat$/, '') + '.vmat_c');
			}
		} else {
			// No material groups
			for (const mesh of this.meshes) {
				const material = mesh.getGeometry()?.properties.getString('materialPath');
				if (material) {
					s.add(material);
				}
			}
		}

		return Promise.resolve([this.sourceModel.repository, s]);
	}

	#init(): void {
		const sourceModel = this.sourceModel;
		for (const [bodyPartName, bodyPart] of sourceModel.bodyParts) {
			const newBodyPart = [];
			for (const model of bodyPart) {
				if (model) {
					const newModel = [];
					for (const geometry of model) {
						let mesh: Mesh;
						if (this.#skeleton) {
							mesh = new SkeletalMesh({ geometry: geometry, material: defaultMaterial, skeleton: this.#skeleton });
							mesh.name = bodyPartName;
							(mesh as SkeletalMesh).bonesPerVertex = 4;
						} else {
							mesh = new Mesh({ geometry: geometry, material: defaultMaterial });
						}
						if (geometry.hasAttribute('aVertexTangent')) {
							mesh.setDefine('USE_VERTEX_TANGENT');
						}
						mesh.setVisible(undefined);
						const materialPath = geometry.properties.getString('materialPath');
						if (materialPath) {
							mesh.properties.setString('materialPath', materialPath);
						}
						newModel.push(mesh);
						this.addChild(mesh);
						this.meshes.add(mesh);
						mesh.setGeometry(geometry);
					}
					newBodyPart.push(newModel);
				}
			}
			this.bodyParts[bodyPartName] = newBodyPart;
		}
		this.#refreshMeshesVisibility();
		this.#initDefaultBodyGroups();
	}

	#initSkeleton(): void {
		const bones = this.sourceModel.getBones();
		if (bones) {
			const bonesName = bones.getValueAsStringArray('m_boneName');
			const bonePosParent = bones.getValueAsVectorArray('m_bonePosParent');
			const boneRotParent = bones.getValueAsVectorArray('m_boneRotParent');
			const boneParent = bones.getValueAsBigintArray('m_nParent') ?? bones.getValueAsNumberArray('m_nParent');
			if (bonesName && bonePosParent && boneRotParent && boneParent && this.#skeleton) {
				for (const [modelBoneIndex, boneName] of bonesName.entries()) {
					const bone = this.#skeleton.addBone(modelBoneIndex, boneName);
					//bone.name = boneName;
					bone.setQuaternion(boneRotParent[modelBoneIndex] as quat);
					bone.setPosition(bonePosParent[modelBoneIndex] as vec3);
					bone.refQuaternion = boneRotParent[modelBoneIndex] as quat;
					bone.refPosition = bonePosParent[modelBoneIndex] as vec3;
					//const poseToBone = mat4.fromRotationTranslation(mat4.create(), bone.refQuaternion, bone.refPosition);//TODO: optimize
					//mat4.invert(poseToBone, poseToBone);

					const parentIndex = Number(boneParent[modelBoneIndex]);
					const parentName = bonesName[parentIndex];
					if (parentName) {
						//bone.parent = this.#skeleton.getBoneByName(bonesName[parent]);
						const parentBone = this.#skeleton.getBoneByName(parentName);
						if (parentBone) {
							parentBone.addChild(bone);

							bone.getTotalRefQuaternion(initSkeletonTempQuat);
							quat.normalize(initSkeletonTempQuat, initSkeletonTempQuat);

							const poseToBone = mat4.fromRotationTranslation(mat4.create(), initSkeletonTempQuat, bone.getTotalRefPosition(initSkeletonTempVec3));
							mat4.invert(poseToBone, poseToBone);
							bone.poseToBone = poseToBone;
						}
					} else {
						this.#skeleton.addChild(bone);
						const poseToBone = mat4.fromRotationTranslation(mat4.create(), bone.refQuaternion, bone.refPosition);//TODO: optimize
						mat4.invert(poseToBone, poseToBone);
						bone.poseToBone = poseToBone;
					}
				}
			} else {
				console.error('source2 #initSkeleton check code');
			}
		}
	}

	#initAttachments(): void {
		const attachments = new Group({ name: 'Attachments' });
		this.addChild(attachments);
		for (const attachment of this.sourceModel.attachments.values()) {
			const attachmentInstance = new Source2ModelAttachmentInstance(this, attachment);
			this.attachments.set(attachment.name, attachmentInstance);
			attachments.addChild(attachmentInstance);
		}
	}

	getAnimations(): Promise<Set<string>> {
		return Promise.resolve(this.sourceModel.getAnimations());
	}

	buildContextMenu(): HarmonyMenuItemsDict {
		const skins = this.sourceModel.getSkinList();
		const skinMenu = [];
		for (const [skinId, skin] of skins.entries()) {
			const item: any = {};
			item.name = skin;
			item.f = (): number => this.skin = skinId;
			skinMenu.push(item);
		}
		return Object.assign(super.buildContextMenu(), {
			Source2ModelInstance_1: null,
			skin: { i18n: '#skin', submenu: skinMenu },
			animation: { i18n: '#animation', f: async (entity: Source2ModelInstance) => { const animation = await new Interaction().getString(0, 0, await entity.sourceModel.getAnimations()); if (animation) { entity.playAnimation(animation); } } },
			Source2ModelInstance_2: null,
			animate: { i18n: '#animate', selected: this.animationSpeed != 0.0, f: () => this.animationSpeed == 0 ? this.animationSpeed = 1 : this.animationSpeed = 0 },
			frame: { i18n: '#frame', f: () => { const frame = prompt('Frame', String(this.mainAnimFrame)); if (frame) { this.animationSpeed = 0; this.mainAnimFrame = Number(frame); } } },
		});
	}

	getParentModel(): Source2ModelInstance {
		return this;
	}

	getRandomPointOnModel(vec: vec3, initialVec: vec3, bones: [Bone, number][]): vec3 {
		const meshes = this.meshes;
		for (const mesh of meshes) {
			(mesh as SkeletalMesh).getRandomPointOnModel(vec, initialVec, bones);
			return vec;
		}
		return vec;
	}

	getAttachment(name: string): Source2ModelAttachmentInstance | null {
		return this.attachments.get(name.toLowerCase()) ?? null;
	}

	static set animSpeed(speed: number) {
		const s = Number(speed);
		animSpeed = Number.isNaN(s) ? 1 : s;
	}

	dispose(): void {
		super.dispose();
		this.#skeleton?.dispose();
		for (const material of this.#materialsUsed) {
			material.removeUser(this);
		}
		for (const mesh of this.meshes) {
			mesh.dispose();
		}
	}

	static getEntityName(): string {
		return 'Source 2 model';
	}
}
