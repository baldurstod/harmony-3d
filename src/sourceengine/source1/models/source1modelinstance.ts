import { mat3, mat4, quat, vec3 } from 'gl-matrix';
import { MAX_STUDIO_FLEX_DESC } from '../loaders/sourcemdl';
import { Source1ModelManager } from '../models/source1modelmanager';
import { AnimationDescription } from '../../../animations/animationdescription';
import { Animations } from '../../../animations/animations';
import { Entity } from '../../../entities/entity';
import { Bone } from '../../../objects/bone';
import { Hitbox } from '../../../misc/hitbox';
import { SkeletalMesh } from '../../../objects/skeletalmesh';
import { Mesh } from '../../../objects/mesh';
import { Skeleton } from '../../../objects/skeleton';
import { MeshBasicMaterial } from '../../../materials/meshbasicmaterial';
import { SourceEngineMaterialManager } from '../materials/sourceenginematerialmanager';
import { SourceAnimation } from '../loaders/sourceanimation';
import { Material } from '../../../materials/material';
import { Interaction } from '../../../utils/interaction';
import { vec3RandomBox } from '../../../math/functions';
import { getRandomInt } from '../../../utils/random';
import { registerEntity } from '../../../entities/entities';
import { Animated } from '../../../entities/animated';
import { SourceModel } from '../loaders/sourcemodel';
import { STUDIO_ANIM_ANIMPOS, STUDIO_ANIM_ANIMROT, STUDIO_ANIM_DELTA, STUDIO_ANIM_RAWPOS, STUDIO_ANIM_RAWROT, STUDIO_ANIM_RAWROT2 } from '../loaders/mdlstudioanim';

let animSpeed = 1.0;

const defaultMaterial = new MeshBasicMaterial();

export class Source1ModelInstance extends Entity implements Animated {
	isSource1ModelInstance = true;
	#poseParameters = {};
	#flexParameters = {};
	#flexesWeight = new Float32Array(MAX_STUDIO_FLEX_DESC);
	#materialOverride;
	#animations = new Animations();
	#skeleton?: Skeleton;
	#skin = 0;
	#attachements = {};
	#materialsUsed = new Set<Material>();
	animable = true;
	hasAnimations: true = true;
	sourceModel: SourceModel;
	bodyParts = {};
	sequences = {};
	meshes = new Set<Mesh | SkeletalMesh>();
	frame = 0;
	anim = new SourceAnimation();//TODO: removeme
	animationSpeed = 1.0;
	isDynamic: boolean;
	#sheen;
	#tint;
	bonesScale;
	static useNewAnimSystem = false;

	static {
		defaultMaterial.addUser(Source1ModelInstance);
	}

	constructor(params?: any) {
		super(params);
		this.sourceModel = params.sourceModel;
		this.name = this.sourceModel.name;
		if (params.isDynamic) {
			this.#createSkeleton();
		}
		this.isDynamic = params.isDynamic;

		if (!params.preventInit) {
			this.#init();
		}
		if (params.isDynamic) {
			this.#initSkeleton();
			this.#initAttachements();
		}
		this.#updateMaterials();
	}

	get skeleton() {
		return this.#skeleton;
	}

	set skeleton(skeleton) {
		this.#skeleton = skeleton;
	}

	#createSkeleton() {
		this.#skeleton = new Skeleton({ name: `Skeleton ${this.name}` });
		return super.addChild(this.#skeleton);
	}

	addChild(child) {
		let ret = super.addChild(child);
		if (child.skeleton) {
			child.skeleton.setParentSkeleton(this.#skeleton);
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
		this.setSkin(skin);
	}

	get skin() {
		return this.#skin;
	}

	async setSkin(skin) {
		this.#skin = skin;
		await this.#updateMaterials();
	}

	set sheen(sheen) {
		this.#sheen = sheen;
		//SHADER_PARAM( SHEENMAPMASKSCALEX, SHADER_PARAM_TYPE_FLOAT, '1', 'X Scale the size of the map mask to the size of the target' )
		//SHADER_PARAM( SHEENMAPMASKSCALEY, SHADER_PARAM_TYPE_FLOAT, '1', 'Y Scale the size of the map mask to the size of the target' )
		//SHADER_PARAM( SHEENMAPMASKOFFSETX, SHADER_PARAM_TYPE_FLOAT, '0', 'X Offset of the mask relative to model space coords of target' )
		//SHADER_PARAM( SHEENMAPMASKOFFSETY, SHADER_PARAM_TYPE_FLOAT, '0', 'Y Offset of the mask relative to model space coords of target' )
		//SHADER_PARAM( SHEENMAPMASKDIRECTION, SHADER_PARAM_TYPE_INTEGER, '0', 'The direction the sheen should move (length direction of weapon) XYZ, 0,1,2' )
		const dimensions = this.sourceModel.mdl.getDimensions(vec3.create());
		const dimensionsMin = this.sourceModel.mdl.getBBoxMin(vec3.create());
		const dimMax = Math.max(dimensions[0], dimensions[1], dimensions[2]);
		const direction = 0;
		let scaleX = 1;
		let scaleY = 1;
		let offsetX = 0;
		let offsetY = 0;
		for (let i = 0; i < 3; ++i) {
			if (dimMax == dimensions[i]) {
				//let direction = i;
				scaleX = dimMax;
				offsetX = dimensionsMin[i];
			}
		}
		this.materialsParams['SheenTintColor'] = vec3.fromValues(sheen[0], sheen[1], sheen[2]);
		this.materialsParams['SheenMaskScaleX'] = scaleX;
		this.materialsParams['SheenMaskScaleY'] = scaleX;//TODOv3: set y scale
		this.materialsParams['SheenMaskOffsetX'] = offsetX;
		this.materialsParams['SheenMaskOffsetY'] = offsetX;//TODOv3: set y offset
		this.materialsParams['SheenMaskDirection'] = direction;

		let min = vec3.create();
		let max = vec3.create();
		this.getBoundsModelSpace(min, max);
		//console.error(min, max);


		scaleX = max[0] - min[0];
		offsetX = min[0];
		scaleY = max[2] - min[2];
		offsetY = min[2];
		let sheenDir = 0;

		if (max[1] - min[1] > scaleX) {
			scaleX = max[1] - min[1];
			offsetX = min[1];

			scaleY = max[0] - min[0];
			offsetY = min[0];

			sheenDir = 2;
		}

		if (max[2] - min[2] > scaleX) {
			scaleX = max[2] - min[2];
			offsetX = min[2];

			scaleY = max[1] - min[1];
			offsetY = min[1];

			sheenDir = 1;
		}
		this.materialsParams['SheenMaskScaleX'] = scaleX;
		this.materialsParams['SheenMaskScaleY'] = scaleY;//TODOv3: set y scale
		this.materialsParams['SheenMaskOffsetX'] = offsetX;
		this.materialsParams['SheenMaskOffsetY'] = offsetY;//TODOv3: set y offset
		this.materialsParams['SheenMaskDirection'] = sheenDir;


	}

	set tint(tint) {
		this.#tint = tint;
		this.materialsParams['ItemTintColor'] = tint;
	}

	setPoseParameter(paramName, paramValue) {
		this.#poseParameters[paramName] = paramValue;
	}

	playAnimation(name: string) {
		this.playSequence(name);
	}

	playSequence(sequenceName: string) { //TODO
		sequenceName = sequenceName.toLowerCase();
		let existingSequence = this.sequences[sequenceName];
		this.sequences = Object.create(null);//TODOv2

		this.sequences[sequenceName] = existingSequence ?? {};
		/*{
			startTime : -1
		}*/
		this.frame = 0;
	}

	async addAnimation(animationName: string, weight = 1) {
		animationName = animationName.toLowerCase();
		if (!this.#animations.setWeight(animationName, weight)) {
			//let animation = new Animation(animationName);
			//this.#fillAnimation(animation);
			this.#animations.add(new AnimationDescription(await this.sourceModel.getAnimation(animationName, this), weight));
		}
	}

	update(scene, camera, delta) {
		if (this.#skeleton && this.isPlaying()) {
			this._playSequences(delta * animSpeed * this.animationSpeed);
			this.#skeleton.setBonesMatrix();
		}
		for (let mesh of this.meshes) {
			if ((mesh as SkeletalMesh).skeleton) {
				(mesh as SkeletalMesh).skeleton.setBonesMatrix();
			}
		}
	}

	_playSequences(delta: number) {//TODO
		if (Source1ModelInstance.useNewAnimSystem) {
			this.frame += delta;
			this.#animate();
			return;
		}

		this.frame += delta;
		const now = new Date().getTime();

		const seqList = Object.keys(this.sequences);
		if (seqList.length === 0) {
			return;
		}
		for (let i = 0; i < seqList.length; ++i) {
			const sequenceName = seqList[i];
			const seqContext = this.sequences[sequenceName];
			let sequence;
			if (seqContext) {
				sequence = seqContext.s;

				if (!sequence) {
					this.sourceModel.mdl.getSequence(sequenceName).then((sequence) => {
						if (sequence) {
							seqContext.s = sequence;
							seqContext.startTime = now;
							if (sequence.autolayer) {
								const autoLayerList = sequence.autolayer;

								for (let autoLayerIndex = 0; autoLayerIndex < autoLayerList.length; ++autoLayerIndex) {
									const autoLayer = autoLayerList[autoLayerIndex];
									//if (autoLayer && (autoLayer.start !== 0 || autoLayer.end !== 0)) {
									//if (autoLayer && (autoLayer.start !== autoLayer.end)) {//TODOV2
									//if (autoLayer) {//TODOV2
									if (false && autoLayer && (autoLayer.start === autoLayer.end)) {//TODOV2
										const autoLayerSequence = sequence.mdl.getSequenceById(autoLayer.iSequence);
										if (autoLayerSequence) {
											const autoLayerSequenceName = autoLayerSequence.name;
											this.sequences[autoLayerSequenceName] = { s: autoLayerSequence, startTime: now }
										}
									}
								}
							}
						}
					});
				}
			}
			if (sequence) {
				sequence.play(this);//TODOv2: play autolayer ?
			}
		}
		this.anim.animate2(this, this.#poseParameters, this.position, this.quaternion, this.sequences, this.bonesScale);
	}

	#animate() {
		const skeleton = this.#skeleton;
		if (!skeleton) {
			return;
		}

		for (const bone of skeleton._bones) {
			vec3.zero(bone.tempPosition);
			quat.identity(bone.tempQuaternion);
		}

		const position = vec3.create();//TODO:optimize
		const quaternion = quat.create();

		for (const [_, animationDescription] of this.#animations) {
			//console.info(animation);
			const animation = animationDescription.animation;
			for (const bone of animation.bones) {
				const skeletonBone = skeleton.getBoneById(bone.id);
				if (!skeletonBone) {
					continue;
				}

				//skeletonBone.poseToBone = bone.refPos;

				const frame = animation.getFrame(this.frame * 30);
				if (frame) {
					const flagData = frame.getData('flags');
					if (!flagData) {
						continue;
					}

					const flag = flagData.datas[bone.id] as number | undefined;
					if (flag === undefined) {
						continue;
					}

					const positionData = frame.getData('position');
					if (positionData) {
						if ((flag & STUDIO_ANIM_DELTA) == STUDIO_ANIM_DELTA) {
							vec3.add(skeletonBone.tempPosition, skeletonBone.tempPosition, positionData.datas[bone.id] as vec3);
						} else {
							vec3.copy(skeletonBone.tempPosition, positionData.datas[bone.id] as vec3);
						}
					}

					const rotationData = frame.getData('rotation');
					if (rotationData) {
						if (flag & STUDIO_ANIM_DELTA) {
							quat.mul(skeletonBone.tempQuaternion, skeletonBone.tempQuaternion, rotationData.datas[bone.id] as quat);
						} else {
							quat.copy(skeletonBone.tempQuaternion, rotationData.datas[bone.id] as quat);
						}
					}
				}
			}


			/*
			let b = dynamicPropBones[boneIndex];
			if (b) {
				if (!b.locked) {
					b.quaternion = quatRemoveMeMe ?? b._initialQuaternion;
					b.position = posRemoveMeMe ?? b._initialPosition;
				}
			} else {
				b = new MdlBone(dynamicProp.skeleton);
				dynamicProp.skeleton._bones[boneIndex] = b;
				b.boneId = bone.boneId;
				b.name = bone.name;
				b.quaternion = bone.quaternion;
				b.position = bone.position;
				b.parentBone = bone.parentBone;
				b.parent = dynamicProp.skeleton._bones[b.parentBone];
				b.poseToBone = bone.poseToBone;
				b.initPoseToBone = bone.initPoseToBone;
			}*/
		}

		for (const bone of skeleton._bones) {
			if (!bone.locked) {
				bone.position = bone.tempPosition;
				bone.quaternion = bone.tempQuaternion;
			}
		}
	}

	async setMaterialOverride(materialOverride) {
		this.#materialOverride = materialOverride;
		await this.#updateMaterials();
	}

	async #updateMaterials() {
		for (let mesh of this.meshes) {
			let material: Material;
			let materialName;
			if (!material) {
				materialName = this.sourceModel.mdl.getMaterialName(this.#skin, mesh.properties.get('materialId'));
				material = await SourceEngineMaterialManager.getMaterial(this.sourceModel.repository, materialName, this.sourceModel.mdl.getTextureDir());
			}
			if (this.#materialOverride) {
				material = this.#materialOverride;
			}
			if (material) {
				this.#materialsUsed.add(material);
				material.addUser(this);
				mesh.setMaterial(material);
				mesh.properties.set('materialName', materialName);
				material.properties.set('materialType', mesh.properties.get('materialType'));//TODOv3 : setup a better material param
				material.properties.set('materialParam', mesh.properties.get('materialParam'));//TODOv3 : setup a better material param
				material.properties.set('eyeballArray', mesh.properties.get('eyeballArray'));//TODOv3 : setup a better material param
				material.properties.set('skeleton', (mesh as SkeletalMesh).skeleton);//TODOv3 : setup a better material param
			}
		}
	}

	#init() {
		let sourceModel = this.sourceModel;
		for (let [bodyPartName, bodyPart] of sourceModel.bodyParts) {
			//let newBodyPart = [];
			//let defaul = undefined;//TODOv3: change variable name;
			let group = new Entity({ name: bodyPartName });
			this.addChild(group);
			group.serializable = false;
			for (let modelId in bodyPart) {
				let model = bodyPart[modelId];
				if (model) {
					let group2 = new Entity();
					group2.properties.set('modelId', modelId);
					group2.name = `${bodyPartName} ${modelId}`;
					if (Number(modelId) != 0) {
						group2.visible = false;
					}
					group.addChild(group2);
					let newModel = [];
					for (let modelMesh of model) {
						let geometry = modelMesh.geometry;
						let mesh: Mesh | SkeletalMesh;
						if (this.#skeleton) {
							mesh = new SkeletalMesh(geometry.clone(), defaultMaterial, this.#skeleton);
						} else {
							mesh = new Mesh(geometry, defaultMaterial);
						}
						mesh.name = geometry.properties.get('name');
						mesh.properties.set('sourceModelMesh', modelMesh.mesh);
						if (geometry.hasAttribute('aVertexTangent')) {
							mesh.setDefine('USE_VERTEX_TANGENT');
						}
						//mesh.visible = defaul;
						mesh.properties.set('materialId', geometry.properties.get('materialId'));
						mesh.properties.set('materialType', geometry.properties.get('materialType'));
						mesh.properties.set('materialParam', geometry.properties.get('materialParam'));
						mesh.properties.set('eyeballArray', geometry.properties.get('eyeballArray'));
						mesh.materialsParams = this.materialsParams;
						newModel.push(mesh);
						//this.addChild(mesh);
						this.meshes.add(mesh);
						group2.addChild(mesh);
					}
					//newBodyPart.push(newModel);
				}
				//defaul = false;
			}
			//this.bodyParts[bodyPartName] = newBodyPart;
			this.bodyParts[bodyPartName] = group;
		}
	}

	#initSkeleton() {
		let bones = this.sourceModel.getBones();
		if (bones) {
			for (let bone of bones) {
				let skeletonBone = this.#skeleton.addBone(bone.boneId, bone.name);
				skeletonBone._initialQuaternion = quat.copy(quat.create(), bone.quaternion);
				skeletonBone._initialPosition = vec3.copy(vec3.create(), bone.position);
				let parentBoneId = bone.parentBone;

				skeletonBone.poseToBone = bone.poseToBone;

				if (parentBoneId >= 0) {
					let parentBone = this.#skeleton._bones[parentBoneId];
					parentBone.addChild(skeletonBone);
					//skeletonBone.parent = this.#skeleton._bones[parentBone];
					if (!skeletonBone.parent) {
						console.error('parent not found : ' + bone.name);
					}
				} else {
					this.#skeleton.addChild(skeletonBone);
				}
			}
		}
	}

	#initAttachements() {
		let attachements = this.sourceModel.getAttachments();
		let localMat3 = mat3.create();//todo: optimize
		if (attachements) {
			for (let attachement of attachements) {
				let attachementBone = new Bone({ name: attachement.name });
				localMat3[0] = attachement.local[0];
				localMat3[3] = attachement.local[1];
				localMat3[6] = attachement.local[2];
				localMat3[1] = attachement.local[4];
				localMat3[4] = attachement.local[5];
				localMat3[7] = attachement.local[6];
				localMat3[2] = attachement.local[8];
				localMat3[5] = attachement.local[9];
				localMat3[8] = attachement.local[10];

				vec3.set(attachementBone._position, attachement.local[3], attachement.local[7], attachement.local[11]);
				quat.fromMat3(attachementBone._quaternion, localMat3);

				let bone = this.#skeleton.getBoneById(attachement.localbone);
				bone.addChild(attachementBone);
				this.#attachements[attachement.lowcasename] = attachementBone;
			}
		}
	}

	getBoneById(boneId) {
		return this.#skeleton ? this.#skeleton.getBoneById(boneId) : null;
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

	renderBodyParts(render) {
		for (let bodyPartName in this.bodyParts) {
			this.renderBodyPart(bodyPartName, render);
			/*let bodyPart = this.bodyParts[bodyPartName];
			if (bodyPart) {
				for (let model of bodyPart) {
					for (let model of bodyPart) {
						model.visible = render ? undefined : false;
					}
				}
			}*/
		}
	}

	renderBodyPart(bodyPartName, render) {
		let bodyPart = this.bodyParts[bodyPartName];
		if (bodyPart) {
			bodyPart.visible = render ? undefined : false;
			/*for (let model of bodyPart) {
				for (let mesh of model) {
					mesh.visible = render ? undefined : false;
				}
			}*/
		}
	}

	resetBodyPartModels() {
		for (let bodyPartName in this.bodyParts) {
			this.setBodyPartModel(bodyPartName, 0);
		}
	}

	setBodyPartIdModel(bodyPartId, modelId) {
		const bodypart = this.sourceModel.getBodyPart(bodyPartId);
		if (bodypart) {
			this.setBodyPartModel(bodypart.name, modelId);
		}
	}

	setBodyPartModel(bodyPartName, modelId) {
		let bodyPart = this.bodyParts[bodyPartName];
		if (bodyPart) {
			//let id = 0;
			for (let bodyPartModel of bodyPart.children) {
				//let bodyPartModel = bodyPart.children.get(id);
				bodyPartModel.visible = (bodyPartModel.properties.get('modelId') == modelId) ? undefined : false;
				//++id;
			}
		}
		//this.sourceModel.setBodyPartModel(bodyPartName, modelId);
		//this.bodyGroups[bodyPartName] = this.bodyGroups[bodyPartName] || {render : true, modelId : 0};
		//this.bodyGroups[bodyPartName].modelId = modelId;
	}

	toString() {
		return 'Source1ModelInstance ' + super.toString();
	}

	attachSystem(system, attachementName = '', cpIndex = 0, offset?: vec3) {
		this.addChild(system);

		let attachement = this.getAttachement(attachementName);
		if (attachement) {
			let controlPoint = system.getControlPoint(cpIndex);
			attachement.addChild(controlPoint);
		} else {
			this.attachSystemToBone(system, attachementName, offset);
		}

		if (offset) {
			system.getControlPoint(0).position = offset;
		}
	}

	attachSystemToBone(system, boneName, offset) {
		if (!this.#skeleton) {
			return;
		}

		this.addChild(system);
		let controlPoint = system.getControlPoint(0);

		let bone = this.#skeleton.getBoneByName(boneName);
		if (bone) {
			bone.addChild(controlPoint);
		} else {
			this.addChild(controlPoint);
		}
	}

	getAttachement(attachementName) {
		return this.#attachements[attachementName.toLowerCase()];
	}

	getBoneByName(boneName) {
		if (!this.#skeleton) {
			return;
		}
		return this.#skeleton.getBoneByName(boneName);
	}

	set material(material) {
		for (let bodyPartName in this.bodyParts) {
			let bodyPart = this.bodyParts[bodyPartName];
			let meshes = bodyPart.getChildList('Mesh');
			for (let mesh of meshes) {
				mesh.setMaterial(material);
			}
		}
		let subModels = this.getChildList('Source1ModelInstance');
		for (let subModel of subModels) {
			if (subModel !== this) {
				(subModel as Source1ModelInstance).material = material;
			}
		}
	}

	buildContextMenu() {
		//console.error();
		let skins = this.sourceModel.mdl.getSkinList();
		let skinMenu = [];
		for (let skin of skins) {
			let item = Object.create(null);
			item.name = skin;
			item.f = () => this.skin = skin;
			skinMenu.push(item);
		}

		return Object.assign(super.buildContextMenu(), {
			Source1ModelInstance_1: null,
			skin: { i18n: '#skin', submenu: skinMenu },
			tint: { i18n: '#tint', f: async (entity) => new Interaction().getColor(0, 0, undefined, (tint) => { entity.tint = tint; }, (tint = entity.tint) => { entity.tint = tint; }) },
			reset_tint: { i18n: '#reset_tint', f: (entity) => entity.tint = undefined, disabled: this.#tint === undefined },
			animation: { i18n: '#animation', f: async (entity) => { let animation = await new Interaction().getString(0, 0, await entity.sourceModel.mdl.getAnimList()); if (animation) { entity.playSequence(animation); } } },
			overrideallmaterials: { i18n: '#overrideallmaterials', f: async (entity) => { let material = await new Interaction().getString(0, 0, Object.keys(Material.materialList)); if (material) { entity.material = new Material.materialList[material]; } } },
			Source1ModelInstance_2: null,
			animate: { i18n: '#animate', selected: this.animationSpeed != 0.0, f: () => this.animationSpeed == 0 ? this.animationSpeed = 1 : this.animationSpeed = 0 },
			frame: { i18n: '#frame', f: () => { let frame = prompt('Frame', String(this.frame)); if (frame) { this.animationSpeed = 0; this.frame = Number(frame); } } },
			Source1ModelInstance_3: null,
			copy_filename: { i18n: '#copy_filename', f: () => navigator.clipboard.writeText(this?.sourceModel?.fileName) },
		});
	}

	getParentModel() {
		return this;
	}

	getRandomPointOnModel(vec, initialVec, bones) {
		let hitboxes = this.getHitboxes();
		let hitbox = hitboxes[getRandomInt(hitboxes.length)];
		let bone = hitbox.parent//this.getBoneById(hitbox.boneId);
		if (bone) {
			bones.push([bone, 1]);
			vec3RandomBox(vec, hitbox.boundingBoxMin, hitbox.boundingBoxMax);
			//vec3.transformMat4(vec, vec, bone.boneMat);
			vec3.copy(initialVec, vec);
			vec3.transformMat4(vec, vec, mat4.fromRotationTranslationScale(mat4.create(), bone.worldQuat, bone.worldPos, bone.worldScale));
		}
		return vec;
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

	set quaternion(quaternion) {
		super.quaternion = quaternion;
		if (this.#skeleton) {
			this.#skeleton.dirty();
		}
	}

	get quaternion() {
		return quat.clone(this._quaternion);
	}

	static set animSpeed(speed) {
		let s = Number(speed);
		animSpeed = Number.isNaN(s) ? 1 : s;
	}

	setFlexes(flexes = {}) {
		this.#flexParameters = flexes;
		this.#refreshFlexes();
	}

	resetFlexParameters() {
		this.#flexParameters = {};
		this.#refreshFlexes();
	}

	#refreshFlexes() {
		this.sourceModel.mdl.runFlexesRules(this.#flexParameters, this.#flexesWeight);

		for (let mesh of this.meshes) {
			if (mesh && mesh.geometry) {
				let attribute = mesh.geometry.getAttribute('aVertexPosition');
				let newAttribute = attribute.clone();
				mesh.geometry.setAttribute('aVertexPosition', newAttribute);
				const sourceModelMesh = mesh.properties.get('sourceModelMesh');
				this.#updateArray(newAttribute._array, sourceModelMesh.flexes, sourceModelMesh.vertexoffset);
			}
		}
	}

	#updateArray(vertexPositionArray, flexes, vertexoffset) {
		let flexesWeight = this.#flexesWeight;
		if (flexes && flexes.length) {
			for (let flexIndex = 0; flexIndex < flexes.length; ++flexIndex) {
				const flex = flexes[flexIndex];


				//const g_flexdescweight = this.mdl.g_flexdescweight;
				const w1 = flexesWeight[flex.flexdesc];
				let w3 = w1;
				if (flex.flexpair) {
					w3 = flexesWeight[flex.flexpair];
				}
				if (w1) {
					const vertAnims = flex.vertAnims;

					//let good = 0;
					//let bad = 0;
					for (let vertAnimsIndex = 0; vertAnimsIndex < vertAnims.length; ++vertAnimsIndex) {
						const vertAnim = vertAnims[vertAnimsIndex];

						const b = vertAnim.side / 255.0;
						//console.error(b);
						const w = w1 * (1.0 - b) + b * w3;

						const flDelta = vertAnim.flDelta;
						const flNDelta = vertAnim.flNDelta;
						//const vertexIndex = vertAnim.index * 3;
						//const vertexIndexArray = this.verticesPositionToto[vertAnim.index];

						let vertexIndex = (vertexoffset + vertAnim.index) * 3;

						vertexPositionArray[vertexIndex + 0] += flDelta[0] * w;
						vertexPositionArray[vertexIndex + 1] += flDelta[1] * w;
						vertexPositionArray[vertexIndex + 2] += flDelta[2] * w;

						//vertexPositionArray[vertexIndex + 0] += 0;
						//vertexPositionArray[vertexIndex + 1] += 0;
						//vertexPositionArray[vertexIndex + 2] += 0;
						/*
						if (vertexIndexArray) {
							for (let vertexIndexArrayIndex = 0; vertexIndexArrayIndex < vertexIndexArray.length; ++vertexIndexArrayIndex) {
								let vertexIndex = vertexIndexArray[vertexIndexArrayIndex];
								vertexPositionArray[vertexIndex + 0] += flDelta[0] * w;
								vertexPositionArray[vertexIndex + 1] += flDelta[1] * w;
								vertexPositionArray[vertexIndex + 2] += flDelta[2] * w;

								/*normalArray[vertexIndex + 0] += flNDelta[0] * w;
								normalArray[vertexIndex + 1] += flNDelta[1] * w;
								normalArray[vertexIndex + 2] += flNDelta[2] * w;* /
								++good;
							}
						} else {
							++bad;
						}*/
					}
				}
			}
		}
	}

	async playDefaultAnim() {
		let animList = await this.sourceModel.mdl.getAnimList();
		if (animList && animList.size > 0) {
			this.playSequence(animList.keys().next().value);
		}
	}

	getHitboxes() {
		let mdlHitboxSets = this.sourceModel.mdl.hitboxSets;
		let hitboxes = [];
		if (mdlHitboxSets) {
			for (let mdlHitboxSet of mdlHitboxSets) {
				let mdlHitboxes = mdlHitboxSet.hitboxes;
				for (let mdlHitbox of mdlHitboxes) {
					hitboxes.push(new Hitbox(mdlHitbox.name, mdlHitbox.bbmin, mdlHitbox.bbmax, this.getBoneById(mdlHitbox.boneId)));
				}
			}
		}
		return hitboxes;
	}

	replaceMaterial(material, recursive = true) {
		super.replaceMaterial(material, recursive);
		for (let mesh of this.meshes) {
			mesh.material = material;
		}
	}

	resetMaterial(recursive = true) {
		super.resetMaterial(recursive);
		this.#updateMaterials();
	}

	getAnimations() {
		return this.sourceModel.mdl.getAnimList();
	}

	toJSON() {
		let json = super.toJSON();
		json.skin = this.skin;
		json.repository = this.sourceModel.repository;
		json.filename = this.sourceModel.fileName;
		json.dynamic = this.isDynamic;
		if (this.#skeleton) {
			json.skeletonid = this.#skeleton.id;
		}
		return json;
	}

	static async constructFromJSON(json, entities, loadedPromise): Promise<Entity> {
		let entity = await Source1ModelManager.createInstance(json.repository, json.filename, false/*dynamic*/, true);
		loadedPromise.then(() => {
			if (json.dynamic) {
				if (json.skeletonid) {
					entity.skeleton = entities.get(json.skeletonid);
				}
				if (!entity.skeleton) {
					entity.#createSkeleton();
					entity.#initSkeleton();
					entity.#initAttachements();
				}
				entity.isDynamic = true;
			}
			entity.#init();
			entity.#updateMaterials();
			if (entity._parent) {
				entity._parent.addChild(entity);
			}
		});
		return entity;
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.skin = json.skin ?? 0;
		//TODO
	}

	dispose() {
		super.dispose();
		this.#skeleton.dispose();
		for (const material of this.#materialsUsed) {
			material.removeUser(this);
		}
		for (const mesh of this.meshes) {
			mesh.dispose();
		}
	}

	static getEntityName() {
		return 'Source1Model';
	}

	is(s) {
		if (s == 'Source1ModelInstance') {
			return true;
		} else {
			return super.is(s);
		}
	}
}
registerEntity(Source1ModelInstance);
