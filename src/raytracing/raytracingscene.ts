import { vec3, vec4 } from 'gl-matrix';
import { float32, uint32 } from 'harmony-types';
import { Material } from '../materials/material';
import { Mesh } from '../objects/mesh';
import { Scene } from '../scenes/scene';
import { Texture } from '../textures/texture';
import { GL_REPEAT } from '../webgl/constants';
import { BV, Face } from './bv';
import { RaytracingMaterial } from './material';

export type RtTextureDescriptor = {
	width: uint32,
	height: uint32,
	offset: uint32,
	elements: uint32,
	repeat: uint32,
	layers: uint32,
};

export const emptyTexture: RtTextureDescriptor = {
	width: 0,
	height: 0,
	offset: 0xffffffff,
	elements: 0,
	repeat: 0,
	layers: 0,
}

type RtTextureDescriptors = [RtTextureDescriptor, RtTextureDescriptor, RtTextureDescriptor, RtTextureDescriptor, RtTextureDescriptor, RtTextureDescriptor, RtTextureDescriptor, RtTextureDescriptor];

type RtMaterial = {
	materialType: uint32,
	reflectionRatio: float32,
	reflectionGloss: float32,
	refractionIndex: float32,
	albedo: vec3,
	textures: RtTextureDescriptors,
};

type RayTracingScene = {
	materials: (RtMaterial | null)[],
	faces: Uint8ClampedArray,
	facesCount: number,
	aabbsCount: number,
	aabbs: Uint8ClampedArray,
	textures: Float32Array,
	MODELS_COUNT: number,
	MAX_NUM_BVs_PER_MESH: number,
	MAX_NUM_FACES_PER_MESH: number,
}

type RayTracingContext = {
	MODELS_COUNT: number;
	facesCount: number;
	MAX_NUM_FACES_PER_MESH: number;
	MATERIALS_COUNT: number;
	MAX_NUM_BVs_PER_MESH: number;
	AABBS_COUNT: number;
	textures: Float32Array;
	textureDescriptors: Map<Texture, RtTextureDescriptor>;
}

interface Model {
	name: string;
	vertices: { x: number; y: number; z: number }[];
	vertexNormals: { x: number; y: number; z: number }[];
	material: string;
	faces: {
		vertices: {
			vertexIndex: number;
			textureCoordsIndex: number;
			vertexNormalIndex: number;
		}[];
	}[];
}

interface ParsedModel {
	faces: Face[];
	AABBs: BV[];
}

export async function sceneToRtScene(scene: Scene): Promise<RayTracingScene> {
	const entitites = scene.getRenderableList();
	const meshes: Mesh[] = [];
	const materials = new Map<Material, RaytracingMaterial | null>();
	let materialIndex = 0;

	for (const entity of entitites) {
		if ((entity as Mesh).isMesh) {
			meshes.push(entity as Mesh);

			const material = (entity as Mesh).getMaterial();
			if (!materials.has(material)) {
				let rtMaterials = material.getRaytracingMaterial(materialIndex++);
				materials.set(material, rtMaterials);
			}
		}
	}

	return loadModels(
		{
			MODELS_COUNT: 0,
			facesCount: 0,
			MAX_NUM_FACES_PER_MESH: 0,
			MATERIALS_COUNT: 0,
			MAX_NUM_BVs_PER_MESH: 0,
			AABBS_COUNT: 0,
			textures: new Float32Array(),
			textureDescriptors: new Map<Texture, RtTextureDescriptor>(),
		},
		meshes,
		materials,
	);
}

async function loadModels(context: RayTracingContext, meshes: Mesh[], sceneMaterials: Map<Material, RaytracingMaterial | null>): Promise<RayTracingScene> {
	const sceneModels = parseModel(meshes, sceneMaterials);

	context.MODELS_COUNT = sceneModels.length;

	let faces: Uint8ClampedArray;
	let aabbs: Uint8ClampedArray;
	const materials: (RtMaterial | null)[] = [];
	// Prepare faces buffer
	{
		context.MAX_NUM_FACES_PER_MESH = sceneModels.reduce(
			(max, obj) => Math.max(max, obj.faces.length),
			0,
		);
		context.facesCount = sceneModels.reduce(
			(value, obj) => value + obj.faces.length,
			0,
		);
		const numFloatsPerFace = 64;
		faces = new Uint8ClampedArray(
			numFloatsPerFace *
			Float32Array.BYTES_PER_ELEMENT *
			context.MAX_NUM_FACES_PER_MESH *// TODO: fix that: variable faces per mesh
			context.MODELS_COUNT
		)

		const faceData = new Float32Array(faces.buffer);
		const faceColorData = new Uint32Array(faces.buffer);

		for (let i = 0; i < context.MODELS_COUNT; i++) {
			const modelFaces = sceneModels[i]!.faces;
			let idx = i * numFloatsPerFace * context.MAX_NUM_FACES_PER_MESH;
			for (const face of modelFaces) {
				faceData[idx + 0] = face.p0[0];
				faceData[idx + 1] = face.p0[1];
				faceData[idx + 2] = face.p0[2];
				// idx + 3 padding
				faceData[idx + 4] = face.p1[0];
				faceData[idx + 5] = face.p1[1];
				faceData[idx + 6] = face.p1[2];
				// idx + 7 padding
				faceData[idx + 8] = face.p2[0];
				faceData[idx + 9] = face.p2[1];
				faceData[idx + 10] = face.p2[2];
				// idx + 11 padding
				faceData[idx + 12] = face.n0[0];
				faceData[idx + 13] = face.n0[1];
				faceData[idx + 14] = face.n0[2];
				// idx + 15 padding
				faceData[idx + 16] = face.n1[0];
				faceData[idx + 17] = face.n1[1];
				faceData[idx + 18] = face.n1[2];
				// idx + 19 padding
				faceData[idx + 20] = face.n2[0];
				faceData[idx + 21] = face.n2[1];
				faceData[idx + 22] = face.n2[2];
				// idx + 23 padding
				faceData[idx + 24] = face.ta0[0];
				faceData[idx + 25] = face.ta0[1];
				faceData[idx + 26] = face.ta0[2];
				// idx + 27 padding
				faceData[idx + 28] = face.ta1[0];
				faceData[idx + 29] = face.ta1[1];
				faceData[idx + 30] = face.ta1[2];
				// idx + 31 padding
				faceData[idx + 32] = face.ta2[0];
				faceData[idx + 33] = face.ta2[1];
				faceData[idx + 34] = face.ta2[2];
				// idx + 35 padding
				// idx + 36 bitangent
				// idx + 37 bitangent
				// idx + 38 bitangent
				// idx + 39 padding
				// idx + 40 bitangent
				// idx + 41 bitangent
				// idx + 42 bitangent
				// idx + 43 padding
				// idx + 44 bitangent
				// idx + 45 bitangent
				// idx + 46 bitangent
				// idx + 47 padding
				faceData[idx + 48] = face.t0[0];
				faceData[idx + 49] = face.t0[1];
				faceData[idx + 50] = face.t1[0];
				faceData[idx + 51] = face.t1[1];
				faceData[idx + 52] = face.t2[0];
				faceData[idx + 53] = face.t2[1];
				// idx + 44 padding
				// idx + 55 padding
				faceData[idx + 56] = face.fn[0];
				faceData[idx + 57] = face.fn[1];
				faceData[idx + 58] = face.fn[2];

				faceColorData[idx + 59] = face.mi;
				faceColorData[idx + 60] = face.flatShading ? 1 : 0;

				idx += numFloatsPerFace;
			}
		}
	}

	// Prepare AABBS buffer
	{

		context.MAX_NUM_BVs_PER_MESH = sceneModels.reduce(
			(val: number, obj) => Math.max(val, obj.AABBs.length),
			0,
		);
		const numFloatsPerBV = 12;

		context.AABBS_COUNT = context.MAX_NUM_BVs_PER_MESH * context.MODELS_COUNT;

		aabbs = new Uint8ClampedArray(numFloatsPerBV * Float32Array.BYTES_PER_ELEMENT * context.AABBS_COUNT)

		const aabbPosData = new Float32Array(aabbs.buffer);
		const aabbIdxData = new Int32Array(aabbs.buffer);

		for (let i = 0; i < context.MODELS_COUNT; i++) {
			const modelAABBs = sceneModels[i]!.AABBs;
			let idx = numFloatsPerBV * context.MAX_NUM_BVs_PER_MESH * i;
			for (const aabb of modelAABBs) {
				aabbPosData[idx + 0] = aabb.min[0];
				aabbPosData[idx + 1] = aabb.min[1];
				aabbPosData[idx + 2] = aabb.min[2];
				aabbPosData[idx + 3] = 1;
				aabbPosData[idx + 4] = aabb.max[0];
				aabbPosData[idx + 5] = aabb.max[1];
				aabbPosData[idx + 6] = aabb.max[2];
				aabbIdxData[idx + 7] = aabb.lt;
				aabbIdxData[idx + 8] = aabb.rt;
				aabbIdxData[idx + 9] = aabb.fi[0]!;
				aabbIdxData[idx + 10] = aabb.fi[1]!;
				aabbIdxData[idx + 11] = 0; // padding
				idx += numFloatsPerBV;
			}
		}

		// Prepare materials buffer
		{
			context.MATERIALS_COUNT = sceneMaterials.size;
			const numFloatsPerMaterial = 8;

			for (const [, mtl] of sceneMaterials) {
				if (!mtl) {
					materials.push(null);
					continue;
				}
				const textures: RtTextureDescriptors = [emptyTexture, emptyTexture, emptyTexture, emptyTexture, emptyTexture, emptyTexture, emptyTexture, emptyTexture];
				if (mtl.textures) {
					for (const [id, tex] of mtl.textures) {
						if (tex) {
							textures[id] = await getTextureDescriptor(context, tex);
						}
					}
				}

				materials.push({
					materialType: mtl.materialType,
					reflectionRatio: mtl.reflectionRatio,
					reflectionGloss: mtl.reflectionGloss,
					refractionIndex: mtl.refractionIndex,
					albedo: mtl.albedo,
					textures,
				});
			}
		}
	}
	return {
		materials,
		faces,
		facesCount: context.facesCount,
		aabbs,
		aabbsCount: context.AABBS_COUNT,
		textures: context.textures,
		MODELS_COUNT: context.MODELS_COUNT,
		MAX_NUM_BVs_PER_MESH: context.MAX_NUM_BVs_PER_MESH,
		MAX_NUM_FACES_PER_MESH: context.MAX_NUM_FACES_PER_MESH,
	}
}

function parseModel(meshes: Mesh[], materials: Map<Material, RaytracingMaterial | null>): ParsedModel[] {
	const fn = vec3.create();
	const p1p0Diff = vec3.create();
	const p2p0Diff = vec3.create();

	const models: ParsedModel[] = [];

	for (const mesh of meshes) {
		const obj = mesh.exportObj(true);
		const rtMaterial = materials.get(mesh.getMaterial());
		if (!rtMaterial) {
			continue;
		}

		const outFaces: Face[] = [];
		const faces = obj.f;
		const vertexPos = obj.v!;
		const vertexNormal = obj.vn!;
		const vertexTangent = obj.tangent;
		const vertexBitangent = obj.bitangent;
		const vertexCoord = obj.vt!;

		let ta0: vec3;
		let ta1: vec3;
		let ta2: vec3;

		let bta0: vec3;
		let bta1: vec3;
		let bta2: vec3;
		for (let vertexIndex = 0; vertexIndex < faces.length; vertexIndex += 3) {
			const i0 = faces[vertexIndex + 0]!;
			const i1 = faces[vertexIndex + 1]!;
			const i2 = faces[vertexIndex + 2]!;

			const p0 = new Float32Array(vertexPos.buffer, i0 * 4 * 3, 3);
			const p1 = new Float32Array(vertexPos.buffer, i1 * 4 * 3, 3);
			const p2 = new Float32Array(vertexPos.buffer, i2 * 4 * 3, 3);

			const n0 = new Float32Array(vertexNormal.buffer, i0 * 4 * 3, 3);
			const n1 = new Float32Array(vertexNormal.buffer, i1 * 4 * 3, 3);
			const n2 = new Float32Array(vertexNormal.buffer, i2 * 4 * 3, 3);

			if (vertexTangent) {
				ta0 = new Float32Array(vertexTangent.buffer, i0 * 4 * 3, 3);
				ta1 = new Float32Array(vertexTangent.buffer, i1 * 4 * 3, 3);
				ta2 = new Float32Array(vertexTangent.buffer, i2 * 4 * 3, 3);
			} else {
				ta0 = vec3.create();
				ta1 = vec3.create();
				ta2 = vec3.create();
			}

			if (vertexBitangent) {
				bta0 = new Float32Array(vertexBitangent.buffer, i0 * 4 * 3, 3);
				bta1 = new Float32Array(vertexBitangent.buffer, i1 * 4 * 3, 3);
				bta2 = new Float32Array(vertexBitangent.buffer, i2 * 4 * 3, 3);
			} else {
				bta0 = vec3.create();
				bta1 = vec3.create();
				bta2 = vec3.create();
			}

			const t0 = new Float32Array(vertexCoord.buffer, i0 * 4 * 2, 2);
			const t1 = new Float32Array(vertexCoord.buffer, i1 * 4 * 2, 2);
			const t2 = new Float32Array(vertexCoord.buffer, i2 * 4 * 2, 2);

			vec3.sub(p1p0Diff, p1, p0);
			vec3.sub(p2p0Diff, p2, p0);
			vec3.cross(fn, p1p0Diff, p2p0Diff);
			vec3.normalize(fn, fn);
			outFaces.push({
				p0,
				p1,
				p2,
				n0,
				n1,
				n2,
				ta0,
				ta1,
				ta2,
				t0,
				t1,
				t2,
				fn: vec3.clone(fn),
				fi: outFaces.length,
				mi: rtMaterial.index,
				flatShading: rtMaterial.flatShading,
			});
		}

		const outAABBs: BV[] = [];
		// find root BV dimensions
		const min = vec4.fromValues(
			Number.MAX_SAFE_INTEGER,
			Number.MAX_SAFE_INTEGER,
			Number.MAX_SAFE_INTEGER,
			1,
		);
		const max = vec4.fromValues(
			Number.MIN_SAFE_INTEGER,
			Number.MIN_SAFE_INTEGER,
			Number.MIN_SAFE_INTEGER,
			1,
		);
		for (const face of outFaces) {
			// calculate min/max for root AABB bounding volume
			min[0] = Math.min(min[0], face.p0[0], face.p1[0], face.p2[0]);
			min[1] = Math.min(min[1], face.p0[1], face.p1[1], face.p2[1]);
			min[2] = Math.min(min[2], face.p0[2], face.p1[2], face.p2[2]);
			max[0] = Math.max(max[0], face.p0[0], face.p1[0], face.p2[0]);
			max[1] = Math.max(max[1], face.p0[1], face.p1[1], face.p2[1]);
			max[2] = Math.max(max[2], face.p0[2], face.p1[2], face.p2[2]);
		}

		if (max[0] - min[0] < BV.BV_MIN_DELTA) {
			max[0] += BV.BV_MIN_DELTA;
		}
		if (max[1] - min[1] < BV.BV_MIN_DELTA) {
			max[1] += BV.BV_MIN_DELTA;
		}
		if (max[2] - min[2] < BV.BV_MIN_DELTA) {
			max[2] += BV.BV_MIN_DELTA;
		}
		const bv = new BV(min, max);

		outAABBs.push(bv);
		bv.subdivide(outFaces, outAABBs);
		models.push({
			faces: outFaces,
			AABBs: outAABBs,
		});
	};
	return models;
}

async function getTextureDescriptor(context: RayTracingContext, texture: Texture): Promise<RtTextureDescriptor> {
	let descriptor = context.textureDescriptors.get(texture);
	if (!descriptor) {
		descriptor = await addToGlobalTextureData(context, texture);
		context.textureDescriptors.set(texture, descriptor);
	}
	return descriptor;
}

async function addToGlobalTextureData(context: RayTracingContext, texture: Texture): Promise<RtTextureDescriptor> {
	const offset = context.textures.length;
	const datas = await texture.getDatas();

	const old = context.textures;
	context.textures = new Float32Array(context.textures.length + datas.length);
	context.textures.set(old);

	context.textures.set(datas, old.length);

	let repeat = 0;
	if (texture.wrapS === GL_REPEAT) {
		repeat += 1;
	}

	if (texture.wrapT === GL_REPEAT) {
		repeat += 2;
	}

	return {
		width: texture.width,
		height: texture.height,
		offset,
		elements: texture.elementsPerTexel,
		repeat,
		layers: texture.isCube ? 6 : 1,
	}
}
