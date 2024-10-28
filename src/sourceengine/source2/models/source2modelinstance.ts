import { mat4, quat, vec3 } from 'gl-matrix';

import { Source2ModelAttachementInstance } from './source2modelattachement';
import { Entity } from '../../../entities/entity';
import { Group } from '../../../objects/group';
import { SkeletalMesh } from '../../../objects/skeletalmesh';
import { Mesh } from '../../../objects/mesh';
import { Skeleton } from '../../../objects/skeleton';
import { MeshBasicMaterial } from '../../../materials/meshbasicmaterial';
import { Source2MaterialManager } from '../materials/source2materialmanager';
import { SourceAnimation } from '../../source1/loaders/sourceanimation';
import { Interaction } from '../../../utils/interaction';
import { Source2Model } from './source2model';
import { Material } from '../../../materials/material';


const identityVec3 = vec3.create();
const identityQuat = quat.create();

const initSkeletonTempVec3 = vec3.create();
const initSkeletonTempQuat = quat.create();

let animSpeed = 1.0;

const defaultMaterial = new MeshBasicMaterial();

export class Source2ModelInstance extends Entity {
	isSource2ModelInstance = true;
	#skeleton;
	#skin = 0;
	#materialsUsed = new Set<Material>();
	#animName;
	animable = true;
	lod = 1;
	bodyParts = {};
	poseParameters = {};
	meshes = new Set<Mesh>();
	attachements = new Map();
	anim = new SourceAnimation();//TODO: removeme
	activity = '';
	activityModifiers = new Set();
	sequences = {};
	mainAnimFrame = 0;
	animationSpeed = 1.0;
	sourceModel: Source2Model;

	static {
		defaultMaterial.addUser(Source2ModelInstance);
	}

	constructor(sourceModel, isDynamic) {
		super();
		this.sourceModel = sourceModel;
		this.name = sourceModel?.vmdl?.displayName;
		if (isDynamic) {
			this.#skeleton = new Skeleton({ name: `Skeleton ${this.name}` });
			this.addChild(this.#skeleton);
		}


		if (isDynamic) {
			this.#initSkeleton();
			this.#initAttachements();
		}
		this.#init();
		this.#updateMaterials();
	}

	get skeleton() {
		return this.#skeleton;
	}

	set position(position) {
		super.position = position;
		if (this.#skeleton) {
			this.#skeleton.dirty();
		}
	}

	get position() {
		return vec3.clone(this._position);
	}

	addChild(child) {
		if (!child) {
			return;
		}
		let ret = super.addChild(child);
		if (child.skeleton) {
			child.skeleton.setParentSkeleton(this.#skeleton);
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

	removeChild(child) {
		super.removeChild(child);
		if (child.skeleton) {
			child.skeleton.setParentSkeleton(null);
		}
	}

	set skin(skin) {
		this.#skin = skin;
		this.#updateMaterials();
	}

	get skin() {
		return this.#skin;
	}

	setLOD(lod) {
		this.lod = lod;
		this.setMeshesLOD(lod);
		this.forEach((child) => {
			if (child != this && (child as Source2ModelInstance).setLOD) {
				(child as Source2ModelInstance).setLOD(lod);
			}
		});
	}

	setMeshesLOD(lod) {
		for (let mesh of this.meshes) {
			let geometry = mesh.geometry;
			if (geometry && geometry.properties.get('lodGroupMask') !== undefined) {
				if (geometry.properties.get('lodGroupMask') & lod) {
					mesh.visible = undefined;
				} else {
					mesh.visible = false;
				}
			}
		}
	}

	setPoseParameter(paramName, paramValue) {
		this.poseParameters[paramName] = paramValue;
	}

	playSequence(activity, activityModifiers = []) { //TODO
		this.activityModifiers.clear();
		this.activity = activity;
		for (let modifier of activityModifiers) {
			this.activityModifiers.add(modifier);
		}
	}


	playAnimation(name) {
		this.#animName = name;
	}

	setActivityModifiers(activityModifiers = []) {
		this.activityModifiers.clear();
		for (let modifier of activityModifiers) {
			if (modifier) {
				this.activityModifiers.add(modifier);
			}
		}
	}

	update(scene, camera, delta) {
		if (this.#skeleton && this.isPlaying()) {
			this.#playSequences(delta * animSpeed * this.animationSpeed);
			this.#skeleton.setBonesMatrix();
		}
		for (let mesh of this.meshes) {
			(mesh as SkeletalMesh).skeleton?.setBonesMatrix();
		}
	}

	#playSequences(delta) {//TODO
		if (this.#skeleton === null) {
			return null;
		}

		let animDesc;
		if (this.#animName) {
			animDesc = this.sourceModel.getAnimation(this.#animName);
		} else {
			animDesc = this.sourceModel.getAnim(this.activity, this.activityModifiers);
		}

		if (animDesc) {
			const posArray = animDesc.getFrame(Math.floor(this.mainAnimFrame % (animDesc.lastFrame + 1)));
			this.mainAnimFrame += delta * animDesc.fps;

			for (let i = 0; i < posArray.length; ++i) {
				var pos = posArray[i];
				let boneName = pos.name.toLowerCase();

				let propBone = this.#skeleton.getBoneByName(boneName);
				if (propBone) {
					if (!propBone.locked) {
						propBone.quaternion = pos.Angle || identityQuat;
						propBone.position = pos.Position || identityVec3;
					}
				}
			}
		} else {
			for (let bone of this.#skeleton.bones) {
				if (!bone.locked) {
					bone.quaternion = bone.refQuaternion;
					bone.position = bone.refPosition;
				}
			}
		}
	}

	#updateMaterials() {
		//console.error(this);
		let materials0 = this.sourceModel.getSkinMaterials(0);
		let materials = this.sourceModel.getSkinMaterials(this.#skin);
		/*if (!materials) {
			return;
		}*/
		//console.error(materials, this);
		for (let mesh of this.meshes) {
			if (materials0 && materials) {
				for (let i in materials0) {
					if (materials0[i] == mesh.geometry.properties.get('materialPath')) {
						let materialPath = materials[i];
						if (materialPath) {
							mesh.properties.set('materialPath', materialPath);
						}
						break;
					}
				}
				/*let materialPath = materials[mesh.geometry.materialId];
				if (materialPath) {
					mesh.materialPath = materialPath;
				}*/
			} else {
				mesh.properties.set('materialPath', mesh.geometry.properties.get('materialPath'));
			}
			Source2MaterialManager.getMaterial(this.sourceModel.repository, mesh.properties.get('materialPath')).then(
				(material) => {
					material.addUser(this);
					mesh.setMaterial(material);
					this.#materialsUsed.add(material);
				}
			);
		}
	}

	#init() {
		let sourceModel = this.sourceModel;
		for (let [bodyPartName, bodyPart] of sourceModel.bodyParts) {
			let newBodyPart = [];
			for (let model of bodyPart) {
				if (model) {
					let newModel = [];
					for (let geometry of model) {
						let mesh: Mesh;
						if (this.#skeleton) {
							mesh = new SkeletalMesh(geometry, defaultMaterial, this.#skeleton);
							mesh.name = bodyPartName;
							(mesh as SkeletalMesh).bonesPerVertex = 4;
						} else {
							mesh = new Mesh(geometry, defaultMaterial);
						}
						if (geometry.hasAttribute('aVertexTangent')) {
							mesh.setDefine('USE_VERTEX_TANGENT');
						}
						mesh.visible = undefined;
						mesh.properties.set('materialPath', geometry.properties.get('materialPath'));
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
		this.setMeshesLOD(this.lod);
	}

	#initSkeleton() {
		let bones = this.sourceModel.getBones();
		if (bones) {
			let bonesName = bones.m_boneName;
			let bonePosParent = bones.m_bonePosParent;
			let boneRotParent = bones.m_boneRotParent;
			let boneParent = bones.m_nParent;
			if (bonesName && bonePosParent && boneRotParent && boneParent) {
				for (let modelBoneIndex = 0, m = bonesName.length; modelBoneIndex < m; ++modelBoneIndex) {
					let boneName = bonesName[modelBoneIndex];
					let bone = this.#skeleton.addBone(modelBoneIndex, boneName);
					//bone.name = boneName;
					bone.quaternion = boneRotParent[modelBoneIndex];
					bone.position = bonePosParent[modelBoneIndex];
					bone.refQuaternion = boneRotParent[modelBoneIndex];
					bone.refPosition = bonePosParent[modelBoneIndex];
					//const poseToBone = mat4.fromRotationTranslation(mat4.create(), bone.refQuaternion, bone.refPosition);//TODO: optimize
					//mat4.invert(poseToBone, poseToBone);

					let parent = Number(boneParent[modelBoneIndex]);
					if (parent >= 0) {
						//bone.parent = this.#skeleton.getBoneByName(bonesName[parent]);
						let parentBone = this.#skeleton.getBoneByName(bonesName[parent]);
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
			}
		}
	}

	#initAttachements() {
		let attachements = new Group({ name: 'Attachements' });
		this.addChild(attachements);
		for (let attachement of this.sourceModel.attachements.values()) {
			let attachementInstance = new Source2ModelAttachementInstance(this, attachement);
			this.attachements.set(attachement.name, attachementInstance);
			attachements.addChild(attachementInstance);
		}

	}

	setBodyGroup(bodyPartName, bodyPartModelId) {
		let bodyPart = this.bodyParts[bodyPartName];
		if (bodyPart) {
			for (let index = 0, l = bodyPart.length; index < l; index++) {
				let meshes = bodyPart[index];
				let visible = false;
				if (index === bodyPartModelId) {
					visible = true;
				}
				for (let mesh of meshes) {
					mesh.visible = visible;
				}
			}
		}
	}

	buildContextMenu() {
		let skins = this.sourceModel.getSkinList();
		let skinMenu = [];
		for (let skin of skins) {
			let item: any = {};
			item.name = skin;
			item.f = () => this.skin = skin;
			skinMenu.push(item);
		}
		return Object.assign(super.buildContextMenu(), {
			Source2ModelInstance_1: null,
			skin: { i18n: '#skin', submenu: skinMenu },
			animation: { i18n: '#animation', f: async (entity) => { let animation = await Interaction.getString(await entity.sourceModel.getAnimations()); if (animation) { entity.playAnimation(animation); } } },
			Source2ModelInstance_2: null,
			animate: { i18n: '#animate', selected: this.animationSpeed != 0.0, f: () => this.animationSpeed == 0 ? this.animationSpeed = 1 : this.animationSpeed = 0 },
			frame: { i18n: '#frame', f: () => { let frame = prompt('Frame', String(this.mainAnimFrame)); if (frame) { this.animationSpeed = 0; this.mainAnimFrame = Number(frame); } } },
		});
	}

	getParentModel() {
		return this;
	}

	getRandomPointOnModel(vec, initialVec, bones) {
		let meshes = this.meshes;
		for (let mesh of meshes) {
			(mesh as SkeletalMesh).getRandomPointOnModel(vec, initialVec, bones);
			return vec;
		}
		return vec;
	}

	getAttachement(name) {
		return this.attachements.get(name.toLowerCase());
	}

	static set animSpeed(speed) {
		let s = Number(speed);
		animSpeed = Number.isNaN(s) ? 1 : s;
	}

	dispose() {
		super.dispose();
		this.#skeleton?.dispose();
		for (const material of this.#materialsUsed) {
			material.removeUser(this);
		}
		for (const mesh of this.meshes) {
			mesh.dispose();
		}
	}

	static getEntityName() {
		return 'Source 2 model';
	}
}
