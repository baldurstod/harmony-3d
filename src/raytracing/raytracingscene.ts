import { vec3, vec4 } from 'gl-matrix';
import { float32, uint32 } from 'harmony-types';
import { Material } from '../materials/material';
import { Mesh } from '../objects/mesh';
import { SkeletalMesh } from '../objects/skeletalmesh';
import { Scene } from '../scenes/scene';
import { BV, Face } from './bv';
import { RaytracingMaterial } from './material';

type RtMaterial = {
	materialType: uint32,
	reflectionRatio: float32,
	reflectionGloss: float32,
	refractionIndex: float32,
	albedo: vec3,
};

type RayTracingScene = {
	materials: RtMaterial[],
	faces: Uint8ClampedArray,
	aabbs: Uint8ClampedArray,
	MODELS_COUNT: number,
	MAX_NUM_BVs_PER_MESH: number,
	MAX_NUM_FACES_PER_MESH: number,
}

type RayTracingContext = {
	MODELS_COUNT: number;
	MAX_NUM_FACES_PER_MESH: number;
	MATERIALS_COUNT: number;
	MAX_NUM_BVs_PER_MESH: number;
	AABBS_COUNT: number;
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

export function sceneToRtScene(scene: Scene): RayTracingScene {
	const entitites = scene.getRenderableList();
	const meshes: Mesh[] = [];
	const materials = new Map<Material, RaytracingMaterial>();
	let materialIndex = 0;

	for (const entity of entitites) {
		if ((entity as Mesh).isMesh) {
			meshes.push(entity as Mesh);

			const material = (entity as Mesh).getMaterial();
			if (!materials.has(material)) {
				materials.set(material, material.getRaytracingMaterial(materialIndex++));
			}
		}
	}

	return loadModels(
		{
			MODELS_COUNT: 0,
			MAX_NUM_FACES_PER_MESH: 0,
			MATERIALS_COUNT: 0,
			MAX_NUM_BVs_PER_MESH: 0,
			AABBS_COUNT: 0,
		},
		meshes,
		materials,
	);
}

function loadModels(context: RayTracingContext, meshes: Mesh[], sceneMaterials: Map<Material, RaytracingMaterial>): RayTracingScene {
	const sceneModels = parseModel(meshes, sceneMaterials);

	context.MODELS_COUNT = sceneModels.length;

	let faces: Uint8ClampedArray;
	let aabbs: Uint8ClampedArray;
	const materials: RtMaterial[] = [];
	// Prepare faces buffer
	{
		context.MAX_NUM_FACES_PER_MESH = sceneModels.reduce(
			(max, obj) => Math.max(max, obj.faces.length),
			0,
		);
		const numFloatsPerFace = 28;
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
				faceData[idx + 24] = face.fn[0];
				faceData[idx + 25] = face.fn[1];
				faceData[idx + 26] = face.fn[2];

				faceColorData[idx + 27] = face.mi;

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
				materials.push({
					materialType: mtl.materialType,
					reflectionRatio: mtl.reflectionRatio,
					reflectionGloss: mtl.reflectionGloss,
					refractionIndex: mtl.refractionIndex,
					albedo: mtl.albedo,
				})
			}
		}
	}
	return {
		materials: materials,
		faces,
		aabbs,
		MODELS_COUNT: context.MODELS_COUNT,
		MAX_NUM_BVs_PER_MESH: context.MAX_NUM_BVs_PER_MESH,
		MAX_NUM_FACES_PER_MESH: context.MAX_NUM_FACES_PER_MESH,
	}
}

function parseModel(meshes: Mesh[], materials: Map<Material, RaytracingMaterial>): ParsedModel[] {
	//let posArray: { x: number; y: number; z: number }[] = [];
	//let nrmArray: { x: number; y: number; z: number }[] = [];

	console.log(meshes);

	const fn = vec3.create();
	const p1p0Diff = vec3.create();
	const p2p0Diff = vec3.create();

	return meshes.map((mesh, i) => {
		const obj = mesh.exportObj(true);
		const rtMaterial = materials.get(mesh.getMaterial())!;

		const outFaces: Face[] = [];
		const faces = obj.f;
		const vertexPos = obj.v!;
		const vertexNormal = obj.vn!;

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
				fn: vec3.clone(fn),
				fi: outFaces.length,
				mi: rtMaterial.index //(mesh instanceof SkeletalMesh ? 5 : 4),//TODO materials.findIndex(({ name }) => name === f.material),
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
		return {
			faces: outFaces,
			AABBs: outAABBs,
		};
	});
}


// TODO: remove that
const sceneMaterials =
	[
		{
			"albedo": vec4.fromValues(
				0.8500000238418579,
				0,
				0,
				1
			),
			"mtlType": 3,
			"reflectionRatio": 0,
			"reflectionGloss": 1,
			"refractionIndex": 1
		},
		{
			"albedo": vec4.fromValues(
				0,
				0.3199999928474426,
				0,
				1
			),
			"mtlType": 3,
			"reflectionRatio": 0,
			"reflectionGloss": 1,
			"refractionIndex": 1
		},
		{
			"albedo": vec4.fromValues(
				0.800000011920929,
				0.800000011920929,
				0.800000011920929,
				1
			),
			"mtlType": 3,
			"reflectionRatio": 0,
			"reflectionGloss": 1,
			"refractionIndex": 1
		},
		{
			"albedo": vec4.fromValues(
				0.800000011920929,
				0.800000011920929,
				0.800000011920929,
				1
			),
			"mtlType": 1,
			"reflectionRatio": 0.2,
			"reflectionGloss": 0.4,
			"refractionIndex": 1
		},
		{
			"albedo": vec4.fromValues(
				6,
				6,
				6,
				1
			),
			"mtlType": 0,
			"reflectionRatio": 0,
			"reflectionGloss": 1,
			"refractionIndex": 1
		},
		{
			"albedo": vec4.fromValues(
				0.901960015296936,
				0.49411699175834656,
				0.1333329975605011,
				1
			),
			"mtlType": 1,
			"reflectionRatio": 0.1,
			"reflectionGloss": 1,
			"refractionIndex": 0.1
		},
		{
			"albedo": vec4.fromValues(
				0.16078400611877441,
				0.5,
				0.7254899740219116,
				1
			),
			"mtlType": 1,
			"reflectionRatio": 1,
			"reflectionGloss": 0.4,
			"refractionIndex": 1.523
		},
		{
			"albedo": vec4.fromValues(
				1,
				1,
				1,
				1
			),
			"mtlType": 3,
			"reflectionRatio": 0,
			"reflectionGloss": 1,
			"refractionIndex": 1
		},
		{
			"albedo": vec4.fromValues(
				0.13598400354385376,
				0.13424600660800934,
				0.11277300119400024,
				1
			),
			"mtlType": 3,
			"reflectionRatio": 0,
			"reflectionGloss": 1,
			"refractionIndex": 1
		},
		{
			"albedo": vec4.fromValues(
				1,
				1,
				1,
				1
			),
			"mtlType": 3,
			"reflectionRatio": 0,
			"reflectionGloss": 1,
			"refractionIndex": 1
		}
	]
