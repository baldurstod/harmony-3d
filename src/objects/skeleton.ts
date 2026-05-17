import { mat4, quat, vec3 } from 'gl-matrix';
import { JSONObject } from 'harmony-types';
import { Rig } from '../animations/rig';
import { MAX_HARDWARE_BONES } from '../constants';
import { registerEntity } from '../entities/entities';
import { Entity, EntityParameters } from '../entities/entity';
import { Graphics } from '../graphics/graphics2';
import { Material } from '../materials/material';
import { BoundingBox } from '../math/boundingbox';
import { Texture } from '../textures/texture';
import { phonyWebGPUTextureDescriptor, TextureManager } from '../textures/texturemanager';
import { GL_FLOAT, GL_NEAREST, GL_RGBA, GL_RGBA32F, GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, } from '../webgl/constants';
import { Attachment } from './attachment';
import { Bone } from './bone';

export class Skeleton extends Entity {
	isSkeleton = true;
	readonly #bonesByName = new Map<string, Bone>();
	readonly #rootBone = new Bone({ name: 'root', boneId: 0, skeleton: this });
	readonly _bones: Bone[] = [];//TODOv3: rename set private
	readonly #attachments: Attachment[] = [];
	readonly #attachmentsByName = new Map<string, Attachment>();
	readonly imgData = new Float32Array(MAX_HARDWARE_BONES * 4 * 4/* 4 by 4 matrix*/);
	#texture!: Texture;
	lastComputed = 0;
	rig?: Rig

	constructor(params?: EntityParameters) {
		super(params);
		//this.bones = Object.create(null);//TODOv3: rename

		this.#createBoneMatrixArray();

		if (Graphics.isWebGLAny) {
			this.#createBoneMatrixTexture();
		}
		this.dirty();
	}

	dirty(): void {
		for (const bone of this._bones) {
			bone.dirty = true;
		}
	}

	getTexture(): Texture {
		return this.#texture;
	}

	#createBoneMatrixArray(): void {
		//this.#imgData = new Float32Array(MAX_HARDWARE_BONES * 4 * 4/* 4 by 4 matrix*/);
		mat4.identity(this.imgData);
		for (let i = 1; i < MAX_HARDWARE_BONES; ++i) {
			this.imgData.copyWithin(i * 16, 0, 16);
		}
	}

	#createBoneMatrixTexture(): void {
		this.#texture = TextureManager.createTexture({
			// Notice: this texture is not used in WebGPU
			webgpuDescriptor: phonyWebGPUTextureDescriptor,
		});
		const gl = Graphics.glContext;//TODO
		gl.bindTexture(GL_TEXTURE_2D, this.#texture.texture);//TODOv3: pass param to texture and remove this
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	#updateBoneMatrixTexture(): void {//removeme
		const gl = Graphics.glContext;//TODO
		gl.bindTexture(GL_TEXTURE_2D, this.#texture.texture);
		if (Graphics.isWebGL2) {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, 4/* matrix cols */, MAX_HARDWARE_BONES, 0, GL_RGBA, GL_FLOAT, this.imgData);
		} else {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 4/* matrix cols */, MAX_HARDWARE_BONES, 0, GL_RGBA, GL_FLOAT, this.imgData);
		}
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	setBonesMatrix(): void {
		let index = 0;
		const bones = this._bones;
		const imgData = this.imgData;

		let pose;
		if (bones.length == 0) {
			pose = this.#rootBone.boneMat;
			for (let k = 0; k < 16; ++k) {
				imgData[index++] = pose[k]!;
			}
		}

		for (const bone of bones) {
			pose = bone.boneMat;
			for (let k = 0; k < 16; ++k) {
				imgData[index++] = pose[k]!;
			}
		}

		if (Graphics.isWebGLAny) {
			this.#updateBoneMatrixTexture();
		}
	}

	get position(): vec3 {
		if (this._parent) {
			return vec3.clone(this._parent._position);
		} else {
			return vec3.clone(this._position);
		}
	}

	// TODO: deprecate
	set quaternion(quaternion) {
		super.setOrientation(quaternion);
	}

	/// TODO: deprecate
	get quaternion(): quat {
		if (this._parent) {
			return quat.clone(this._parent._quaternion);
		} else {
			return quat.clone(this._quaternion);
		}
	}

	addBone(boneId: number, boneName: string): Bone {
		const boneNameLowerCase = boneName.toLowerCase();
		const bone = this.#bonesByName.get(boneNameLowerCase);
		if (!bone) {
			const bone = new Bone({ name: boneName, boneId, skeleton: this });
			//this.addChild(bone);
			this._bones[boneId] = bone;
			this.#bonesByName.set(boneNameLowerCase, bone);
			return bone;
		} else {
			this._bones[boneId] = bone;
			return bone;
		}
	}

	addAttachment(attachmentId: number, attachmentName: string): Attachment {
		const attachmentNameLowerCase = attachmentName.toLowerCase();
		const attachment = this.#attachmentsByName.get(attachmentNameLowerCase);
		if (!attachment) {
			const attachment = new Attachment({ name: attachmentName, boneId: attachmentId, skeleton: this });
			this.#attachments[attachmentId] = attachment;
			this.#attachmentsByName.set(attachmentNameLowerCase, attachment);
			return attachment;
		} else {
			this.#attachments[attachmentId] = attachment;
			return attachment;
		}
	}

	async setParentSkeleton(skeleton: Skeleton | null): Promise<void> {
		await this.loadedPromise;
		if (skeleton) {
			await skeleton.loadedPromise;
		}
		const bones = this.#bonesByName;
		for (const [boneName, bone] of bones) {
			bone.parentSkeletonBone = skeleton?.getBoneByName(boneName) ?? null;
		}
	}

	getBoneByName(boneName: string): Bone | undefined {
		return this.#bonesByName.get(boneName.toLowerCase());
	}

	getBoneById(boneId: number): Bone | undefined {
		return this._bones[boneId];
	}

	toString(): string {
		return 'Skeleton ' + super.toString();
	}

	getBoundingBox(boundingBox = new BoundingBox()): BoundingBox {
		boundingBox.reset();
		return boundingBox;
	}

	get bones(): Bone[] {
		return this._bones;
	}

	reset(): void {
		for (const bone of this._bones) {
			bone.reset();
		}
	}

	toJSON(): JSONObject {
		const json = super.toJSON();
		const jBones = [];
		for (const bone of this._bones) {
			jBones.push(bone.id);
		}
		json.bones = jBones;
		return json;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	static override async constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Skeleton> {
		const entity = new Skeleton({ name: json.name as string });
		let loadedPromiseResolve: (value: any) => void;
		entity.loadedPromise = new Promise((resolve) => loadedPromiseResolve = resolve);
		loadedPromise.then(() => {
			const jBones = json.bones as string[];
			if (jBones) {
				for (let i = 0; i < jBones.length; ++i) {
					const boneEntity = entities.get(jBones[i] ?? '') as Bone | undefined;
					if (boneEntity) {
						entity._bones[i] = boneEntity;
						entity.#bonesByName.set(boneEntity.name.toLowerCase(), boneEntity);
					}
				}
			}
			loadedPromiseResolve(true);
		});
		return entity;
	}

	override dispose(): void {
		super.dispose();
		this.#texture.dispose();
	}

	static override getEntityName(): string {
		return 'Skeleton';
	}
}
registerEntity(Skeleton);
