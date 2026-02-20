import { mat4, vec2, vec3 } from 'gl-matrix';
import { int32 } from 'harmony-types';
import { MAX_HARDWARE_BONES } from '../constants';
import { BoundingBox } from '../math/boundingbox';
import { getNormal, getUV } from '../math/triangle';
import { Intersection } from '../raycasting/intersection';
import { Ray } from '../raycasting/ray';
import { Raycaster } from '../raycasting/raycaster';
import { ControlPoint } from '../sourceengine/export';
import { Bone } from './bone';
import { Mesh, MeshParameters, ObjDatas } from './mesh';
import { Skeleton } from './skeleton';

const IDENTITY_MAT4 = mat4.create();

const v1 = vec3.create();
const v2 = vec3.create();
const v3 = vec3.create();
const n1 = vec3.create();
const n2 = vec3.create();
const n3 = vec3.create();
const uv1 = vec2.create();
const uv2 = vec2.create();
const uv3 = vec2.create();
const intersectionPoint = vec3.create();
const intersectionNormal = vec3.create();
const ray = new Ray();
const uv = vec2.create();

export type SkeletalMeshParameters = MeshParameters & {
	skeleton: Skeleton,
};

export class SkeletalMesh extends Mesh {
	isSkeletalMesh = true;
	#bonesPerVertex = 3;
	skeleton: Skeleton;
	#skinnedVertexPosition?: Float32Array;
	#skinnedVertexNormal?: Float32Array;

	constructor(params: SkeletalMeshParameters) {
		super(params);
		this.skeleton = params.skeleton;

		this.setUniform('uBoneMatrix', this.skeleton.getTexture());
		this.setUniform('boneMatrix', this.skeleton.imgData);
		this.setDefine('HARDWARE_SKINNING');//TODOv3 proper defines
		this.setDefine('SKELETAL_MESH');
		this.setDefine('MAX_HARDWARE_BONES', MAX_HARDWARE_BONES);
	}

	set bonesPerVertex(bonesPerVertex) {
		this.#bonesPerVertex = bonesPerVertex;
	}

	get bonesPerVertex() {
		return this.#bonesPerVertex;
	}

	exportObj(): ObjDatas {
		const ret: Record<string, Uint8Array | Uint32Array | Float32Array | []> = {};
		const skeletonBones = this.skeleton._bones;
		const attributes: Record<'f' | 'v' | 'vn' | 'vt', string> = { f: 'index', v: 'aVertexPosition', vn: 'aVertexNormal', vt: 'aTextureCoord' };
		const geometry = this.getGeometry();
		const vertexCount = geometry.getAttribute('aVertexPosition')!.count;
		const skinnedVertexPosition = new Float32Array(vertexCount * 3);
		const skinnedVertexNormal = new Float32Array(vertexCount * 3);
		const vertexPosition = geometry.getAttribute('aVertexPosition')!._array;
		const vertexNormal = geometry.getAttribute('aVertexNormal')!._array;
		const vertexBoneIndice = geometry.getAttribute('aBoneIndices')!._array;
		const vertexBoneWeight = geometry.getAttribute('aBoneWeight')!._array;
		const boneCount = geometry.getAttribute('aBoneIndices')!.itemSize;

		const tempVertex = vec3.create();
		const tempVertexNormal = vec3.create();
		const accumulateMat = mat4.create();

		if (vertexPosition && vertexBoneIndice && vertexBoneWeight) {
			for (let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex) {
				const vertexArrayIndex = vertexIndex * 3;
				const boneArrayIndex = vertexIndex * boneCount;

				accumulateMat[0] = 0; accumulateMat[1] = 0; accumulateMat[2] = 0;
				accumulateMat[4] = 0; accumulateMat[5] = 0; accumulateMat[6] = 0;
				accumulateMat[8] = 0; accumulateMat[9] = 0; accumulateMat[10] = 0;
				accumulateMat[12] = 0; accumulateMat[13] = 0; accumulateMat[14] = 0;

				tempVertex[0] = vertexPosition[vertexArrayIndex + 0]!;
				tempVertex[1] = vertexPosition[vertexArrayIndex + 1]!;
				tempVertex[2] = vertexPosition[vertexArrayIndex + 2]!;

				tempVertexNormal[0] = vertexNormal?.[vertexArrayIndex + 0] ?? 0;
				tempVertexNormal[1] = vertexNormal?.[vertexArrayIndex + 1] ?? 0;
				tempVertexNormal[2] = vertexNormal?.[vertexArrayIndex + 2] ?? 0;

				for (let boneIndex = 0; boneIndex < boneCount; ++boneIndex) {
					const boneArrayIndex2 = boneArrayIndex + boneIndex;
					const bone = skeletonBones[vertexBoneIndice[boneArrayIndex2] ?? -1];
					const boneMat = bone ? bone.boneMat : IDENTITY_MAT4;
					const boneWeight = vertexBoneWeight[boneArrayIndex2];

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

		for (const objAttribute in attributes) {
			const geometryAttribute = attributes[objAttribute as ('f' | 'v' | 'vn' | 'vt')]!;
			if (geometry.getAttribute(geometryAttribute)) {
				if (geometryAttribute == 'aVertexPosition') {
					ret[objAttribute as ('f' | 'v' | 'vn' | 'vt')] = skinnedVertexPosition;
				} else if (geometryAttribute == 'aVertexNormal') {
					ret[objAttribute as ('f' | 'v' | 'vn' | 'vt')] = skinnedVertexNormal;
				} else {
					const webglAttrib = geometry.getAttribute(geometryAttribute);
					if (webglAttrib && webglAttrib._array) {
						ret[objAttribute as ('f' | 'v' | 'vn' | 'vt')] = webglAttrib._array as Uint8Array | Uint32Array | Float32Array;
					}
				}
			} else {
				ret[objAttribute as ('f' | 'v' | 'vn' | 'vt')] = [];
			}
		}
		return ret as ObjDatas;
	}

	getRandomPointOnModel(
		out: vec3,
		initialVec: vec3,
		controlPoint: ControlPoint,
		numTriesToGetAPointInsideTheModel: int32,
		directionBias: vec3,
		boundingBoxScale: number,
		bones: [Bone, number][],
		hitBoxRelativeCoordOut: vec3 | undefined,
	): int32 {
		//TODO: optimize this stuff
		const ret = {};
		const skeletonBones = this.skeleton._bones;
		//let attributes = {f:'index',v:'aVertexPosition',vn:'aVertexNormal',vt:'aTextureCoord'};
		const geometry = this.getGeometry();
		const vertexCount = geometry.getAttribute('aVertexPosition')!.count;
		const skinnedVertexPosition = new Float32Array(vertexCount * 3);
		const vertexPosition = geometry.getAttribute('aVertexPosition')!._array;
		const vertexBoneIndice = geometry.getAttribute('aBoneIndices')!._array;
		const vertexBoneWeight = geometry.getAttribute('aBoneWeight')!._array;
		const boneCount = geometry.getAttribute('aBoneIndices')!.itemSize;

		const tempVertex = vec3.create();
		const accumulateMat = mat4.create();


		function RandomInt(max: number) {
			return Math.floor(Math.random() * max)
		}

		const vertexIndex = RandomInt(vertexCount);
		out[0] = 0;
		out[1] = 0;
		out[2] = 0;
		if (vertexPosition && vertexBoneIndice && vertexBoneWeight) {
			//for (let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex)
			{
				const vertexArrayIndex = vertexIndex * 3;
				const boneArrayIndex = vertexIndex * boneCount;

				accumulateMat[0] = 0; accumulateMat[1] = 0; accumulateMat[2] = 0;
				accumulateMat[4] = 0; accumulateMat[5] = 0; accumulateMat[6] = 0;
				accumulateMat[8] = 0; accumulateMat[9] = 0; accumulateMat[10] = 0;
				accumulateMat[12] = 0; accumulateMat[13] = 0; accumulateMat[14] = 0;

				out[0] = vertexPosition[vertexArrayIndex + 0] ?? 0;
				out[1] = vertexPosition[vertexArrayIndex + 1] ?? 0;
				out[2] = vertexPosition[vertexArrayIndex + 2] ?? 0;
				vec3.copy(initialVec, out);

				for (let boneIndex = 0; boneIndex < boneCount; ++boneIndex) {
					const boneArrayIndex2 = boneArrayIndex + boneIndex;
					const bone = skeletonBones[vertexBoneIndice[boneArrayIndex2] ?? -1];
					const boneMat = bone ? bone.boneMat : IDENTITY_MAT4;
					const boneWeight = vertexBoneWeight[boneArrayIndex2] ?? 0;
					if (bones && bone) {
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
				vec3.transformMat4(out, out, accumulateMat);
			}
		}
		return -1;
	}

	getBoundingBox(boundingBox = new BoundingBox()) {
		const ret = {};
		const skeletonBones = this.skeleton._bones;
		const attributes = { f: 'index', v: 'aVertexPosition', vn: 'aVertexNormal', vt: 'aTextureCoord' };
		const geometry = this.getGeometry();
		const indexAttribute = geometry.getAttribute('index'/*TODO: create a constant*/);
		const vertexAttribute = geometry.getAttribute('aVertexPosition');
		const indexCount = indexAttribute!.count;
		const vertexCount = vertexAttribute!.count;
		const skinnedVertexPosition = new Float32Array(vertexCount * 3);
		const skinnedVertexNormal = new Float32Array(vertexCount * 3);
		const indexValue = indexAttribute!._array;
		const vertexPosition = vertexAttribute!._array;
		const vertexNormal = geometry.getAttribute('aVertexNormal')!._array;
		const vertexBoneIndice = geometry.getAttribute('aBoneIndices')!._array;
		const vertexBoneWeight = geometry.getAttribute('aBoneWeight')!._array;
		const boneCount = geometry.getAttribute('aBoneIndices')!.itemSize;

		const tempVertex = vec3.create();
		const accumulateMat = mat4.create();

		if (vertexPosition && vertexBoneIndice && vertexBoneWeight && indexValue) {
			for (let index = 0; index < indexCount; ++index) {
				const vertexIndex = indexValue[index]!;

				const vertexArrayIndex = vertexIndex * 3;
				const boneArrayIndex = vertexIndex * boneCount;

				accumulateMat[0] = 0; accumulateMat[1] = 0; accumulateMat[2] = 0;
				accumulateMat[4] = 0; accumulateMat[5] = 0; accumulateMat[6] = 0;
				accumulateMat[8] = 0; accumulateMat[9] = 0; accumulateMat[10] = 0;
				accumulateMat[12] = 0; accumulateMat[13] = 0; accumulateMat[14] = 0;

				tempVertex[0] = vertexPosition[vertexArrayIndex + 0] ?? 0;
				tempVertex[1] = vertexPosition[vertexArrayIndex + 1] ?? 0;
				tempVertex[2] = vertexPosition[vertexArrayIndex + 2] ?? 0;

				for (let boneIndex = 0; boneIndex < boneCount; ++boneIndex) {
					const boneArrayIndex2 = boneArrayIndex + boneIndex;
					const bone = skeletonBones[vertexBoneIndice[boneArrayIndex2] ?? -1];
					const boneMat = bone ? bone.boneMat : IDENTITY_MAT4;
					const boneWeight = vertexBoneWeight[boneArrayIndex2];

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
		const skeletonBones = this.skeleton._bones;
		const geometry = this.getGeometry();
		const vertexCount = geometry.getAttribute('aVertexPosition')!.count;
		const skinnedVertexPosition = new Float32Array(vertexCount * 3);
		const skinnedVertexNormal = new Float32Array(vertexCount * 3);
		const vertexPosition = geometry.getAttribute('aVertexPosition')!._array;
		const vertexNormal = geometry.getAttribute('aVertexNormal')!._array;
		const vertexBoneIndice = geometry.getAttribute('aBoneIndices')!._array;
		const vertexBoneWeight = geometry.getAttribute('aBoneWeight')!._array;
		const boneCount = geometry.getAttribute('aBoneIndices')!.itemSize;

		const tempVertex = vec3.create();
		const tempVertexNormal = vec3.create();
		const accumulateMat = mat4.create();

		if (vertexPosition && vertexNormal && vertexBoneIndice && vertexBoneWeight) {
			for (let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex) {
				const vertexArrayIndex = vertexIndex * 3;
				const boneArrayIndex = vertexIndex * boneCount;

				accumulateMat[0] = 0; accumulateMat[1] = 0; accumulateMat[2] = 0;
				accumulateMat[4] = 0; accumulateMat[5] = 0; accumulateMat[6] = 0;
				accumulateMat[8] = 0; accumulateMat[9] = 0; accumulateMat[10] = 0;
				accumulateMat[12] = 0; accumulateMat[13] = 0; accumulateMat[14] = 0;

				tempVertex[0] = vertexPosition[vertexArrayIndex + 0]!;
				tempVertex[1] = vertexPosition[vertexArrayIndex + 1]!;
				tempVertex[2] = vertexPosition[vertexArrayIndex + 2]!;

				const tempVertexNormalX = vertexNormal[vertexArrayIndex + 0] ?? 0;
				const tempVertexNormalY = vertexNormal[vertexArrayIndex + 1] ?? 0;
				const tempVertexNormalZ = vertexNormal[vertexArrayIndex + 2] ?? 0;

				for (let boneIndex = 0; boneIndex < boneCount; ++boneIndex) {
					const boneArrayIndex2 = boneArrayIndex + boneIndex;
					const bone = skeletonBones[vertexBoneIndice[boneArrayIndex2] ?? -1];
					const boneMat = bone ? bone.boneMat : IDENTITY_MAT4;
					const boneWeight = vertexBoneWeight[boneArrayIndex2];

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
		this.#skinnedVertexPosition = skinnedVertexPosition;
		this.#skinnedVertexNormal = skinnedVertexNormal;

	}

	raycast(raycaster: Raycaster, intersections: Intersection[]): void {
		//TODO: case when normals are not provided
		const skeletonBones = this.skeleton._bones;
		const geometry = this.getGeometry();
		const indices = geometry.getAttribute('index')!._array;
		//let normals = geometry.getAttribute('aVertexNormal')._array;
		if (!indices) {
			return;
		}

		const vertexCount = geometry.getAttribute('aVertexPosition')!.count;
		const skinnedVertexPosition = new Float32Array(vertexCount * 3);
		const skinnedVertexNormal = new Float32Array(vertexCount * 3);
		const textureCoords = geometry.getAttribute('aTextureCoord')!._array;

		const worldMatrix = this.worldMatrix;
		ray.copyTransform(raycaster.ray, worldMatrix);

		const vertexPosition = geometry.getAttribute('aVertexPosition')!._array;
		const vertexNormal = geometry.getAttribute('aVertexNormal')!._array;
		const vertexBoneIndice = geometry.getAttribute('aBoneIndices')!._array;
		const vertexBoneWeight = geometry.getAttribute('aBoneWeight')!._array;

		const boneCount = geometry.getAttribute('aBoneIndices')!.itemSize;
		const tempVertex = vec3.create();
		const tempVertexNormal = vec3.create();
		const accumulateMat = mat4.create();

		if (vertexPosition && vertexNormal && vertexBoneIndice && vertexBoneWeight) {
			for (let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex) {
				const vertexArrayIndex = vertexIndex * 3;
				const boneArrayIndex = vertexIndex * boneCount;

				accumulateMat[0] = 0; accumulateMat[1] = 0; accumulateMat[2] = 0;
				accumulateMat[4] = 0; accumulateMat[5] = 0; accumulateMat[6] = 0;
				accumulateMat[8] = 0; accumulateMat[9] = 0; accumulateMat[10] = 0;
				accumulateMat[12] = 0; accumulateMat[13] = 0; accumulateMat[14] = 0;

				tempVertex[0] = vertexPosition[vertexArrayIndex + 0] ?? 0;
				tempVertex[1] = vertexPosition[vertexArrayIndex + 1] ?? 0;
				tempVertex[2] = vertexPosition[vertexArrayIndex + 2] ?? 0;

				tempVertexNormal[0] = vertexNormal[vertexArrayIndex + 0] ?? 0;
				tempVertexNormal[1] = vertexNormal[vertexArrayIndex + 1] ?? 0;
				tempVertexNormal[2] = vertexNormal[vertexArrayIndex + 2] ?? 0;

				for (let boneIndex = 0; boneIndex < boneCount; ++boneIndex) {
					const boneArrayIndex2 = boneArrayIndex + boneIndex;
					const bone = skeletonBones[vertexBoneIndice[boneArrayIndex2] ?? -1];
					const boneMat = bone ? bone.boneMat : IDENTITY_MAT4;
					const boneWeight = vertexBoneWeight[boneArrayIndex2];

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
			let i1 = 3 * indices[i]!;
			let i2 = 3 * indices[i + 1]!;
			let i3 = 3 * indices[i + 2]!;

			vec3.set(v1, skinnedVertexPosition[i1] ?? 0, skinnedVertexPosition[i1 + 1] ?? 0, skinnedVertexPosition[i1 + 2] ?? 0);
			vec3.set(v2, skinnedVertexPosition[i2] ?? 0, skinnedVertexPosition[i2 + 1] ?? 0, skinnedVertexPosition[i2 + 2] ?? 0);
			vec3.set(v3, skinnedVertexPosition[i3] ?? 0, skinnedVertexPosition[i3 + 1] ?? 0, skinnedVertexPosition[i3 + 2] ?? 0);

			if (ray.intersectTriangle(v1, v2, v3, intersectionPoint)) {
				vec3.set(n1, skinnedVertexNormal[i1] ?? 0, skinnedVertexNormal[i1 + 1] ?? 0, skinnedVertexNormal[i1 + 2] ?? 0);
				vec3.set(n2, skinnedVertexNormal[i2] ?? 0, skinnedVertexNormal[i2 + 1] ?? 0, skinnedVertexNormal[i2 + 2] ?? 0);
				vec3.set(n3, skinnedVertexNormal[i3] ?? 0, skinnedVertexNormal[i3 + 1] ?? 0, skinnedVertexNormal[i3 + 2] ?? 0);



				i1 = 2 * indices[i]!;
				i2 = 2 * indices[i + 1]!;
				i3 = 2 * indices[i + 2]!;
				vec2.set(uv1, textureCoords?.[i1] ?? 0, textureCoords?.[i1 + 1] ?? 0);
				vec2.set(uv2, textureCoords?.[i2] ?? 0, textureCoords?.[i2 + 1] ?? 0);
				vec2.set(uv3, textureCoords?.[i3] ?? 0, textureCoords?.[i3 + 1] ?? 0);

				getUV(uv, intersectionPoint, v1, v2, v3, uv1, uv2, uv3);
				getNormal(intersectionNormal, intersectionPoint, v1, v2, v3, n1, n2, n3);

				const x = intersectionNormal[0];
				const y = intersectionNormal[1];
				const z = intersectionNormal[2];

				//Tranform the normal with the world matrix
				intersectionNormal[0] = worldMatrix[0] * x + worldMatrix[4] * y + worldMatrix[8] * z;
				intersectionNormal[1] = worldMatrix[1] * x + worldMatrix[5] * y + worldMatrix[9] * z;
				intersectionNormal[2] = worldMatrix[2] * x + worldMatrix[6] * y + worldMatrix[10] * z;

				vec3.transformMat4(intersectionPoint, intersectionPoint, worldMatrix);
				intersections.push(ray.createIntersection(intersectionPoint, intersectionNormal, uv, this, 0));
			}
		}
	}

	getSkinnedVertex(): [Float32Array, Float32Array] {
		this.prepareRayCasting();
		return [this.#skinnedVertexPosition!, this.#skinnedVertexNormal!];
	}

	static getEntityName() {
		return 'Skeletal mesh';
	}
}
