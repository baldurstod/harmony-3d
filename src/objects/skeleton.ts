import { mat4, quat, vec3 } from 'gl-matrix';

import { Bone } from './bone';
import { Graphics } from '../graphics/graphics';//TODOv3: removeme
import { Entity } from '../entities/entity';
import { TextureManager } from '../textures/texturemanager'
import { GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_NEAREST, GL_FLOAT, GL_RGBA, GL_RGBA32F, } from '../webgl/constants';
import { BoundingBox } from '../math/boundingbox';
import { MAX_HARDWARE_BONES } from '../constants';
import { Texture } from '../textures/texture';
import { registerEntity } from '../entities/entities';
import { JSONArray, JSONObject } from '../types';
import { Material } from '../materials/material';

const identityMatrix = mat4.create();
export class Skeleton extends Entity {
	isSkeleton = true;
	#bonesByName = new Map();
	#rootBone = new Bone({ name: 'root', boneId: 0, skeleton: this });
	_bones: Bone[] = [];//TODOv3: rename set private
	_dirty = true;
	#imgData!: Float32Array;
	#texture!: Texture;
	lastComputed = 0;

	constructor(params?: any/*TODO: improve type*/) {
		super(params);
		//this.bones = Object.create(null);//TODOv3: rename

		this.#createBoneMatrixArray();
		this.#createBoneMatrixTexture();
		this.dirty();
	}

	dirty() {
		this._dirty = true;
		for (const bone of this._bones) {
			bone.dirty = true;
		}
		/*if (this._bones[0]) {
			this._bones[0].dirty = true;
		}*/
	}

	getTexture() {
		return this.#texture;
	}

	#createBoneMatrixArray() {
		this.#imgData = new Float32Array(MAX_HARDWARE_BONES * 4 * 4);
		mat4.identity(this.#imgData);
		const index = 0;
		for (let i = 1; i < MAX_HARDWARE_BONES; ++i) {
			this.#imgData.copyWithin(i * 16, 0, 16);
		}
	}

	#createBoneMatrixTexture() {
		this.#texture = TextureManager.createTexture();
		const gl = new Graphics().glContext;//TODO
		gl.bindTexture(GL_TEXTURE_2D, this.#texture.texture);//TODOv3: pass param to texture and remove this
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	#updateBoneMatrixTexture() {//removeme
		const gl = new Graphics().glContext;//TODO
		gl.bindTexture(GL_TEXTURE_2D, this.#texture.texture);
		if (new Graphics().isWebGL2) {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, 4, MAX_HARDWARE_BONES, 0, GL_RGBA, GL_FLOAT, this.#imgData);
		} else {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 4, MAX_HARDWARE_BONES, 0, GL_RGBA, GL_FLOAT, this.#imgData);
		}
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	setBonesMatrix() {
		let index = 0;
		const bones = this._bones;
		const imgData = this.#imgData;

		let pose;
		if (bones.length == 0) {
			pose = this.#rootBone.boneMat;
			for (let k = 0; k < 16; ++k) {
				imgData[index++] = pose[k];
			}
		}

		for (const bone of bones) {
			pose = bone.boneMat;
			for (let k = 0; k < 16; ++k) {
				imgData[index++] = pose[k];
			}
		}

		this.#updateBoneMatrixTexture();
	}

	set position(position) {
		super.position = position;
	}

	get position() {
		if (this._parent) {
			return vec3.clone(this._parent._position);
		} else {
			return vec3.clone(this._position);
		}
	}

	set quaternion(quaternion) {
		super.quaternion = quaternion;
	}

	get quaternion() {
		if (this._parent) {
			return quat.clone(this._parent._quaternion);
		} else {
			return quat.clone(this._quaternion);
		}
	}

	addBone(boneId: number, boneName: string) {
		const boneNameLowerCase = boneName.toLowerCase();
		if (!this.#bonesByName.has(boneNameLowerCase)) {
			const bone = new Bone({ name: boneName, boneId: boneId });
			bone.skeleton = this;
			//this.addChild(bone);
			this._bones[boneId] = bone;
			this.#bonesByName.set(boneNameLowerCase, bone);
			return bone;
		} else {
			const bone = this.#bonesByName.get(boneNameLowerCase);
			this._bones[boneId] = bone;
			return bone;
		}
	}

	async setParentSkeleton(skeleton: Skeleton | null) {
		await this.loadedPromise;
		if (skeleton) {
			await skeleton.loadedPromise;
		}
		const bones = this.#bonesByName;
		for (const [boneName, bone] of bones) {
			bone.parentSkeletonBone = skeleton?.getBoneByName(boneName) ?? null;
		}
	}

	getBoneByName(boneName: string) {
		return this.#bonesByName.get(boneName.toLowerCase());
	}

	getBoneById(boneId: number) {
		return this._bones[boneId];
	}

	toString() {
		return 'Skeleton ' + super.toString();
	}

	getBoundingBox(boundingBox = new BoundingBox()) {
		boundingBox.reset();
		return boundingBox;
	}

	get bones() {
		return this._bones;
	}

	reset() {
		for (const bone of this._bones) {
			bone.reset();
		}
	}

	toJSON() {
		const json = super.toJSON();
		const jBones = [];
		const bones = this._bones;
		for (let i = 0; i < bones.length; ++i) {
			jBones.push(bones[i].id);
		}
		json.bones = jBones;
		return json;
	}

	static async constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>) {
		const entity = new Skeleton({ name: json.name });
		let loadedPromiseResolve: (value: any) => void;
		entity.loadedPromise = new Promise((resolve) => loadedPromiseResolve = resolve);
		loadedPromise.then(() => {
			const jBones = json.bones as string[];
			if (jBones) {
				for (let i = 0; i < jBones.length; ++i) {
					const boneEntity = entities.get(jBones[i]) as Bone | undefined;
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

	dispose() {
		super.dispose();
		this.#texture.dispose();
	}

	static getEntityName() {
		return 'Skeleton';
	}
}
registerEntity(Skeleton);
