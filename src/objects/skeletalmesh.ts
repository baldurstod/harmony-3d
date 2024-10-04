import { mat4, vec2, vec3 } from 'gl-matrix';

import { Mesh } from './mesh';
import { BoundingBox } from '../math/boundingbox';
import { getUV, getNormal } from '../math/triangle';
import { Ray } from '../raycasting/ray';
import { Skeleton } from './skeleton';

const IDENTITY_MAT4 = mat4.create();

let v1 = vec3.create();
let v2 = vec3.create();
let v3 = vec3.create();
let n1 = vec3.create();
let n2 = vec3.create();
let n3 = vec3.create();
let uv1 = vec2.create();
let uv2 = vec2.create();
let uv3 = vec2.create();
let intersectionPoint = vec3.create();
let intersectionNormal = vec3.create();
let ray = new Ray();
let uv = vec2.create();

export class SkeletalMesh extends Mesh {
	isSkeletalMesh = true;
	#bonesPerVertex = 3;
	skeleton: Skeleton;
	skinnedVertexPosition;
	skinnedVertexNormal;
	constructor(geometry, material, skeleton) {
		super(geometry, material);
		this.skeleton = skeleton;

		this.setUniform('uBoneMatrix', this.skeleton.getTexture());
		this.setDefine('HARDWARE_SKINNING');//TODOv3 proper defines
		this.setDefine('SKELETAL_MESH');
	}

	set bonesPerVertex(bonesPerVertex) {
		this.#bonesPerVertex = bonesPerVertex;
	}

	get bonesPerVertex() {
		return this.#bonesPerVertex;
	}

	exportObj() {
		let ret = { f: [], v: [] };
		let skeletonBones = this.skeleton._bones;
		let attributes = { f: 'index', v: 'aVertexPosition', vn: 'aVertexNormal', vt: 'aTextureCoord' };
		let geometry = this.geometry;
		let vertexCount = geometry.getAttribute('aVertexPosition').count;
		let skinnedVertexPosition = new Float32Array(vertexCount * 3);
		let skinnedVertexNormal = new Float32Array(vertexCount * 3);
		let vertexPosition = geometry.getAttribute('aVertexPosition')._array;
		let vertexNormal = geometry.getAttribute('aVertexNormal')._array;
		let vertexBoneIndice = geometry.getAttribute('aBoneIndices')._array;
		let vertexBoneWeight = geometry.getAttribute('aBoneWeight')._array;
		let boneCount = geometry.getAttribute('aBoneIndices').itemSize;

		let tempVertex = vec3.create();
		let tempVertexNormal = vec3.create();
		let accumulateMat = mat4.create();

		if (vertexPosition && vertexBoneIndice && vertexBoneWeight) {
			for (let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex) {
				let vertexArrayIndex = vertexIndex * 3;
				let boneArrayIndex = vertexIndex * boneCount;

				accumulateMat[0] = 0; accumulateMat[1] = 0; accumulateMat[2] = 0;
				accumulateMat[4] = 0; accumulateMat[5] = 0; accumulateMat[6] = 0;
				accumulateMat[8] = 0; accumulateMat[9] = 0; accumulateMat[10] = 0;
				accumulateMat[12] = 0; accumulateMat[13] = 0; accumulateMat[14] = 0;

				tempVertex[0] = vertexPosition[vertexArrayIndex + 0];
				tempVertex[1] = vertexPosition[vertexArrayIndex + 1];
				tempVertex[2] = vertexPosition[vertexArrayIndex + 2];

				tempVertexNormal[0] = vertexNormal[vertexArrayIndex + 0];
				tempVertexNormal[1] = vertexNormal[vertexArrayIndex + 1];
				tempVertexNormal[2] = vertexNormal[vertexArrayIndex + 2];

				for (let boneIndex = 0; boneIndex < boneCount; ++boneIndex) {
					let boneArrayIndex2 = boneArrayIndex + boneIndex;
					let bone = skeletonBones[vertexBoneIndice[boneArrayIndex2]];
					let boneMat = bone ? bone.boneMat : IDENTITY_MAT4;
					let boneWeight = vertexBoneWeight[boneArrayIndex2];

					if (boneWeight && boneMat) {
						accumulateMat[0] += boneWeight * boneMat[0];
						accumulateMat[1] += boneWeight * boneMat[1];
						accumulateMat[2] += boneWeight * boneMat[2];

						accumulateMat[4] += boneWeight * boneMat[4];
						accumulateMat[5] += boneWeight * boneMat[5];
						accumulateMat[6] += boneWeight * boneMat[6];

						accumulateMat[8] += boneWeight * boneMat[8];
						accumulateMat[9] += boneWeight * boneMat[9];
						accumulateMat[10] += boneWeight * boneMat[10];

						accumulateMat[12] += boneWeight * boneMat[12];
						accumulateMat[13] += boneWeight * boneMat[13];
						accumulateMat[14] += boneWeight * boneMat[14];
					}
				}

				vec3.transformMat4(tempVertex, tempVertex, accumulateMat);

				accumulateMat[12] = 0;
				accumulateMat[13] = 0;
				accumulateMat[14] = 0;
				vec3.transformMat4(tempVertexNormal, tempVertexNormal, accumulateMat);

				skinnedVertexPosition[vertexArrayIndex + 0] = tempVertex[0];
				skinnedVertexPosition[vertexArrayIndex + 1] = tempVertex[1];
				skinnedVertexPosition[vertexArrayIndex + 2] = tempVertex[2];

				skinnedVertexNormal[vertexArrayIndex + 0] = tempVertexNormal[0];
				skinnedVertexNormal[vertexArrayIndex + 1] = tempVertexNormal[1];
				skinnedVertexNormal[vertexArrayIndex + 2] = tempVertexNormal[2];
			}
		}

		for (let objAttribute in attributes) {
			let geometryAttribute = attributes[objAttribute];
			if (geometry.getAttribute(geometryAttribute)) {
				if (geometryAttribute == 'aVertexPosition') {
					ret[objAttribute] = skinnedVertexPosition;
				} else if (geometryAttribute == 'aVertexNormal') {
					ret[objAttribute] = skinnedVertexNormal;
				} else {
					let webglAttrib = geometry.getAttribute(geometryAttribute);
					if (webglAttrib) {
						ret[objAttribute] = webglAttrib._array;
					}
				}
			} else {
				ret[objAttribute] = [];
			}
		}
		return ret;
	}

	getRandomPointOnModel(vec, initialVec, bones) {//TODO: optimize this stuff
		let ret = {};
		let skeletonBones = this.skeleton._bones;
		//let attributes = {f:'index',v:'aVertexPosition',vn:'aVertexNormal',vt:'aTextureCoord'};
		let geometry = this.geometry;
		let vertexCount = geometry.getAttribute('aVertexPosition').count;
		let skinnedVertexPosition = new Float32Array(vertexCount * 3);
		let vertexPosition = geometry.getAttribute('aVertexPosition')._array;
		let vertexBoneIndice = geometry.getAttribute('aBoneIndices')._array;
		let vertexBoneWeight = geometry.getAttribute('aBoneWeight')._array;
		let boneCount = geometry.getAttribute('aBoneIndices').itemSize;

		let tempVertex = vec3.create();
		let accumulateMat = mat4.create();


		function RandomInt(max) {
			return Math.floor(Math.random() * max)
		}

		let vertexIndex = RandomInt(vertexCount);
		vec[0] = 0;
		vec[1] = 0;
		vec[2] = 0;
		if (vertexPosition && vertexBoneIndice && vertexBoneWeight) {
			//for (let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex)
			{
				let vertexArrayIndex = vertexIndex * 3;
				let boneArrayIndex = vertexIndex * boneCount;

				accumulateMat[0] = 0; accumulateMat[1] = 0; accumulateMat[2] = 0;
				accumulateMat[4] = 0; accumulateMat[5] = 0; accumulateMat[6] = 0;
				accumulateMat[8] = 0; accumulateMat[9] = 0; accumulateMat[10] = 0;
				accumulateMat[12] = 0; accumulateMat[13] = 0; accumulateMat[14] = 0;

				vec[0] = vertexPosition[vertexArrayIndex + 0];
				vec[1] = vertexPosition[vertexArrayIndex + 1];
				vec[2] = vertexPosition[vertexArrayIndex + 2];
				vec3.copy(initialVec, vec);

				for (let boneIndex = 0; boneIndex < boneCount; ++boneIndex) {
					let boneArrayIndex2 = boneArrayIndex + boneIndex;
					let bone = skeletonBones[vertexBoneIndice[boneArrayIndex2]];
					let boneMat = bone ? bone.boneMat : IDENTITY_MAT4;
					let boneWeight = vertexBoneWeight[boneArrayIndex2];
					if (bones) {
						bones.push([bone, boneWeight]);
					}

					if (boneWeight && boneMat) {
						accumulateMat[0] += boneWeight * boneMat[0];
						accumulateMat[1] += boneWeight * boneMat[1];
						accumulateMat[2] += boneWeight * boneMat[2];

						accumulateMat[4] += boneWeight * boneMat[4];
						accumulateMat[5] += boneWeight * boneMat[5];
						accumulateMat[6] += boneWeight * boneMat[6];

						accumulateMat[8] += boneWeight * boneMat[8];
						accumulateMat[9] += boneWeight * boneMat[9];
						accumulateMat[10] += boneWeight * boneMat[10];

						accumulateMat[12] += boneWeight * boneMat[12];
						accumulateMat[13] += boneWeight * boneMat[13];
						accumulateMat[14] += boneWeight * boneMat[14];
					}
				}
				vec3.transformMat4(vec, vec, accumulateMat);
			}
		}
		return ret;
	}

	getBoundingBox(boundingBox = new BoundingBox()) {
		boundingBox.reset();

		let ret = {};
		let skeletonBones = this.skeleton._bones;
		let attributes = { f: 'index', v: 'aVertexPosition', vn: 'aVertexNormal', vt: 'aTextureCoord' };
		let geometry = this.geometry;
		let vertexCount = geometry.getAttribute('aVertexPosition').count;
		let skinnedVertexPosition = new Float32Array(vertexCount * 3);
		let skinnedVertexNormal = new Float32Array(vertexCount * 3);
		let vertexPosition = geometry.getAttribute('aVertexPosition')._array;
		let vertexNormal = geometry.getAttribute('aVertexNormal')._array;
		let vertexBoneIndice = geometry.getAttribute('aBoneIndices')._array;
		let vertexBoneWeight = geometry.getAttribute('aBoneWeight')._array;
		let boneCount = geometry.getAttribute('aBoneIndices').itemSize;

		let tempVertex = vec3.create();
		let accumulateMat = mat4.create();

		if (vertexPosition && vertexBoneIndice && vertexBoneWeight) {
			for (let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex) {
				let vertexArrayIndex = vertexIndex * 3;
				let boneArrayIndex = vertexIndex * boneCount;

				accumulateMat[0] = 0; accumulateMat[1] = 0; accumulateMat[2] = 0;
				accumulateMat[4] = 0; accumulateMat[5] = 0; accumulateMat[6] = 0;
				accumulateMat[8] = 0; accumulateMat[9] = 0; accumulateMat[10] = 0;
				accumulateMat[12] = 0; accumulateMat[13] = 0; accumulateMat[14] = 0;

				tempVertex[0] = vertexPosition[vertexArrayIndex + 0];
				tempVertex[1] = vertexPosition[vertexArrayIndex + 1];
				tempVertex[2] = vertexPosition[vertexArrayIndex + 2];

				for (let boneIndex = 0; boneIndex < boneCount; ++boneIndex) {
					let boneArrayIndex2 = boneArrayIndex + boneIndex;
					let bone = skeletonBones[vertexBoneIndice[boneArrayIndex2]];
					let boneMat = bone ? bone.boneMat : IDENTITY_MAT4;
					let boneWeight = vertexBoneWeight[boneArrayIndex2];

					if (boneWeight && boneMat) {
						accumulateMat[0] += boneWeight * boneMat[0];
						accumulateMat[1] += boneWeight * boneMat[1];
						accumulateMat[2] += boneWeight * boneMat[2];

						accumulateMat[4] += boneWeight * boneMat[4];
						accumulateMat[5] += boneWeight * boneMat[5];
						accumulateMat[6] += boneWeight * boneMat[6];

						accumulateMat[8] += boneWeight * boneMat[8];
						accumulateMat[9] += boneWeight * boneMat[9];
						accumulateMat[10] += boneWeight * boneMat[10];

						accumulateMat[12] += boneWeight * boneMat[12];
						accumulateMat[13] += boneWeight * boneMat[13];
						accumulateMat[14] += boneWeight * boneMat[14];
					}
				}

				vec3.transformMat4(tempVertex, tempVertex, accumulateMat);

				skinnedVertexPosition[vertexArrayIndex + 0] = tempVertex[0];
				skinnedVertexPosition[vertexArrayIndex + 1] = tempVertex[1];
				skinnedVertexPosition[vertexArrayIndex + 2] = tempVertex[2];
			}
		}

		boundingBox.setPoints(skinnedVertexPosition);
		return boundingBox;
	}

	toString() {
		return 'SkeletalMesh ' + super.toString();
	}

	prepareRayCasting() {
		let skeletonBones = this.skeleton._bones;
		let geometry = this.geometry;
		let vertexCount = geometry.getAttribute('aVertexPosition').count;
		let skinnedVertexPosition = new Float32Array(vertexCount * 3);
		let skinnedVertexNormal = new Float32Array(vertexCount * 3);
		let vertexPosition = geometry.getAttribute('aVertexPosition')._array;
		let vertexNormal = geometry.getAttribute('aVertexNormal')._array;
		let vertexBoneIndice = geometry.getAttribute('aBoneIndices')._array;
		let vertexBoneWeight = geometry.getAttribute('aBoneWeight')._array;
		let boneCount = geometry.getAttribute('aBoneIndices').itemSize;

		let tempVertex = vec3.create();
		let tempVertexNormal = vec3.create();
		let accumulateMat = mat4.create();

		if (vertexPosition && vertexBoneIndice && vertexBoneWeight) {
			for (let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex) {
				let vertexArrayIndex = vertexIndex * 3;
				let boneArrayIndex = vertexIndex * boneCount;

				accumulateMat[0] = 0; accumulateMat[1] = 0; accumulateMat[2] = 0;
				accumulateMat[4] = 0; accumulateMat[5] = 0; accumulateMat[6] = 0;
				accumulateMat[8] = 0; accumulateMat[9] = 0; accumulateMat[10] = 0;
				accumulateMat[12] = 0; accumulateMat[13] = 0; accumulateMat[14] = 0;

				tempVertex[0] = vertexPosition[vertexArrayIndex + 0];
				tempVertex[1] = vertexPosition[vertexArrayIndex + 1];
				tempVertex[2] = vertexPosition[vertexArrayIndex + 2];

				let tempVertexNormalX = vertexNormal[vertexArrayIndex + 0];
				let tempVertexNormalY = vertexNormal[vertexArrayIndex + 1];
				let tempVertexNormalZ = vertexNormal[vertexArrayIndex + 2];

				for (let boneIndex = 0; boneIndex < boneCount; ++boneIndex) {
					let boneArrayIndex2 = boneArrayIndex + boneIndex;
					let bone = skeletonBones[vertexBoneIndice[boneArrayIndex2]];
					let boneMat = bone ? bone.boneMat : IDENTITY_MAT4;
					let boneWeight = vertexBoneWeight[boneArrayIndex2];

					if (boneWeight && boneMat) {
						accumulateMat[0] += boneWeight * boneMat[0];
						accumulateMat[1] += boneWeight * boneMat[1];
						accumulateMat[2] += boneWeight * boneMat[2];

						accumulateMat[4] += boneWeight * boneMat[4];
						accumulateMat[5] += boneWeight * boneMat[5];
						accumulateMat[6] += boneWeight * boneMat[6];

						accumulateMat[8] += boneWeight * boneMat[8];
						accumulateMat[9] += boneWeight * boneMat[9];
						accumulateMat[10] += boneWeight * boneMat[10];

						accumulateMat[12] += boneWeight * boneMat[12];
						accumulateMat[13] += boneWeight * boneMat[13];
						accumulateMat[14] += boneWeight * boneMat[14];
					}
				}

				vec3.transformMat4(tempVertex, tempVertex, accumulateMat);

				tempVertexNormal[0] = accumulateMat[0] * tempVertexNormalX + accumulateMat[4] * tempVertexNormalY + accumulateMat[8] * tempVertexNormalZ;
				tempVertexNormal[1] = accumulateMat[1] * tempVertexNormalX + accumulateMat[5] * tempVertexNormalY + accumulateMat[9] * tempVertexNormalZ;
				tempVertexNormal[2] = accumulateMat[2] * tempVertexNormalX + accumulateMat[6] * tempVertexNormalY + accumulateMat[10] * tempVertexNormalZ;

				skinnedVertexPosition[vertexArrayIndex + 0] = tempVertex[0];
				skinnedVertexPosition[vertexArrayIndex + 1] = tempVertex[1];
				skinnedVertexPosition[vertexArrayIndex + 2] = tempVertex[2];

				skinnedVertexNormal[vertexArrayIndex + 0] = tempVertexNormal[0];
				skinnedVertexNormal[vertexArrayIndex + 1] = tempVertexNormal[1];
				skinnedVertexNormal[vertexArrayIndex + 2] = tempVertexNormal[2];
			}
		}
		this.skinnedVertexPosition = skinnedVertexPosition;
		this.skinnedVertexNormal = skinnedVertexNormal;

	}

	raycast(raycaster, intersections) {
		//TODO: case when normals are not provided
		let skeletonBones = this.skeleton._bones;
		let geometry = this.geometry;
		let indices = geometry.getAttribute('index')._array;
		//let normals = geometry.getAttribute('aVertexNormal')._array;

		let vertexCount = geometry.getAttribute('aVertexPosition').count;
		let skinnedVertexPosition = new Float32Array(vertexCount * 3);
		let skinnedVertexNormal = new Float32Array(vertexCount * 3);
		let textureCoords = geometry.getAttribute('aTextureCoord')._array;

		let worldMatrix = this.worldMatrix;
		ray.copyTransform(raycaster.ray, worldMatrix);

		let vertexPosition = geometry.getAttribute('aVertexPosition')._array;
		let vertexNormal = geometry.getAttribute('aVertexNormal')._array;
		let vertexBoneIndice = geometry.getAttribute('aBoneIndices')._array;
		let vertexBoneWeight = geometry.getAttribute('aBoneWeight')._array;

		let boneCount = geometry.getAttribute('aBoneIndices').itemSize;
		let tempVertex = vec3.create();
		let tempVertexNormal = vec3.create();
		let accumulateMat = mat4.create();

		if (vertexPosition && vertexBoneIndice && vertexBoneWeight) {
			for (let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex) {
				let vertexArrayIndex = vertexIndex * 3;
				let boneArrayIndex = vertexIndex * boneCount;

				accumulateMat[0] = 0; accumulateMat[1] = 0; accumulateMat[2] = 0;
				accumulateMat[4] = 0; accumulateMat[5] = 0; accumulateMat[6] = 0;
				accumulateMat[8] = 0; accumulateMat[9] = 0; accumulateMat[10] = 0;
				accumulateMat[12] = 0; accumulateMat[13] = 0; accumulateMat[14] = 0;

				tempVertex[0] = vertexPosition[vertexArrayIndex + 0];
				tempVertex[1] = vertexPosition[vertexArrayIndex + 1];
				tempVertex[2] = vertexPosition[vertexArrayIndex + 2];

				tempVertexNormal[0] = vertexNormal[vertexArrayIndex + 0];
				tempVertexNormal[1] = vertexNormal[vertexArrayIndex + 1];
				tempVertexNormal[2] = vertexNormal[vertexArrayIndex + 2];

				for (let boneIndex = 0; boneIndex < boneCount; ++boneIndex) {
					let boneArrayIndex2 = boneArrayIndex + boneIndex;
					let bone = skeletonBones[vertexBoneIndice[boneArrayIndex2]];
					let boneMat = bone ? bone.boneMat : IDENTITY_MAT4;
					let boneWeight = vertexBoneWeight[boneArrayIndex2];

					if (boneWeight && boneMat) {
						accumulateMat[0] += boneWeight * boneMat[0];
						accumulateMat[1] += boneWeight * boneMat[1];
						accumulateMat[2] += boneWeight * boneMat[2];

						accumulateMat[4] += boneWeight * boneMat[4];
						accumulateMat[5] += boneWeight * boneMat[5];
						accumulateMat[6] += boneWeight * boneMat[6];

						accumulateMat[8] += boneWeight * boneMat[8];
						accumulateMat[9] += boneWeight * boneMat[9];
						accumulateMat[10] += boneWeight * boneMat[10];

						accumulateMat[12] += boneWeight * boneMat[12];
						accumulateMat[13] += boneWeight * boneMat[13];
						accumulateMat[14] += boneWeight * boneMat[14];
					}
				}

				vec3.transformMat4(tempVertex, tempVertex, accumulateMat);

				accumulateMat[12] = 0;
				accumulateMat[13] = 0;
				accumulateMat[14] = 0;
				vec3.transformMat4(tempVertexNormal, tempVertexNormal, accumulateMat);

				skinnedVertexPosition[vertexArrayIndex + 0] = tempVertex[0];
				skinnedVertexPosition[vertexArrayIndex + 1] = tempVertex[1];
				skinnedVertexPosition[vertexArrayIndex + 2] = tempVertex[2];

				skinnedVertexNormal[vertexArrayIndex + 0] = tempVertexNormal[0];
				skinnedVertexNormal[vertexArrayIndex + 1] = tempVertexNormal[1];
				skinnedVertexNormal[vertexArrayIndex + 2] = tempVertexNormal[2];
			}
		}


		for (let i = 0, l = indices.length; i < l; i += 3) {
			let i1 = 3 * indices[i];
			let i2 = 3 * indices[i + 1];
			let i3 = 3 * indices[i + 2];

			vec3.set(v1, skinnedVertexPosition[i1], skinnedVertexPosition[i1 + 1], skinnedVertexPosition[i1 + 2]);
			vec3.set(v2, skinnedVertexPosition[i2], skinnedVertexPosition[i2 + 1], skinnedVertexPosition[i2 + 2]);
			vec3.set(v3, skinnedVertexPosition[i3], skinnedVertexPosition[i3 + 1], skinnedVertexPosition[i3 + 2]);

			if (ray.intersectTriangle(v1, v2, v3, intersectionPoint)) {
				vec3.set(n1, skinnedVertexNormal[i1], skinnedVertexNormal[i1 + 1], skinnedVertexNormal[i1 + 2]);
				vec3.set(n2, skinnedVertexNormal[i2], skinnedVertexNormal[i2 + 1], skinnedVertexNormal[i2 + 2]);
				vec3.set(n3, skinnedVertexNormal[i3], skinnedVertexNormal[i3 + 1], skinnedVertexNormal[i3 + 2]);



				i1 = 2 * indices[i];
				i2 = 2 * indices[i + 1];
				i3 = 2 * indices[i + 2];
				vec2.set(uv1, textureCoords[i1], textureCoords[i1 + 1]);
				vec2.set(uv2, textureCoords[i2], textureCoords[i2 + 1]);
				vec2.set(uv3, textureCoords[i3], textureCoords[i3 + 1]);

				getUV(uv, intersectionPoint, v1, v2, v3, uv1, uv2, uv3);
				getNormal(intersectionNormal, intersectionPoint, v1, v2, v3, n1, n2, n3);

				let x = intersectionNormal[0];
				let y = intersectionNormal[1];
				let z = intersectionNormal[2];

				//Tranform the normal with the world matrix
				intersectionNormal[0] = worldMatrix[0] * x + worldMatrix[4] * y + worldMatrix[8] * z;
				intersectionNormal[1] = worldMatrix[1] * x + worldMatrix[5] * y + worldMatrix[9] * z;
				intersectionNormal[2] = worldMatrix[2] * x + worldMatrix[6] * y + worldMatrix[10] * z;

				vec3.transformMat4(intersectionPoint, intersectionPoint, worldMatrix);
				intersections.push(ray.createIntersection(intersectionPoint, intersectionNormal, uv, this, 0));
			}
		}
	}

	get entityName() {
		return 'Skeletal mesh';
	}
}
