import { mat3, mat4, quat, vec3, vec4 } from 'gl-matrix';
import { JSONObject } from 'harmony-types';
import { AnimationDescription } from '../../../animations/animationdescription';
import { Animations } from '../../../animations/animations';
import { Camera } from '../../../cameras/camera';
import { registerEntity } from '../../../entities/entities';
import { Entity } from '../../../entities/entity';
import { Animated } from '../../../interfaces/animated';
import { HasHitBoxes } from '../../../interfaces/hashitboxes';
import { HasMaterials } from '../../../interfaces/hasmaterials';
import { HasSkeleton } from '../../../interfaces/hasskeleton';
import { RandomPointOnModel } from '../../../interfaces/randompointonmodel';
import { Material } from '../../../materials/material';
import { MeshBasicMaterial } from '../../../materials/meshbasicmaterial';
import { vec3RandomBox } from '../../../math/functions';
import { Hitbox } from '../../../misc/hitbox';
import { Bone } from '../../../objects/bone';
import { Mesh } from '../../../objects/mesh';
import { SkeletalMesh } from '../../../objects/skeletalmesh';
import { Skeleton } from '../../../objects/skeleton';
import { Scene } from '../../../scenes/scene';
import { Interaction } from '../../../utils/interaction';
import { getRandomInt } from '../../../utils/random';
import { STUDIO_ANIM_DELTA } from '../loaders/mdlstudioanim';
import { MdlStudioSeqDesc } from '../loaders/mdlstudioseqdesc';
import { MdlStudioFlex, MeshTest } from '../loaders/source1mdlloader';
import { SourceAnimation } from '../loaders/sourceanimation';
import { MAX_STUDIO_FLEX_DESC } from '../loaders/sourcemdl';
import { SourceModel } from '../loaders/sourcemodel';
import { Source1Material } from '../materials/source1material';
import { Source1MaterialManager } from '../materials/source1materialmanager';
import { Source1ModelManager } from '../models/source1modelmanager';
import { Source1ParticleSystem } from '../particles/source1particlesystem';

const defaultMaterial = new MeshBasicMaterial();

export type Source1ModelSequences = Record<string, { frame?: number, startTime?: number, s?: MdlStudioSeqDesc }>/*TODO: improve type*/;
export type Source1ModelAnimation = { name: string, weight: number }/*TODO: improve type*/;

export class Source1ModelInstance extends Entity implements Animated, HasMaterials, HasHitBoxes, HasSkeleton, RandomPointOnModel {
	isSource1ModelInstance = true;
	readonly #poseParameters = new Map<string, number>();
	readonly #flexParameters = new Map<string, number>();
	#flexesWeight = new Float32Array(MAX_STUDIO_FLEX_DESC);
	#materialOverride: Material | null = null;
	#animations = new Animations();
	#skeleton: Skeleton | null = null;
	#skin = 0;
	#attachments: Record<string, Bone> = {};
	#materialsUsed = new Set<Material>();
	animable = true;
	hasAnimations: true = true;
	sourceModel: SourceModel;
	bodyParts: Record<string, Entity> = {};//TODO: create map
	sequences: Source1ModelSequences = {};
	#meshes = new Set<Mesh | SkeletalMesh>();
	frame = 0;
	anim = new SourceAnimation();//TODO: removeme
	animationSpeed = 1.0;
	isDynamic: boolean;
	#sheen?: vec3;
	#tint: vec4 | null = null;
	static useNewAnimSystem = false;
	useNewAnimSystem = false;
	#animationList: Source1ModelAnimation[] = [];
	#bodyGroups = new Map<string, number>();
	readonly frameframe: { bones: Record<string, any> } = { bones: {} };
	static #animSpeed = 1.0;

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
			this.#initAttachments();
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

	addChild(child?: Entity | null) {
		if (!child) {
			return null;
		}
		const ret = super.addChild(child);
		(child as unknown as HasSkeleton).skeleton?.setParentSkeleton(this.#skeleton ?? null);
		return ret;
	}

	removeChild(child: Entity) {
		super.removeChild(child);
		(child as unknown as HasSkeleton).skeleton?.setParentSkeleton(null);
	}

	set skin(skin: string) {// TODO: deprecate
		this.setSkin(skin);
	}

	get skin() {
		return String(this.#skin);
	}

	async setSkin(skin: string) {
		this.#skin = Number(skin);
		await this.#updateMaterials();
	}

	set sheen(sheen: vec3) {
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
				offsetX = dimensionsMin[i]!;
			}
		}
		this.materialsParams['SheenTintColor'] = vec3.fromValues(sheen[0], sheen[1], sheen[2]);
		this.materialsParams['SheenMaskScaleX'] = scaleX;
		this.materialsParams['SheenMaskScaleY'] = scaleX;//TODOv3: set y scale
		this.materialsParams['SheenMaskOffsetX'] = offsetX;
		this.materialsParams['SheenMaskOffsetY'] = offsetX;//TODOv3: set y offset
		this.materialsParams['SheenMaskDirection'] = direction;

		const min = vec3.create();
		const max = vec3.create();
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

	setTint(tint: vec4 | null): void {
		this.#tint = tint ? vec4.clone(tint as vec4) : null;
		this.materialsParams['ItemTintColor'] = tint;
	}

	getTint(out = vec4.create(),): vec4 | null {
		if (this.#tint) {
			out = vec4.copy(out, this.#tint);
			return out;
		}
		return null;
	}

	setPoseParameter(paramName: string, paramValue: number) {
		this.#poseParameters.set(paramName, paramValue);
	}

	playAnimation(name: string) {
		this.playSequence(name);
	}

	async setAnimation(id: number, name: string, weight: number) {
		//TODO: merge with addAnimation
		this.#animationList[id] = { name: name, weight: weight };

		this.#animations.clear();

		for (const [index, anim] of this.#animationList.entries()) {
			if (anim) {
				await this.addAnimation(index, anim.name, anim.weight);
			}
		}
	}

	playSequence(sequenceName: string) { //TODO
		sequenceName = sequenceName.toLowerCase();
		const existingSequence = this.sequences[sequenceName];
		this.sequences = Object.create(null);//TODOv2

		this.sequences[sequenceName] = existingSequence ?? {};
		/*{
			startTime : -1
		}*/
		this.frame = 0;
	}

	async addAnimation(id: number, animationName: string, weight = 1) {
		//TODO: merge with setAnimation
		animationName = animationName.toLowerCase();
		if (!this.#animations.setWeight(id, weight)) {
			//let animation = new Animation(animationName);
			//this.#fillAnimation(animation);
			this.#animations.set(id, new AnimationDescription(await this.sourceModel.getAnimation(animationName, this), weight));
		}
	}

	update(scene: Scene, camera: Camera, delta: number) {
		if (this.#skeleton && this.isPlaying()) {
			this.#playSequences(delta * Source1ModelInstance.#animSpeed * this.animationSpeed);
			this.#skeleton.setBonesMatrix();
		}
		for (const mesh of this.#meshes) {
			if ((mesh as SkeletalMesh).skeleton) {
				(mesh as SkeletalMesh).skeleton.setBonesMatrix();
			}
		}
	}

	async updateAsync(scene: Scene, camera: Camera, delta: number): Promise<void> {
		if (this.#skeleton && this.isPlaying()) {
			await this.#playSequences(delta * Source1ModelInstance.#animSpeed * this.animationSpeed);
			this.#skeleton.setBonesMatrix();
		}
		for (const mesh of this.#meshes) {
			if ((mesh as SkeletalMesh).skeleton) {
				(mesh as SkeletalMesh).skeleton.setBonesMatrix();
			}
		}
	}

	async #playSequences(delta: number): Promise<void> {//TODO
		if (Source1ModelInstance.useNewAnimSystem || this.useNewAnimSystem) {
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
		for (const sequenceName of seqList) {
			const seqContext = this.sequences[sequenceName];
			let sequence;
			if (seqContext) {
				sequence = seqContext.s;

				if (!sequence) {
					const sequence = await this.sourceModel.mdl.getSequence(sequenceName);
					if (sequence) {
						seqContext.s = sequence;
						seqContext.startTime = now;
						if (sequence.autolayer) {
							const autoLayerList = sequence.autolayer;

							for (let autoLayerIndex = 0; autoLayerIndex < autoLayerList.length; ++autoLayerIndex) {
								const autoLayer = autoLayerList[autoLayerIndex];
							}
						}
					}

					/*
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
									/*
									if (false && autoLayer && (autoLayer.start === autoLayer.end)) {//TODOV2
										const autoLayerSequence = sequence.mdl.getSequenceById(autoLayer.iSequence);
										if (autoLayerSequence) {
											const autoLayerSequenceName = autoLayerSequence.name;
											this.sequences[autoLayerSequenceName] = { s: autoLayerSequence, startTime: now }
										}
									}
									* /
								}
							}
						}
					});
					*/
				}
			}
			if (sequence) {
				sequence.play(this);//TODOv2: play autolayer ?
			}
		}
		this.anim.animate2(this, this.#poseParameters, this.position, this.quaternion, this.sequences);
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
			if (!animationDescription) {
				continue;
			}
			//console.info(animation);
			const animation = animationDescription.animation;
			if (!animation) {
				continue;
			}
			/*
			if (!animation.once) {
				animation.once = true;
				const frame = animation.getFrame(10);
				const rotationData = frame.getData('rotation');

				var arr = []
				for (const data of rotationData.datas as Array<quat>) {
					let s = '';
					for (let i = 0; i < 4; i++) {
						s += data[i].toFixed(2) + ' ';
					}
					arr.push(s);
				}
				console.info(arr);

			}
	*/

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
						vec3.copy(skeletonBone.tempPosition, bone.refPosition);
						quat.copy(skeletonBone.tempQuaternion, bone.refQuaternion);
						continue;
					}

					const positionData = frame.getData('position');
					if (positionData && positionData.datas[bone.id]) {
						if (flag & STUDIO_ANIM_DELTA) {
							vec3.add(skeletonBone.tempPosition, skeletonBone.tempPosition, positionData.datas[bone.id] as vec3);
						} else {
							vec3.copy(skeletonBone.tempPosition, positionData.datas[bone.id] as vec3);
						}
					}

					const rotationData = frame.getData('rotation');
					if (rotationData && rotationData.datas[bone.id]) {
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
			if (!bone.lockPosition) {
				bone.position = bone.tempPosition;
			}
			if (!bone.lockRotation) {
				bone.quaternion = bone.tempQuaternion;
			}
		}
	}

	async setMaterialOverride(materialOverride: Material | null) {
		this.#materialOverride = materialOverride;
		await this.#updateMaterials();
	}

	async #updateMaterials() {
		for (const mesh of this.#meshes) {
			let material: Material | null;
			let materialName;
			materialName = this.sourceModel.mdl.getMaterialName(this.#skin, mesh.properties.getNumber('materialId') ?? 0);
			material = await Source1MaterialManager.getMaterial(this.sourceModel.repository, materialName, this.sourceModel.mdl.getTextureDir());
			if (this.#materialOverride) {
				material = this.#materialOverride;
			}
			if (material) {
				this.#materialsUsed.add(material);
				material.addUser(this);
				mesh.setMaterial(material);
				mesh.properties.setString('materialName', materialName);
				material.properties.set('materialType', mesh.properties.getNumber('materialType'));//TODOv3 : setup a better material param
				material.properties.set('materialParam', mesh.properties.getNumber('materialParam'));//TODOv3 : setup a better material param
				material.properties.set('eyeballArray', mesh.properties.getArray('eyeballArray'));//TODOv3 : setup a better material param
				material.properties.set('skeleton', (mesh as SkeletalMesh).skeleton);//TODOv3 : setup a better material param
			}
		}
	}

	async getSkins(): Promise<Set<string>> {
		const skinReferences = this.sourceModel.mdl.skinReferences;
		const skins = new Set<string>();
		for (const skin of skinReferences.keys()) {
			skins.add(String(skin));
		}
		return skins;
	}

	async getMaterialsName(skin: string): Promise<[string, Set<string>]> {
		const skinReferences = this.sourceModel.mdl.skinReferences;
		const materials = new Set<string>();

		for (const mesh of this.#meshes) {
			let material: Source1Material | null;
			let materialName: string;
			materialName = this.sourceModel.mdl.getMaterialName(Number(skin), mesh.properties.getNumber('materialId') ?? 0);
			material = await Source1MaterialManager.getMaterial(this.sourceModel.repository, materialName, this.sourceModel.mdl.getTextureDir());
			if (material) {
				materials.add(material.path);
			}
		}

		return [this.sourceModel.repository, materials];
	}

	#init() {
		const sourceModel = this.sourceModel;
		for (const [bodyPartName, bodyPart] of sourceModel.bodyParts) {
			//let newBodyPart = [];
			//let defaul = undefined;//TODOv3: change variable name;
			const group = new Entity({ name: bodyPartName });
			this.addChild(group);
			group.serializable = false;
			for (const [modelId, model] of bodyPart.entries()) {
				//const model = bodyPart[modelId];
				if (model) {
					const group2 = new Entity();
					group2.properties.setNumber('modelId', modelId);
					group2.name = `${bodyPartName} ${modelId}`;
					if (Number(modelId) != 0) {
						group2.setVisible(false);
					}
					group.addChild(group2);
					const newModel = [];
					for (const modelMesh of model) {
						const geometry = modelMesh.geometry;
						let mesh: Mesh | SkeletalMesh;
						if (this.#skeleton) {
							mesh = new SkeletalMesh({ geometry: geometry.clone(), material: defaultMaterial, skeleton: this.#skeleton });
						} else {
							mesh = new Mesh({ geometry: geometry, material: defaultMaterial });
						}
						mesh.name = geometry.properties.getString('name') ?? '';
						mesh.properties.setObject('sourceModelMesh', modelMesh.mesh);
						if (geometry.hasAttribute('aVertexTangent')) {
							mesh.setDefine('USE_VERTEX_TANGENT');
						}
						//mesh.visible = defaul;
						mesh.properties.copy(geometry.properties, ['materialId', 'materialType', 'materialParam', 'eyeballArray',]);

						mesh.materialsParams = this.materialsParams;
						newModel.push(mesh);
						//this.addChild(mesh);
						this.#meshes.add(mesh);
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
		const bones = this.sourceModel.getBones();
		if (bones) {
			for (const bone of bones) {
				const skeletonBone = this.#skeleton!.addBone(bone.boneId, bone.name);
				quat.copy(skeletonBone._initialQuaternion, bone.quaternion);
				vec3.copy(skeletonBone._initialPosition, bone.position);
				const parentBoneId = bone.parentBone;

				skeletonBone.poseToBone = bone.poseToBone;

				if (parentBoneId >= 0) {
					const parentBone = this.#skeleton!._bones[parentBoneId];
					parentBone?.addChild(skeletonBone);
					//skeletonBone.parent = this.#skeleton._bones[parentBone];
					if (!skeletonBone.parent) {
						console.error('parent not found : ' + bone.name);
					}
				} else {
					this.#skeleton!.addChild(skeletonBone);
				}
			}
		}
	}

	#initAttachments() {
		const attachments = this.sourceModel.getAttachments();
		const localMat3 = mat3.create();//todo: optimize
		if (attachments) {
			for (const attachment of attachments) {
				const attachmentBone = new Bone({ name: attachment.name });
				localMat3[0] = attachment.local[0];
				localMat3[3] = attachment.local[1];
				localMat3[6] = attachment.local[2];
				localMat3[1] = attachment.local[4];
				localMat3[4] = attachment.local[5];
				localMat3[7] = attachment.local[6];
				localMat3[2] = attachment.local[8];
				localMat3[5] = attachment.local[9];
				localMat3[8] = attachment.local[10];

				vec3.set(attachmentBone._position, attachment.local[3], attachment.local[7], attachment.local[11]);
				quat.fromMat3(attachmentBone._quaternion, localMat3);

				const bone = this.#skeleton!.getBoneById(attachment.localbone);
				bone?.addChild(attachmentBone);
				this.#attachments[attachment.lowcasename] = attachmentBone;
			}
		}
	}

	getBoneById(boneId: number): Bone | undefined {
		return this.#skeleton?.getBoneById(boneId);
	}

	/*
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
	*/

	renderBodyParts(render: boolean) {
		for (const bodyPartName in this.bodyParts) {
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

	renderBodyPart(bodyPartName: string, render: boolean) {
		const bodyPart = this.bodyParts[bodyPartName];
		if (bodyPart) {
			bodyPart.setVisible(render ? undefined : false);
			/*for (let model of bodyPart) {
				for (let mesh of model) {
					mesh.visible = render ? undefined : false;
				}
			}*/
		}
	}

	resetBodyPartModels() {
		for (const bodyPartName in this.bodyParts) {
			this.setBodyPartModel(bodyPartName, 0);
		}
	}

	setBodyPartIdModel(bodyPartId: number, modelId: number) {
		const bodypart = this.sourceModel.getBodyPart(bodyPartId);
		if (bodypart) {
			this.setBodyPartModel(bodypart.name, modelId);
		}
	}

	setBodyPartModel(bodyPartName: string, modelId: number) {
		const bodyPart = this.bodyParts[bodyPartName];
		if (bodyPart) {
			//let id = 0;
			for (const bodyPartModel of bodyPart.children) {
				//let bodyPartModel = bodyPart.children.get(id);
				bodyPartModel.setVisible((bodyPartModel.properties.getNumber('modelId') == modelId) ? undefined : false);
				//++id;
			}
		}
		//this.sourceModel.setBodyPartModel(bodyPartName, modelId);
		//this.bodyGroups[bodyPartName] = this.bodyGroups[bodyPartName] || {render : true, modelId : 0};
		//this.bodyGroups[bodyPartName].modelId = modelId;
		this.#bodyGroups.set(bodyPartName, Number(modelId));
	}

	getBodyGroups() {
		return new Map(this.#bodyGroups);
	}

	toString() {
		return 'Source1ModelInstance ' + super.toString();
	}

	attachSystem(system: Source1ParticleSystem, attachmentName = '', cpIndex = 0, offset?: vec3) {
		this.addChild(system);

		const attachment = this.getAttachment(attachmentName);
		if (attachment) {
			const controlPoint = system.getControlPoint(cpIndex);
			attachment.addChild(controlPoint);
		} else {
			this.#attachSystemToBone(system, attachmentName);
		}

		if (offset) {
			system.getControlPoint(0)!.setPosition(offset);
		}
	}

	#attachSystemToBone(system: Source1ParticleSystem, boneName: string) {
		if (!this.#skeleton) {
			return;
		}

		this.addChild(system);
		const controlPoint = system.getControlPoint(0);

		const bone = this.#skeleton.getBoneByName(boneName);
		if (bone) {
			bone.addChild(controlPoint);
		} else {
			this.addChild(controlPoint);
		}
	}

	getAttachment(attachmentName: string) {
		return this.#attachments[attachmentName.toLowerCase()];
	}

	getBoneByName(boneName: string) {
		if (!this.#skeleton) {
			return;
		}
		return this.#skeleton.getBoneByName(boneName);
	}

	set material(material: Material) {
		for (const bodyPartName in this.bodyParts) {
			const bodyPart = this.bodyParts[bodyPartName]!;
			const meshes = bodyPart.getChildList('Mesh') as Set<Mesh>;
			for (const mesh of meshes) {
				mesh.setMaterial(material);
			}
		}
		const subModels = this.getChildList('Source1ModelInstance');
		for (const subModel of subModels) {
			if (subModel !== this) {
				(subModel as Source1ModelInstance).material = material;
			}
		}
	}

	buildContextMenu() {
		//console.error();
		const skins = this.sourceModel.mdl.getSkinList();
		const skinMenu = [];
		for (const skin of skins) {
			const item = Object.create(null);
			item.name = skin;
			item.f = () => this.skin = String(skin);
			skinMenu.push(item);
		}

		return Object.assign(super.buildContextMenu(), {
			Source1ModelInstance_1: null,
			skin: { i18n: '#skin', submenu: skinMenu },
			tint: { i18n: '#tint', f: async (entity: Source1ModelInstance) => new Interaction().getColor(0, 0, undefined, (tint) => { entity.setTint(tint); }, (tint = entity.getTint()) => { entity.setTint(tint); }) },
			reset_tint: { i18n: '#reset_tint', f: (entity: Source1ModelInstance) => entity.setTint(null), disabled: this.#tint === undefined },
			animation: { i18n: '#animation', f: async (entity: Source1ModelInstance) => { const animation = await new Interaction().getString(0, 0, await entity.sourceModel.mdl.getAnimList()); if (animation) { entity.playSequence(animation); } } },
			overrideallmaterials: { i18n: '#overrideallmaterials', f: async (entity: Source1ModelInstance) => { const material = await new Interaction().getString(0, 0, Object.keys(Material.materialList)); if (material) { entity.material = new Material.materialList[material]!; } } },
			Source1ModelInstance_2: null,
			animate: { i18n: '#animate', selected: this.animationSpeed != 0.0, f: () => this.animationSpeed == 0 ? this.animationSpeed = 1 : this.animationSpeed = 0 },
			frame: { i18n: '#frame', f: () => { const frame = prompt('Frame', String(this.frame)); if (frame) { this.animationSpeed = 0; this.frame = Number(frame); } } },
			Source1ModelInstance_3: null,
			copy_filename: { i18n: '#copy_filename', f: () => navigator.clipboard.writeText(this?.sourceModel?.fileName) },
		});
	}

	getParentModel(): Source1ModelInstance {
		return this;
	}

	getRandomPointOnModel(vec: vec3, initialVec: vec3, bones: [Bone, number][]): vec3 {
		const hitboxes = this.getHitboxes();
		const hitbox = hitboxes[getRandomInt(hitboxes.length)];
		if (!hitbox) {
			return vec;
		}

		const bone = hitbox.parent;
		if (bone) {
			bones.push([bone, 1]);
			vec3RandomBox(vec, hitbox.boundingBoxMin, hitbox.boundingBoxMax);
			//vec3.transformMat4(vec, vec, bone.boneMat);
			vec3.copy(initialVec, vec);
			vec3.transformMat4(vec, vec, mat4.fromRotationTranslationScale(mat4.create(), bone.worldQuat, bone.worldPos, bone.worldScale));
		}
		return vec;
	}

	setPosition(position: vec3) {
		super.setPosition(position);
		if (this.#skeleton) {
			this.#skeleton.dirty();
		}
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

	static set animSpeed(speed: number) {
		this.#animSpeed = speed;
	}

	setFlexes(flexes: Map<string, number>) {
		this.#flexParameters.clear();
		for (const [name, value] of flexes) {
			this.#flexParameters.set(name, value);
		}
		this.#refreshFlexes();
	}

	resetFlexParameters() {
		this.#flexParameters.clear();
		this.#refreshFlexes();
	}

	#refreshFlexes() {
		this.sourceModel.mdl.runFlexesRules(this.#flexParameters, this.#flexesWeight);

		for (const mesh of this.#meshes) {
			if (mesh && mesh.geometry) {
				const attribute = mesh.geometry.getAttribute('aVertexPosition')!;
				const newAttribute = attribute.clone();
				mesh.geometry.setAttribute('aVertexPosition', newAttribute);
				const sourceModelMesh = mesh.properties.getObject('sourceModelMesh') as MeshTest;
				this.#updateArray(newAttribute._array, sourceModelMesh.flexes, sourceModelMesh.vertexoffset);
			}
		}
	}

	#updateArray(vertexPositionArray: Float32Array, flexes: MdlStudioFlex[], vertexoffset: number) {
		const flexesWeight = this.#flexesWeight;
		if (flexes && flexes.length) {
			for (const flex of flexes) {

				//const g_flexdescweight = this.mdl.g_flexdescweight;
				const w1 = flexesWeight[flex.flexdesc] ?? 0;
				let w3 = w1;
				if (flex.flexpair) {
					w3 = flexesWeight[flex.flexpair] ?? 0;
				}
				if (w1) {
					const vertAnims = flex.vertAnims;

					//let good = 0;
					//let bad = 0;
					for (const vertAnim of vertAnims) {

						const b = vertAnim.side / 255.0;
						//console.error(b);
						const w = w1 * (1.0 - b) + b * w3;

						const flDelta = vertAnim.flDelta;
						const flNDelta = vertAnim.flNDelta;
						//const vertexIndex = vertAnim.index * 3;
						//const vertexIndexArray = this.verticesPositionToto[vertAnim.index];

						const vertexIndex = (vertexoffset + vertAnim.index) * 3;

						vertexPositionArray[vertexIndex + 0]! += flDelta[0]! * w;
						vertexPositionArray[vertexIndex + 1]! += flDelta[1]! * w;
						vertexPositionArray[vertexIndex + 2]! += flDelta[2]! * w;

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
		const animList = await this.sourceModel.mdl.getAnimList();
		if (animList && animList.size > 0) {
			this.playSequence(animList.keys().next().value!);
		}
	}

	getHitboxes(): Hitbox[] {
		const mdlHitboxSets = this.sourceModel.mdl.hitboxSets;
		const hitboxes: Hitbox[] = [];
		if (mdlHitboxSets) {
			for (const mdlHitboxSet of mdlHitboxSets) {
				const mdlHitboxes = mdlHitboxSet.hitboxes;
				for (const mdlHitbox of mdlHitboxes) {
					const bone = this.getBoneById(mdlHitbox.boneId);
					if (bone) {
						hitboxes.push(new Hitbox(mdlHitbox.name, mdlHitbox.bbmin, mdlHitbox.bbmax, bone));
					}
				}
			}
		}
		return hitboxes;
	}

	replaceMaterial(material: Material, recursive = true) {
		super.replaceMaterial(material, recursive);
		for (const mesh of this.#meshes) {
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
		const json = super.toJSON();
		json.skin = this.skin;
		json.repository = this.sourceModel.repository;
		json.filename = this.sourceModel.fileName;
		json.dynamic = this.isDynamic;
		if (this.#skeleton) {
			json.skeletonid = this.#skeleton.id;
		}
		return json;
	}

	static async constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Entity | null> {
		const entity = await Source1ModelManager.createInstance(json.repository as string, json.filename as string, false/*dynamic*/, true);
		if (!entity) {
			return null;
		}
		loadedPromise.then(() => {
			if (json.dynamic) {
				if (json.skeletonid) {
					entity.skeleton = entities.get(json.skeletonid as string) as Skeleton;
				}
				if (!entity.skeleton) {
					entity.#createSkeleton();
					entity.#initSkeleton();
					entity.#initAttachments();
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

	fromJSON(json: JSONObject) {
		super.fromJSON(json);
		this.skin = (json.skin as (string | undefined)) ?? '0';
		//TODO
	}

	dispose() {
		super.dispose();
		this.#skeleton?.dispose();
		for (const material of this.#materialsUsed) {
			material.removeUser(this);
		}
		for (const mesh of this.#meshes) {
			mesh.dispose();
		}
	}

	static getEntityName() {
		return 'Source1Model';
	}

	is(s: string) {
		if (s == 'Source1ModelInstance') {
			return true;
		} else {
			return super.is(s);
		}
	}
}
registerEntity(Source1ModelInstance);
