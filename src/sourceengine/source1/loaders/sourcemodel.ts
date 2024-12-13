import { Source1ModelInstance } from '../models/source1modelinstance';
import { FileNameFromPath } from '../../../utils/utils';
import { CalcPose, StudioFrames } from '../animations/calcanimations';
import { Animation } from '../../../animations/animation';
import { SourceMDL } from './sourcemdl';
import { BONE_USED_BY_ANYTHING } from './mdlbone';
import { AnimationFrame } from '../../../animations/animationframe';
import { AnimationFrameDataType } from '../../../animations/animationframedata';
import { AnimationBone } from '../../../animations/animationbone';
import { quat, vec3 } from 'gl-matrix';

const _SOURCE_MODEL_DEBUG_ = false; // removeme

export class SourceModel {
	repository: string;
	fileName: string;
	name: string;
	mdl: SourceMDL;//TODO: set private ?
	vvd;
	vtx;
	requiredLod: number = 0;
	drawBodyPart = {};
	currentSkin: number = 0;
	currentSheen = null;
	animLayers = [];
	materialRepository = null;
	dirty = true;
	bodyParts = new Map<string, Array<Array<SourceModelMesh>>>();
	constructor(repository, fileName, mdl, vvd, vtx) {
		this.repository = repository;
		this.fileName = fileName;
		this.name = FileNameFromPath(fileName);
		this.mdl = mdl;
		this.vvd = vvd;
		this.vtx = vtx;
		//this.visible = true;
		this.requiredLod = 0;

		//this.bodyParts = [];
		//this.origin = vec3.create();
		//this.orientation = vec3.create();

		//this.geometries = new Set();
	}

	addGeometry(mesh, geometry, bodyPartName, bodyPartModelId) {
		let modelMesh = new SourceModelMesh(mesh, geometry);

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
				meshes.push(modelMesh);
			}
		}
		//this.geometries.add(geometry);
	}

	createInstance(isDynamic, preventInit) {
		return new Source1ModelInstance({ sourceModel: this, isDynamic: isDynamic, preventInit: preventInit });
	}

	getBodyNumber(bodygroups) {
		let bodyPartCount = 1;
		let bodyPartNumber = 0;
		/*
		for (const bodyPart of  this.bodyParts) {
			if (bodyPart && bodyPart.models && (bodyPart.models.length > 1)) {
				const bodyPartModel = bodygroups[bodyPart.name];
				bodyPartNumber += (bodyPartModel ? bodyPartModel.modelId : 0) * bodyPartCount;
				bodyPartCount *= (bodyPart.models.length);
			}
		}
			*/
		return bodyPartNumber;
	}

	getBones() {
		if (this.mdl) {
			return this.mdl.getBones();
		}
		return null;
	}

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

	async getAnimation(animationName: string, entity: Source1ModelInstance) {
		const animation = new Animation(animationName);
		const seq = await this.mdl.getSequence(animationName);
		const bones = this.mdl.getBones();

		for (const mdlBone of bones) {
			animation.addBone(new AnimationBone(mdlBone.boneId, mdlBone.name, mdlBone.position, mdlBone.quaternion));
		}

		if (seq) {
			//const t = Studio_Duration(seq.mdl, seq.id, []);
			const frameCount = StudioFrames(seq.mdl, seq.id, []);
			const posRemoveMeTemp: Array<vec3> = [];
			const quatRemoveMeTemp: Array<quat> = [];
			const boneFlags: Array<number> = [];
			const poseParameters = {};

			for (const [boneId, bone] of animation.bones.entries()) {
				//posRemoveMeTemp.push(vec3.clone(bone.refPosition));
				//quatRemoveMeTemp.push(quat.clone(bone.refQuaternion));
				//posRemoveMeTemp.push(vec3.create());
				//quatRemoveMeTemp.push(quat.create());

			}

			for (let frame = 0; frame < frameCount; frame++) {
				const animationFrame = new AnimationFrame(frame);
				const cycle = frame / frameCount
				CalcPose(entity, seq.mdl, undefined, posRemoveMeTemp, quatRemoveMeTemp, boneFlags, seq.id, cycle/*entity.frame / t*/, poseParameters, BONE_USED_BY_ANYTHING, 1.0, cycle/*dynamicProp.frame / t*/);
				//console.info(posRemoveMeTemp, quatRemoveMeTemp);

				animationFrame.setDatas('position', AnimationFrameDataType.Vec3, posRemoveMeTemp);
				animationFrame.setDatas('rotation', AnimationFrameDataType.Quat, quatRemoveMeTemp);
				animationFrame.setDatas('flags', AnimationFrameDataType.Number, boneFlags);
				animation.addFrame(animationFrame);
			}

			console.log(frameCount, bones);
		}

		console.log(seq, animation);
		return animation;
	}
}

export class SourceModelMesh {
	mesh;
	geometry;
	constructor(mesh, geometry) {
		this.mesh = mesh;
		this.geometry = geometry;
	}
}
