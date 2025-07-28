import { quat, vec3 } from 'gl-matrix';
import { Animation } from '../../../animations/animation';
import { AnimationBone } from '../../../animations/animationbone';
import { AnimationFrame } from '../../../animations/animationframe';
import { AnimationFrameDataType } from '../../../animations/animationframedata';
import { BufferGeometry } from '../../../geometry/buffergeometry';
import { FileNameFromPath } from '../../../utils/utils';
import { CalcPose2, StudioFrames2 } from '../animations/calcanimations2';
import { Source1ModelInstance } from '../models/source1modelinstance';
import { BONE_USED_BY_ANYTHING, MdlBone } from './mdlbone';
import { MeshTest } from './sourceenginemdlloader';
import { MdlAttachment, MdlBodyPart, SourceMdl } from './sourcemdl';
import { SourceVtx } from './sourcevtx';
import { SourceVvd } from './sourcevvd';

const _SOURCE_MODEL_DEBUG_ = false; // removeme

export class SourceModel {
	repository: string;
	fileName: string;
	name: string;
	mdl: SourceMdl;//TODO: set private ?
	vvd;
	vtx;
	requiredLod = 0;
	drawBodyPart = {};
	currentSkin = 0;
	currentSheen = null;
	animLayers = [];
	materialRepository = null;
	dirty = true;
	bodyParts = new Map<string, SourceModelMesh[][]>();

	constructor(repository: string, fileName: string, mdl: SourceMdl, vvd: SourceVvd, vtx: SourceVtx) {
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

	addGeometry(mesh: MeshTest, geometry: BufferGeometry, bodyPartName: string, bodyPartModelId: number): void {
		const modelMesh = new SourceModelMesh(mesh, geometry);

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

	createInstance(isDynamic: boolean, preventInit: boolean): Source1ModelInstance {
		return new Source1ModelInstance({ sourceModel: this, isDynamic: isDynamic, preventInit: preventInit });
	}

	getBodyNumber(bodygroups: Map<string, number>): number {
		let bodyPartCount = 1;
		let bodyPartNumber = 0;

		for (const bodyPart of this.mdl.bodyParts) {
			if (bodyPart && bodyPart.models && (bodyPart.models.length > 1)) {
				const bodyPartModel = bodygroups.get(bodyPart.name);
				bodyPartNumber += (bodyPartModel ?? 0) * bodyPartCount;
				bodyPartCount *= (bodyPart.models.length);
			}
		}

		return bodyPartNumber;
	}

	getBones(): MdlBone[] | null {
		if (this.mdl) {
			return this.mdl.getBones();
		}
		return null;
	}

	getAttachments(): MdlAttachment[] | null {
		if (this.mdl) {
			return this.mdl.getAttachments();
		}
		return null;
	}

	getBone(boneIndex: number): MdlBone | undefined {
		if (this.mdl) {
			return this.mdl.getBone(boneIndex);
		}
	}

	getAttachmentById(attachmentIndex: number): MdlAttachment | undefined {
		if (this.mdl) {
			return this.mdl.getAttachmentById(attachmentIndex);
		}
	}

	getBoneByName(boneName: string): MdlBone | undefined {
		if (this.mdl) {
			return this.mdl.getBoneByName(boneName);
		}
	}

	getAttachment(attachmentName: string): MdlAttachment | undefined {
		if (this.mdl) {
			return this.mdl.getAttachment(attachmentName);
		}
	}

	getBodyPart(bodyPartId: number): MdlBodyPart | undefined {
		if (this.mdl) {
			return this.mdl.getBodyPart(bodyPartId);
		}
	}

	getBodyParts(): MdlBodyPart[] | undefined {
		if (this.mdl) {
			return this.mdl.getBodyParts();
		}
	}

	async getAnimation(animationName: string, entity: Source1ModelInstance): Promise<Animation> {
		const animation = new Animation(animationName);
		const seq = await this.mdl.getSequence(animationName);
		const bones = this.mdl.getBones();

		for (const mdlBone of bones) {
			animation.addBone(new AnimationBone(mdlBone.boneId, mdlBone.parentBone, mdlBone.name, mdlBone.position, mdlBone.quaternion));
		}

		if (seq) {
			//const t = Studio_Duration(seq.mdl, seq.id, []);
			const frameCount = StudioFrames2(seq.mdl, seq.id, new Map<string, number>());
			const posRemoveMeTemp: vec3[] = [];
			const quatRemoveMeTemp: quat[] = [];
			const boneFlags: number[] = [];
			//const poseParameters = {};

			for (const [boneId, bone] of animation.bones.entries()) {
				//posRemoveMeTemp.push(vec3.clone(bone.refPosition));
				//quatRemoveMeTemp.push(quat.clone(bone.refQuaternion));
				//posRemoveMeTemp.push(vec3.create());
				//quatRemoveMeTemp.push(quat.create());

			}

			for (let frame = 0; frame < frameCount; frame++) {
				const animationFrame = new AnimationFrame(frame);
				const cycle = frameCount > 1 ? frame / (frameCount - 1) : 0;
				CalcPose2(entity, seq.mdl, undefined, posRemoveMeTemp, quatRemoveMeTemp, boneFlags, seq.id, cycle/*entity.frame / t*/, new Map<string, number>(), BONE_USED_BY_ANYTHING, 1.0, cycle/*dynamicProp.frame / t*/);
				//console.info(posRemoveMeTemp, quatRemoveMeTemp);

				animationFrame.setDatas('position', AnimationFrameDataType.Vec3, posRemoveMeTemp);
				animationFrame.setDatas('rotation', AnimationFrameDataType.Quat, quatRemoveMeTemp);
				animationFrame.setDatas('flags', AnimationFrameDataType.Number, boneFlags);
				animation.addFrame(animationFrame);
			}
		}
		return animation;
	}
}

export class SourceModelMesh {
	mesh: MeshTest;
	geometry: BufferGeometry;
	constructor(mesh: MeshTest, geometry: BufferGeometry) {
		this.mesh = mesh;
		this.geometry = geometry;
	}
}
