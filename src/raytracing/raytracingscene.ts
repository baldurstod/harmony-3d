import { quat, vec3, vec4 } from 'gl-matrix';
import { float32, uint32 } from 'harmony-types';
import { AmbientLight } from '../lights/ambientlight';
import { Light } from '../lights/light';
import { SpotLight } from '../lights/spotlight';
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
	v0: vec4,
	v1: vec4,
	v2: vec4,
	v3: vec4,
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
	v2_indices: Uint8ClampedArray,
	v2_tris: Uint8ClampedArray,
	v2_nodes: Uint8ClampedArray,
	v2_lights: Uint8ClampedArray,
	nodesUsed: number,
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
	const lights: Light[] = [];
	const materials = new Map<Material, RaytracingMaterial | null>();
	let materialIndex = 2;

	for (const entity of entitites) {
		if ((entity as Mesh).isMesh) {
			meshes.push(entity as Mesh);

			const material = (entity as Mesh).getMaterial();
			if (!materials.has(material)) {
				let rtMaterials = material.getRaytracingMaterial(materialIndex++);
				materials.set(material, rtMaterials);
			}
		} else if ((entity as Light).isLight && !(entity as AmbientLight).isAmbientLight) {
			lights.push(entity as Light);
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
		lights,
	);
}

async function loadModels(context: RayTracingContext, meshes: Mesh[], sceneMaterials: Map<Material, RaytracingMaterial | null>, lights: Light[]): Promise<RayTracingScene> {
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
			context.MATERIALS_COUNT = sceneMaterials.size + 2;
			const numFloatsPerMaterial = 8;

			// Add a material for lights
			const textures: RtTextureDescriptors = [emptyTexture, emptyTexture, emptyTexture, emptyTexture, emptyTexture, emptyTexture, emptyTexture, emptyTexture];
			materials.push({
				materialType: 0,
				reflectionRatio: 0,
				reflectionGloss: 0,
				refractionIndex: 0,
				albedo: vec3.create(),
				textures,
				v0: vec4.create(),
				v1: vec4.create(),
				v2: vec4.create(),
				v3: vec4.create(),
			});

			materials.push({
				materialType: 0xFFFFFFFF,
				reflectionRatio: 0,
				reflectionGloss: 0,
				refractionIndex: 0,
				albedo: vec3.create(),
				textures,
				v0: vec4.create(),
				v1: vec4.create(),
				v2: vec4.create(),
				v3: vec4.create(),
			});

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
					v0: mtl.v0 ?? vec4.create(),
					v1: mtl.v1 ?? vec4.create(),
					v2: mtl.v2 ?? vec4.create(),
					v3: mtl.v3 ?? vec4.create(),
				});
			}
		}
	}

	const start = performance.now();
	const context_v2 = buildBVH_v2(meshes, sceneMaterials);
	//console.info(context_v2.bvhNodes);
	const end = performance.now();
	console.info(`Building bvh took ${end - start} ms`);

	const TRI_SIZE = 36;// 7 * vec3 aligned + 3 * vec2 + 2 align = 20 f32
	const LIGHT_SIZE = 17;

	//const v2_indicesBuffer = new ArrayBuffer(context_v2.triIdx.length * Uint32Array.BYTES_PER_ELEMENT);//context_v2.triIdx.length * Uint32Array.BYTES_PER_ELEMENT);
	const v2_trisBuffer = new ArrayBuffer(context_v2.triIdx.length * TRI_SIZE * Float32Array.BYTES_PER_ELEMENT);
	const v2_nodesBuffer = new ArrayBuffer(context_v2.nodesUsed * 8 * Float32Array.BYTES_PER_ELEMENT);// 2 * vec4 per node

	const v2_indices = new Uint8ClampedArray(context_v2.triIdx.buffer);//context_v2.triIdx);//context_v2.triIdx.length * Uint32Array.BYTES_PER_ELEMENT);
	const v2_tris = new Uint8ClampedArray(v2_trisBuffer);//context_v2.triIdx.length * 12 * Float32Array.BYTES_PER_ELEMENT);// 3 * vec4 per tri
	const v2_nodes = new Uint8ClampedArray(v2_nodesBuffer);//context_v2.nodesUsed * 8 * Float32Array.BYTES_PER_ELEMENT);// 2 * vec4 per node
	const v2_lights = new Uint8ClampedArray(lights.length * LIGHT_SIZE * Float32Array.BYTES_PER_ELEMENT);

	const trisFloat = new Float32Array(v2_trisBuffer);
	const trisUint32 = new Uint32Array(v2_trisBuffer);
	const nodesFloat = new Float32Array(v2_nodesBuffer);
	const nodesUint32 = new Uint32Array(v2_nodesBuffer);

	const tris = context_v2.tris;
	for (let i = 0; i < tris.length; i++) {
		const tri = tris[i]!;
		const j = i * TRI_SIZE;
		trisFloat.set(tri.vertex0, j + 0);
		trisUint32[j + 3] = tri.materialIdx;
		trisFloat.set(tri.vertex1, j + 4);
		trisUint32[j + 7] = tri.flatShading ? 1 : 0;
		trisFloat.set(tri.vertex2, j + 8);

		trisFloat.set(tri.normal0, j + 12);
		trisFloat.set(tri.normal1, j + 16);
		trisFloat.set(tri.normal2, j + 20);

		trisFloat.set(tri.uv0, j + 24);
		trisFloat.set(tri.uv1, j + 26);
		trisFloat.set(tri.uv2, j + 28);

		trisFloat.set(tri.faceNormal, j + 32);
	}

	const bvhNodes = context_v2.bvhNodes;
	for (let i = 0; i < context_v2.nodesUsed; i++) {
		const bvhNode = bvhNodes[i]!;
		const j = i * 8;
		nodesFloat.set(bvhNode.aabbMin, j + 0);
		nodesFloat.set(bvhNode.aabbMax, j + 4);

		nodesUint32[j + 3] = bvhNode.leftFirst;
		nodesUint32[j + 7] = bvhNode.triCount;
	}

	const lightsFloat = new Float32Array(v2_lights.buffer);
	const lightsUint32 = new Uint32Array(v2_lights.buffer);

	const tmpV = vec3.create();
	const tmpQ = quat.create();
	for (let i = 0; i < lights.length; i++) {
		const light = lights[i]!;

		const j = i * LIGHT_SIZE;

		lightsFloat.set(light.getWorldPosition(tmpV), j + 0);		// position
		lightsUint32[j + 3] = light.getRaytracingLight();			// type
		lightsFloat.set(light.getWorldOrientation(tmpQ), j + 4);	// orientation
		lightsFloat.set(light.color, j + 8);						// color
		lightsFloat[j + 11] = light.intensity;						// intensity
		lightsFloat[j + 12] = (light as SpotLight).innerAngle;		// inner angle
		lightsFloat[j + 13] = (light as SpotLight).angle;			// outer angle
		lightsFloat[j + 14] = light.range;							// range
		lightsFloat[j + 15] = light.radius;							// radius
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
		v2_indices,
		v2_tris,
		v2_nodes,
		v2_lights,
		nodesUsed: context_v2.nodesUsed,
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

type Tri = {
	vertex0: vec3, vertex1: vec3, vertex2: vec3,
	normal0: vec3, normal1: vec3, normal2: vec3,
	uv0: vec3, uv1: vec3, uv2: vec3,
	centroid: vec3;
	materialIdx: number;
	flatShading: boolean;
	faceNormal: vec3;
};

class BVHNode {
	readonly aabbMin: vec3 = vec3.create();
	readonly aabbMax: vec3 = vec3.create();
	leftFirst!: number;
	triCount!: number;
	static readonly #tmp = vec3.create();

	//union { struct { float3 aabbMin; uint leftFirst; }; __m128 aabbMin4; };
	//union { struct { float3 aabbMax; uint triCount; }; __m128 aabbMax4; };
	isLeaf(): boolean { return this.triCount > 0; }
	grow(p: vec3): void {
		vec3.min(this.aabbMin, this.aabbMin, p);
		vec3.max(this.aabbMax, this.aabbMax, p);
	}

	area(): number {
		const tmp = BVHNode.#tmp;
		vec3.sub(tmp, this.aabbMax, this.aabbMin)
		return tmp[0] * tmp[1] + tmp[1] * tmp[2] + tmp[2] * tmp[0];
	}
};

class Aabb {
	readonly bmin = vec3.fromValues(Infinity, Infinity, Infinity);
	readonly bmax = vec3.fromValues(-Infinity, -Infinity, - Infinity);
	static readonly #tmp = vec3.create();

	grow(p: vec3): void {
		vec3.min(this.bmin, this.bmin, p);
		vec3.max(this.bmax, this.bmax, p);
	}

	growAabb(b: Aabb): void {
		if (b.bmin[0] != Infinity) {
			this.grow(b.bmin);
			this.grow(b.bmax);
		}
	}

	area(): number {
		const tmp = Aabb.#tmp;
		vec3.sub(tmp, this.bmax, this.bmin)
		return tmp[0] * tmp[1] + tmp[1] * tmp[2] + tmp[2] * tmp[0];
	}

	reset() {
		vec3.set(this.bmin, Infinity, Infinity, Infinity);
		vec3.set(this.bmax, -Infinity, -Infinity, - Infinity);
	}
};

type Context_V2 = {
	triIdx: Uint32Array;
	tris: Tri[];
	bvhNodes: BVHNode[];
	nodesUsed: number;

	bin: Bin[];
	leftArea: number[];
	rightArea: number[];
	leftCount: number[];
	rightCount: number[];
}

const rootNodeIdx = 0;
function buildBVH_v2(meshes: Mesh[], materials: Map<Material, RaytracingMaterial | null>): Context_V2 {
	const tris = createTris(meshes, materials);

	// create the BVH node pool
	const triCount = tris.length;
	const bvhNodes: BVHNode[] = new Array(triCount * 2);
	const triIdx = new Uint32Array(triCount);

	// populate triangle index array
	for (let i = 0; i < triCount; i++) {
		triIdx[i] = i;
		// calculate triangle centroids for partitioning
		const tri = tris[i]!;
		tri.centroid[0] = (tri.vertex0[0] + tri.vertex1[0] + tri.vertex2[0]) * 0.3333;
		tri.centroid[1] = (tri.vertex0[1] + tri.vertex1[1] + tri.vertex2[1]) * 0.3333;
		tri.centroid[2] = (tri.vertex0[2] + tri.vertex1[2] + tri.vertex2[2]) * 0.3333;
	}

	// assign all triangles to root node
	const rootNode = new BVHNode();
	bvhNodes[rootNodeIdx] = rootNode;
	bvhNodes[rootNodeIdx + 1] = new BVHNode();
	rootNode.leftFirst = 0, rootNode.triCount = triCount;

	// Prepare arrays for findBestSplitPlane
	const bin: Bin[] = new Array(BINS);
	for (let i = 0; i < BINS; i++) {
		bin[i] = new Bin();//{ bounds: new Aabb(), triCount: 0 };
	}

	const leftArea: number[] = new Array(BINS - 1);
	const rightArea: number[] = new Array(BINS - 1);
	const leftCount: number[] = new Array(BINS - 1);
	const rightCount: number[] = new Array(BINS - 1);

	for (let i = 0; i < BINS - 1; i++) {
		leftArea[i] = 0;//new Bin();//{ bounds: new Aabb(), triCount: 0 };
		rightArea[i] = 0;//new Bin();//{ bounds: new Aabb(), triCount: 0 };
		leftCount[i] = 0;//new Bin();//{ bounds: new Aabb(), triCount: 0 };
		rightCount[i] = 0;//new Bin();//{ bounds: new Aabb(), triCount: 0 };
	}

	const context: Context_V2 = {
		bvhNodes,
		triIdx,
		tris,
		nodesUsed: 2,
		bin,
		leftArea,
		rightArea,
		leftCount,
		rightCount,
	};

	updateNodeBounds(rootNodeIdx, context);
	// subdivide recursively
	subdivide(rootNodeIdx, context);
	return context;
}

function updateNodeBounds(nodeIdx: number, context: Context_V2): void {
	const node = context.bvhNodes[nodeIdx]!;
	const triIdx = context.triIdx;
	const tris = context.tris;
	vec3.set(node.aabbMin, Infinity, Infinity, Infinity);
	vec3.set(node.aabbMax, -Infinity, -Infinity, - Infinity);

	for (let first = node.leftFirst, i = 0; i < node.triCount; i++) {
		const leafTriIdx = triIdx[first + i]!;
		const leafTri = tris[leafTriIdx]!;

		node.grow(leafTri.vertex0);
		node.grow(leafTri.vertex1);
		node.grow(leafTri.vertex2);
	}
}

function subdivide(nodeIdx: number, context: Context_V2): void {
	// terminate recursion
	const bvhNodes = context.bvhNodes;
	const node = bvhNodes[nodeIdx]!;
	const triIdx = context.triIdx;
	const tris = context.tris;
	// determine split axis using SAH
	const [splitCost, axis, splitPos] = findBestSplitPlane(node, context);
	const nosplitCost = calculateNodeCost(node);
	if (splitCost >= nosplitCost) {
		return;
	}

	// in-place partition
	let i = node.leftFirst;
	let j = i + node.triCount - 1;
	while (i <= j) {
		if (tris[triIdx[i]!]!.centroid[axis]! < splitPos) {
			i++;
		} else {
			const t = triIdx[i]!;
			triIdx[i] = triIdx[j]!;
			triIdx[j] = t;
			--j;
		}
	}
	// abort split if one of the sides is empty
	const leftCount = i - node.leftFirst;
	if (leftCount == 0 || leftCount == node.triCount) {
		return;
	}
	// create child nodes
	const leftChildIdx = context.nodesUsed++;
	const rightChildIdx = context.nodesUsed++;


	const leftNode = new BVHNode();
	const rightNode = new BVHNode();
	bvhNodes[leftChildIdx] = leftNode;
	bvhNodes[rightChildIdx] = rightNode;


	leftNode.leftFirst = node.leftFirst;
	leftNode.triCount = leftCount;
	rightNode.leftFirst = i;
	rightNode.triCount = node.triCount - leftCount;
	node.leftFirst = leftChildIdx;
	node.triCount = 0;
	updateNodeBounds(leftChildIdx, context);
	updateNodeBounds(rightChildIdx, context);
	// recurse
	subdivide(leftChildIdx, context);
	subdivide(rightChildIdx, context);
}

function subdivide_removeme(nodeIdx: number, context: Context_V2): void {
	// terminate recursion
	const bvhNodes = context.bvhNodes;
	const node = bvhNodes[nodeIdx]!;
	const triIdx = context.triIdx;
	const tris = context.tris;
	// determine split axis using SAH
	let bestAxis = -1;
	let bestPos = 0, bestCost = Infinity;
	for (let axis = 0; axis < 3; axis++) {
		for (let i = 0; i < node.triCount; i++) {
			const triangle = tris[triIdx[node.leftFirst + i]!]!;
			const candidatePos = triangle.centroid[axis]!;
			const cost = evaluateSAH(node, axis as 0 | 1 | 2, candidatePos, context);
			if (cost < bestCost) {
				bestPos = candidatePos, bestAxis = axis, bestCost = cost;
			}
		}
	}
	const axis = bestAxis;
	const splitPos = bestPos;
	//float3 e = node.aabbMax - node.aabbMin; // extent of parent
	const parentArea = node.area();//e.x * e.y + e.y * e.z + e.z * e.x;
	const parentCost = node.triCount * parentArea;
	if (bestCost >= parentCost) return;
	// in-place partition
	let i = node.leftFirst;
	let j = i + node.triCount - 1;
	while (i <= j) {
		if (tris[triIdx[i]!]!.centroid[axis]! < splitPos) {
			i++;
		} else {
			const t = triIdx[i]!;
			triIdx[i] = triIdx[j]!;
			triIdx[j] = t;
			--j;
		}
	}
	// abort split if one of the sides is empty
	const leftCount = i - node.leftFirst;
	if (leftCount == 0 || leftCount == node.triCount) {
		return;
	}
	// create child nodes
	const leftChildIdx = context.nodesUsed++;
	const rightChildIdx = context.nodesUsed++;


	const leftNode = new BVHNode();
	const rightNode = new BVHNode();
	bvhNodes[leftChildIdx] = leftNode;
	bvhNodes[rightChildIdx] = rightNode;


	leftNode.leftFirst = node.leftFirst;
	leftNode.triCount = leftCount;
	rightNode.leftFirst = i;
	rightNode.triCount = node.triCount - leftCount;
	node.leftFirst = leftChildIdx;
	node.triCount = 0;
	updateNodeBounds(leftChildIdx, context);
	updateNodeBounds(rightChildIdx, context);
	// recurse
	subdivide(leftChildIdx, context);
	subdivide(rightChildIdx, context);
}

class Bin {
	readonly bounds: Aabb = new Aabb();
	triCount: number = 0;

	reset(): void {
		this.bounds.reset();
		this.triCount = 0;
	}
};

const BINS = 8;

function findBestSplitPlane(node: BVHNode, context: Context_V2): [number, number, number] {
	const triIdx = context.triIdx;
	const tris = context.tris;

	let axis: 0 | 1 | 2 = 0, splitPos: number = 0;

	let bestCost = Infinity;
	for (let a = 0; a < 3; a++) {
		let boundsMin = Infinity, boundsMax = -Infinity;
		for (let i = 0; i < node.triCount; i++) {
			const triangle: Tri = tris[triIdx[node.leftFirst + i]!]!;
			boundsMin = Math.min(boundsMin, triangle.centroid[a]!);
			boundsMax = Math.max(boundsMax, triangle.centroid[a]!);
		}
		if (boundsMin === boundsMax) {
			continue;
		}
		// populate the bins
		const bin: Bin[] = context.bin;
		for (let i = 0; i < BINS; i++) {
			bin[i]!.reset();// = { bounds: new Aabb(), triCount: 0 };
		}
		let scale = BINS / (boundsMax - boundsMin);
		for (let i = 0; i < node.triCount; i++) {
			const triangle: Tri = tris[triIdx[node.leftFirst + i]!]!;
			const binIdx = Math.min(BINS - 1, Math.floor((triangle.centroid[a]! - boundsMin) * scale));
			bin[binIdx]!.triCount++;
			bin[binIdx]!.bounds.grow(triangle.vertex0);
			bin[binIdx]!.bounds.grow(triangle.vertex1);
			bin[binIdx]!.bounds.grow(triangle.vertex2);
		}

		// gather data for the 7 planes between the 8 bins
		const leftArea = context.leftArea;//new Array(BINS - 1);
		const rightArea = context.rightArea;//new Array(BINS - 1);
		const leftCount = context.leftCount;//new Array(BINS - 1);
		const rightCount = context.rightCount;//new Array(BINS - 1);

		for (let i = 0; i < BINS - 1; i++) {
			leftArea[i]! = 0;//.reset();// = { bounds: new Aabb(), triCount: 0 };
			rightArea[i]! = 0;//.reset();// = { bounds: new Aabb(), triCount: 0 };
			leftCount[i]! = 0;//.reset();// = { bounds: new Aabb(), triCount: 0 };
			rightCount[i]! = 0;//.reset();// = { bounds: new Aabb(), triCount: 0 };
		}

		const leftBox = new Aabb(), rightBox = new Aabb();
		let leftSum = 0, rightSum = 0;
		for (let i = 0; i < BINS - 1; i++) {
			leftSum += bin[i]!.triCount;
			leftCount[i] = leftSum;
			leftBox.growAabb(bin[i]!.bounds);
			leftArea[i] = leftBox.area();
			rightSum += bin[BINS - 1 - i]!.triCount;
			rightCount[BINS - 2 - i] = rightSum;
			rightBox.growAabb(bin[BINS - 1 - i]!.bounds);
			rightArea[BINS - 2 - i] = rightBox.area();
		}

		// calculate SAH cost for the 7 planes
		scale = (boundsMax - boundsMin) / BINS;
		for (let i = 0; i < BINS - 1; i++) {
			const planeCost = leftCount[i]! * leftArea[i]! + rightCount[i]! * rightArea[i]!;
			if (planeCost < bestCost) {
				axis = a as 0 | 1 | 2, splitPos = boundsMin + scale * (i + 1), bestCost = planeCost;
			}
		}
	}
	return [bestCost, axis, splitPos];
}

function calculateNodeCost(node: BVHNode): number {
	return node.triCount * node.area();
}

function evaluateSAH(node: BVHNode, axis: 0 | 1 | 2, pos: number, context: Context_V2): number {
	const triIdx = context.triIdx;
	const tris = context.tris;
	// determine triangle counts and bounds for this split candidate
	const leftBox = new Aabb, rightBox = new Aabb;
	let leftCount = 0, rightCount = 0;
	for (let i = 0; i < node.triCount; i++) {
		const triangle = tris[triIdx[node.leftFirst + i]!]!;
		if (triangle.centroid[axis] < pos) {
			leftCount++;
			leftBox.grow(triangle.vertex0);
			leftBox.grow(triangle.vertex1);
			leftBox.grow(triangle.vertex2);
		}
		else {
			rightCount++;
			rightBox.grow(triangle.vertex0);
			rightBox.grow(triangle.vertex1);
			rightBox.grow(triangle.vertex2);
		}
	}
	const cost = leftCount * leftBox.area() + rightCount * rightBox.area();
	return cost > 0 ? cost : Infinity;
}

function createTris(meshes: Mesh[], materials: Map<Material, RaytracingMaterial | null>): Tri[] {
	const p1p0Diff = vec3.create();
	const p2p0Diff = vec3.create();

	const tris: Tri[] = [];
	for (const mesh of meshes) {
		const rtMaterial = materials.get(mesh.getMaterial());
		if (!rtMaterial) {
			continue;
		}
		const obj = mesh.exportObj(true);

		const faces = obj.f;
		const vertexPos = obj.v!;
		const vertexNormal = obj.vn!;
		const vertexCoord = obj.vt!;

		for (let vertexIndex = 0; vertexIndex < faces.length; vertexIndex += 3) {
			const i0 = faces[vertexIndex + 0]!;
			const i1 = faces[vertexIndex + 1]!;
			const i2 = faces[vertexIndex + 2]!;

			const vertex0 = new Float32Array(vertexPos.buffer, i0 * 4 * 3, 3);
			const vertex1 = new Float32Array(vertexPos.buffer, i1 * 4 * 3, 3);
			const vertex2 = new Float32Array(vertexPos.buffer, i2 * 4 * 3, 3);

			const normal0 = new Float32Array(vertexNormal.buffer, i0 * 4 * 3, 3);
			const normal1 = new Float32Array(vertexNormal.buffer, i1 * 4 * 3, 3);
			const normal2 = new Float32Array(vertexNormal.buffer, i2 * 4 * 3, 3);

			const uv0 = new Float32Array(vertexCoord.buffer, i0 * 4 * 2, 2);
			const uv1 = new Float32Array(vertexCoord.buffer, i1 * 4 * 2, 2);
			const uv2 = new Float32Array(vertexCoord.buffer, i2 * 4 * 2, 2);

			vec3.sub(p1p0Diff, vertex1, vertex0);
			vec3.sub(p2p0Diff, vertex2, vertex0);
			const faceNormal = vec3.cross(vec3.create(), p1p0Diff, p2p0Diff);
			vec3.normalize(faceNormal, faceNormal);

			tris.push({
				vertex0,
				vertex1,
				vertex2,
				normal0,
				normal1,
				normal2,
				uv0,
				uv1,
				uv2,
				centroid: vec3.create(),
				materialIdx: rtMaterial.index,
				faceNormal,
				flatShading: rtMaterial.flatShading,
			});
		}
	}

	return tris;
}
