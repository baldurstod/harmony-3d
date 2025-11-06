import { mat4, quat, vec3, vec4 } from 'gl-matrix';
import { FBX_PROPERTY_FLAG_STATIC, FBX_PROPERTY_TYPE_COLOR_3, FBX_PROPERTY_TYPE_DOUBLE, FBX_SKELETON_TYPE_LIMB, FBXAnimCurveNode, FBXAnimLayer, FBXAnimStack, FBXCamera, FBXCluster, FBXExporter, FBXManager, FBXMesh, FBXNode, FBXPose, FBXScene, fbxSceneToFBXFile, FBXSkeleton, FBXSkin, FBXSurfacePhong, FBXTexture, FBXVideo } from 'harmony-fbx';
import { DEBUG } from '../buildoptions';
import { Camera } from '../cameras/camera';
import { DynamicParams, Entity } from '../entities/entity';
import { Graphics } from '../graphics/graphics2';
import { Material } from '../materials/material';
import { HALF_PI } from '../math/constants';
import { quatToEulerDeg } from '../math/quaternion';
import { Bone } from '../objects/bone';
import { Mesh } from '../objects/mesh';
import { SkeletalMesh } from '../objects/skeletalmesh';
import { Skeleton } from '../objects/skeleton';
import { FullScreenQuad } from '../primitives/fullscreenquad';
import { Scene } from '../scenes/scene';
import { Source1ModelInstance } from '../sourceengine/export';

const EXPORT_SKELETON = true;
const EXPORT_ANIM_CURVE = false;
const ROTATE_Z = quat.create();
quat.rotateX(ROTATE_Z, ROTATE_Z, -HALF_PI);

const tempMat4 = mat4.create();

type FbxContext = {
	exportedBones: Map<Bone | Skeleton, FBXNode>,
	animStackPerEntity: Map<any, any>,
	animLayerPerEntity: Map<any, any>,
	[key: string]: any,
}/*TODO: create a context type*/;
type FbxBoneData = { bi: Map<number, number[]>, bw: Map<number, number[]> };

export async function exportToBinaryFBX(entity: Entity) {
	const fbxManager = new FBXManager();
	const fbxFile = fbxSceneToFBXFile(await entityToFBXScene(fbxManager, entity));
	return new FBXExporter().exportBinary(fbxFile);
}

export async function entityToFBXScene(fbxManager: FBXManager, entity: Entity): Promise<FBXScene> {
	const fbxScene = fbxManager.createObject('FBXScene', 'Scene') as FBXScene;
	const playing = Graphics.isRunning();
	Graphics.pause();

	await createFBXSceneEntity(fbxScene, entity);

	if (playing) {
		Graphics.play();
	}
	return fbxScene;
}

async function createFBXSceneEntity(fbxScene: FBXScene, entity: Entity, context: FbxContext = {
	exportedBones: new Map(), animStackPerEntity: new Map(), animLayerPerEntity: new Map(),
}) {

	switch (true) {
		case (entity as Source1ModelInstance).isSource1ModelInstance:
			await createSource1ModelInstance(fbxScene, entity, context);
			break;
		case entity.is('Mesh'):
			await createFBXMesh(fbxScene, entity as Mesh, context);
			break;
		case entity.is('Camera'):
			await createFBXCamera(fbxScene, entity as Camera);
			break;
	}
	await createChildEntities(fbxScene, entity, context);
}

async function createChildEntities(fbxScene: FBXScene, entity: Entity, context: FbxContext) {
	for (const childEntity of entity.children) {
		await createFBXSceneEntity(fbxScene, childEntity, context);
	}
}

async function createSource1ModelInstance(fbxScene: FBXScene, entity: Entity, context: FbxContext) {
	const fbxManager = fbxScene.manager;
	let animStack: FBXAnimStack;
	let animLayer: FBXAnimLayer;
	animStack = context.animStackPerEntity.get(entity.parent);
	animLayer = context.animLayerPerEntity.get(entity.parent);
	if (!animStack) {
		animStack = fbxManager.createObject('FBXAnimStack', 'test FBXAnimStack') as FBXAnimStack;
		fbxScene.addObject(animStack);
		context.animStackPerEntity.set(entity, animStack);

		animLayer = fbxManager.createObject('FBXAnimLayer', 'test FBXAnimLayer') as FBXAnimLayer;
		animStack.add(animLayer);
	}


	const exportedBones = context.exportedBones;

	if (EXPORT_SKELETON && (entity as any/*TODO: create a skeleton entity interface*/).skeleton) {
		const bones = (entity as any/*TODO: create a skeleton entity interface*/).skeleton.bones;
		for (const bone of bones) {
			const limbNode = exportedBones.get(bone);
			if (DEBUG && !limbNode) {
				//throw 'Missing Limb node';
			}
			if (EXPORT_ANIM_CURVE && limbNode) {
				createAnimCurveNode(animLayer, limbNode);
			}
		}
	}
}

function createAnimCurveNode(fbxAnimLayer: FBXAnimLayer, limbNode: FBXNode) {
	const fbxManager = fbxAnimLayer.manager;
	const animCurveNode = fbxManager.createObject('FBXAnimCurveNode', 'T') as FBXAnimCurveNode;
	fbxAnimLayer.add(animCurveNode);

	const xProperty = animCurveNode.addChannel(FBX_PROPERTY_TYPE_DOUBLE, 'X', 0, 0);
	const yProperty = animCurveNode.addChannel(FBX_PROPERTY_TYPE_DOUBLE, 'Y', 0, 0);
	const zProperty = animCurveNode.addChannel(FBX_PROPERTY_TYPE_DOUBLE, 'Z', 0, 0);

	fbxAnimLayer.add(animCurveNode);



	const animCurveX = fbxManager.createObject('FBXAnimCurve', '');
	const animCurveY = fbxManager.createObject('FBXAnimCurve', '');
	const animCurveZ = fbxManager.createObject('FBXAnimCurve', '');
	//console.log(animCurve);
	//animCurveNode.addChild(animCurve);

	xProperty.connectSrcObject(animCurveX);
	yProperty.connectSrcObject(animCurveY);
	zProperty.connectSrcObject(animCurveZ);

	//console.log(limbNode.getAllProperties());
	//console.log(limbNode.findProperty('Lcl Translation'));
	//console.log(animCurveNode.findProperty('X'));

	const localTranslation = limbNode.findProperty('Lcl Translation');
	if (localTranslation) {
		localTranslation.connectSrcObject(animCurveNode);
	} else {
		throw 'Lcl Translation property is missing';
	}

	//animCurveNode.createProperty(FBX_PROPERTY_TYPE_DOUBLE, 0);
	return animCurveNode;
}

async function createFBXMesh(fbxScene: FBXScene, mesh: Mesh, context: FbxContext): Promise<void> {
	const fbxManager = fbxScene.manager;
	const meshPose = fbxManager.createObject('FBXPose', 'Pose ' + mesh.name) as FBXPose;
	fbxScene.addObject(meshPose);
	if (!mesh.exportObj || !mesh.isVisible() || !mesh.is('Mesh') || (mesh.parent as any /*TODO: create a particle entity interface*/)?.isParticleSystem) {
		return;
	}

	const fbxMeshNode = fbxManager.createObject('FBXNode', mesh.name) as FBXNode;
	fbxMeshNode.localRotation.value = quatToEulerDeg([0, 0, 0], quat.mul(quat.create(), ROTATE_Z, mesh.getWorldQuaternion()));
	fbxMeshNode.localTranslation.value = vec3.transformQuat(vec3.create(), mesh.getWorldPosition(), ROTATE_Z);
	fbxMeshNode.localScaling.value = mesh.getWorldScale();

	const fbxMaterial = fbxManager.createObject('FBXSurfacePhong', 'FBXSurfacePhong') as FBXSurfacePhong;
	fbxMaterial.name = 'mat_' + fbxMaterial.id + '.png';
	const fbxMesh = fbxManager.createObject('FBXMesh', 'Name me FBXMesh') as FBXMesh;
	fbxMeshNode.nodeAttribute = fbxMesh;
	fbxMeshNode.addMaterial(fbxMaterial);
	fbxScene.rootNode.addChild(fbxMeshNode);

	const meshMaterial = mesh.material;
	//console.log(meshMaterial);
	if (meshMaterial) {
		await configureMaterial(meshMaterial, fbxMaterial, mesh.materialsParams);
	}

	let meshDatas = mesh.exportObj() as { f?: Uint8Array | Uint32Array, v?: Float32Array, vn?: Float32Array, vt?: Float32Array, bi: Float32Array, bw: Float32Array };

	let meshDatasBi;
	let meshDatasBw;
	if (EXPORT_SKELETON && (mesh as any/*TODO: create a skeleton entity interface*/).skeleton && mesh.geometry) {
		meshDatas = {
			f: mesh.geometry.getAttribute('index')?._array,
			v: mesh.geometry.getAttribute('aVertexPosition')?._array,
			vn: mesh.geometry.getAttribute('aVertexNormal')?._array,
			vt: mesh.geometry.getAttribute('aTextureCoord')?._array,
			bi: mesh.geometry.getAttribute('aBoneIndices')?._array,
			bw: mesh.geometry.getAttribute('aBoneWeight')?._array,
		};

		meshDatasBi = meshDatas.bi;
		meshDatasBw = meshDatas.bw;
	}

	const boneIndexes = new Map<number, number[]>();
	const boneWeights = new Map<number, number[]>();

	const polygons: number[] = [];
	const edges: number[] = [];
	const uvIndex: number[] = [];
	const uv = [];

	const vertexIndices = meshDatas.f;
	if (!vertexIndices) {
		return;
	}
	let vertexIndex1;
	let vertexIndex2;
	let vertexIndex3;
	const remappedIndex = new Map<number, number>();
	let currentIndex = 0;
	const remappedVertices: number[] = [];
	const remappedNormals: number[] = [];
	const remappedUV: number[] = [];
	const remappedBoneIndices: number[] = [];
	const remappedBoneWeight: number[] = [];
	const bonesPerVertex = (mesh as SkeletalMesh).bonesPerVertex;

	function remapIndex(index: number) {
		if (remappedIndex.has(index)) {
			return remappedIndex.get(index);
		}

		const newIndex = currentIndex++;
		remappedIndex.set(index, newIndex);

		const vIndex = index * 3;
		const uvIndex = index * 2;
		if (meshDatas.v) {
			remappedVertices.push(meshDatas.v[vIndex]!, meshDatas.v[vIndex + 1]!, meshDatas.v[vIndex + 2]!);
		}
		if (meshDatas.vn) {
			remappedNormals.push(meshDatas.vn[vIndex]!, meshDatas.vn[vIndex + 1]!, meshDatas.vn[vIndex + 2]!);
		}
		if (meshDatas.vt) {
			remappedUV.push(meshDatas.vt[uvIndex]!, meshDatas.vt[uvIndex + 1]!);
		}

		if (EXPORT_SKELETON) {
			const boneIndex = index * bonesPerVertex;
			if (meshDatas.bi) {
				for (let j = 0; j < bonesPerVertex; ++j) {
					remappedBoneIndices.push(meshDatas.bi[boneIndex + j]!);
					remappedBoneWeight.push(meshDatas.bw[boneIndex + j]!);
				}
			}
		}

		return newIndex;
	}

	for (let i = 0, j = 0, l = vertexIndices.length; i < l; i += 3, j += 2) {
		vertexIndex1 = remapIndex(vertexIndices[i]!) ?? 0;
		vertexIndex2 = remapIndex(vertexIndices[i + 1]!) ?? 0;
		vertexIndex3 = remapIndex(vertexIndices[i + 2]!) ?? 0;
		polygons.push(vertexIndex1, vertexIndex2, ~vertexIndex3);
		uvIndex.push(vertexIndex1, vertexIndex2, vertexIndex3);
		edges.push(vertexIndex1, vertexIndex2, vertexIndex3);
	}

	if (EXPORT_SKELETON) {
		for (let vertexIndex = 0, l = remappedBoneIndices.length / bonesPerVertex; vertexIndex < l; ++vertexIndex) {
			for (let j = 0; j < bonesPerVertex; ++j) {
				const k = vertexIndex * bonesPerVertex + j;
				const boneIndex = remappedBoneIndices[k]!;
				const boneWeight = remappedBoneWeight[k]!;
				if (boneWeight != 0) {
					if (!boneIndexes.has(boneIndex)) {
						boneIndexes.set(boneIndex, []);
						boneWeights.set(boneIndex, []);
					}

					boneIndexes.get(boneIndex)?.push(vertexIndex);
					boneWeights.get(boneIndex)?.push(boneWeight);
				}
			}
		}
	}

	console.log(boneIndexes, boneWeights);

	fbxMesh.vertices = remappedVertices;
	fbxMesh.normals = remappedNormals;
	fbxMesh.polygons = polygons;
	fbxMesh.edges = edges;
	fbxMesh.uv = remappedUV;
	fbxMesh.uvIndex = uvIndex;

	//let attributes = {f:'index',v:'aVertexPosition',vn:'aVertexNormal',vt:'aTextureCoord'};

	/*let fbxModel = new FBXModel(fbxMesh, fbxMaterial);
	fbxModel.name = mesh.name;*/
	//fbxFile.addModel(fbxModel);
	if ((mesh as any/*TODO: create a skeleton entity interface*/).skeleton) {
		const boneDatas: FbxBoneData = { bi: boneIndexes, bw: boneWeights };
		//for (let i = 0; i < )
		if (EXPORT_SKELETON) {
			exportSkeleton(fbxScene, (mesh as SkeletalMesh/*TODO: create a skeleton entity interface*/).skeleton, context, fbxMesh, boneDatas, meshPose);
		}
	}
}

async function createFBXCamera(fbxScene: FBXScene, camera: Camera) {
	const fbxManager = fbxScene.manager;
	console.log(camera);
	const fbxCameraNode = fbxManager.createObject('FBXNode', camera.name) as FBXNode;
	const fbxCamera = fbxManager.createObject('FBXCamera', camera.name) as FBXCamera;
	fbxCameraNode.nodeAttribute = fbxCamera;

	//fbxCamera.position.value = camera.position;
	fbxCameraNode.localTranslation.value = camera.position;
	const angles = quatToEulerDeg([0, 0, 0], camera.quaternion);
	//fbxCameraNode.localRotation.value = angles;

	fbxCameraNode.parent = fbxScene.rootNode;//TODO: set the actual parent
}

//NodeAttribute -> Model -> cluster (subdeformer) -> skin(deformer) -> geometry
//38772576 -> 39350848 -> 49570336 -> 49569504 -> 39673840 samba dancing

function exportSkeleton(fbxScene: FBXScene, skeleton: Skeleton, context: FbxContext, fbxMesh: FBXMesh, boneDatas: FbxBoneData, meshPose: FBXPose) {
	const fbxManager = fbxScene.manager;
	const fbxSkin = fbxManager.createObject('FBXSkin', skeleton.name) as FBXSkin;
	const exportedClusters = new WeakMap();
	fbxSkin.geometry = fbxMesh;
	for (const bone of skeleton.bones) {
		exportBone(fbxScene, bone, context, exportedClusters, fbxSkin, boneDatas, meshPose);
	}
}

function exportBone(fbxScene: FBXScene, bone: Bone, context: FbxContext, exportedClusters: WeakMap<Bone, FBXCluster>, fbxSkin: FBXSkin, boneDatas: FbxBoneData, meshPose: FBXPose) {
	const fbxManager = fbxScene.manager;
	const boneParent = (bone.parent as Bone | undefined) ?? bone.getSkeleton();
	const boneParentSkeletonBone = bone.parentSkeletonBone;
	if (boneParent) {
		if ((boneParent as Bone).isBone) {
			// Ensure the parent is already exported
			exportBone(fbxScene, (boneParent as Bone), context, exportedClusters, fbxSkin, boneDatas, meshPose);
		} else {
			// it's a skeleton
		}
	} else {// DO WHAT ?
	}


	// Export this very bone
	const exportedBones = context.exportedBones;
	let fbxBone: FBXNode | undefined = exportedBones.get(bone);
	if (fbxBone) {
		// do nothing
	} else {
		if (boneParentSkeletonBone) {
			fbxBone = exportedBones.get(boneParentSkeletonBone);
		}
		if (fbxBone) {
			exportedBones.set(bone, fbxBone);
		} else {
			fbxBone = fbxManager.createObject('FBXNode', bone.name) as FBXNode;

			const angles = vec3.create();
			const transformedQuat = quat.create();
			const transformedVec = vec3.create();

			if (boneParentSkeletonBone) {
				if ((boneParent as Skeleton).isSkeleton) {
					fbxBone.localTranslation.value = vec3.transformQuat(transformedVec, boneParentSkeletonBone.worldPos, ROTATE_Z);
					quat.mul(transformedQuat, ROTATE_Z, boneParentSkeletonBone.worldQuat);
					quatToEulerDeg(angles, transformedQuat);
				} else {
					fbxBone.localTranslation.value = boneParentSkeletonBone.position;
					quatToEulerDeg(angles, boneParentSkeletonBone.quaternion);
				}
			} else {
				if ((boneParent as Skeleton).isSkeleton) {
					fbxBone.localTranslation.value = vec3.transformQuat(transformedVec, bone.worldPos, ROTATE_Z);
					quat.mul(transformedQuat, ROTATE_Z, bone.worldQuat);
					quatToEulerDeg(angles, transformedQuat);
				} else {
					fbxBone.localTranslation.value = bone.position;
					quatToEulerDeg(angles, bone.quaternion);
				}
			}

			meshPose.add(fbxBone, bone.boneMat, true);

			fbxBone.localRotation.value = angles;


			const fbxLimb = fbxManager.createObject('FBXSkeleton', 'Name me FBXSkeleton', FBX_SKELETON_TYPE_LIMB) as FBXSkeleton;
			fbxBone.nodeAttribute = fbxLimb;

			fbxBone.parent = (boneParent && exportedBones.get(boneParent)) ?? fbxScene.rootNode;

			exportedBones.set(bone, fbxBone);
		}
	}


	if (!exportedClusters.has(bone)) {

		const fbxCluster = fbxManager.createObject('FBXCluster', bone.name) as FBXCluster;
		fbxCluster.transformMatrix = bone.poseToBone;
		fbxCluster.transformLinkMatrix = mat4.invert(tempMat4, bone.poseToBone);
		fbxCluster.link = fbxBone;

		const boneIndices = boneDatas.bi.get(bone.boneId);
		const boneWeights = boneDatas.bw.get(bone.boneId);
		if (boneIndices && boneWeights) {
			for (let i = 0; i < boneIndices.length; ++i) {
				fbxCluster.addVertexIndex(boneIndices[i]!, boneWeights[i]!);
			}
		}

		fbxSkin.addCluster(fbxCluster);
		exportedClusters.set(bone, fbxCluster);
	}
}

/*
export async function entitytoFBXFile(entity) {
	let playing = Graphics.isRunning();
	Graphics.pause();
	let fbxFile = createEmptyFile();
	fbxFile.version = 7400;

	let meshes = entity.getMeshList();

	for (let mesh of meshes) {
		if (!mesh.exportObj || !mesh.visible || !mesh.is('Mesh') || mesh.parent?.isParticleSystem) {
			continue;
		}

		let fbxMaterial = new FBXMaterial();
		fbxMaterial.name = 'mat_' + fbxMaterial.id + '.png';
		let fbxGeometry = new FBXGeometry();
		let meshMaterial = mesh.material;
		//console.log(meshMaterial);
		if (meshMaterial) {
			await configureMaterial(meshMaterial, fbxMaterial, mesh.materialsParams);
		}

		let meshDatas = mesh.exportObj();

		let polygons = [];
		let edges = [];
		let uvIndex = [];
		let uv = [];

		let vertexIndices = meshDatas.f;
		let vertexIndex1;
		let vertexIndex2;
		let vertexIndex3;
		let remappedIndex = new Map();
		let currentIndex = 0;
		let remappedVertices = [];
		let remappedNormals = [];
		let remappedUV = [];
		function remapIndex(index) {
			if (remappedIndex.has(index)) {
				return remappedIndex.get(index);
			}

			let newIndex = currentIndex++;
			remappedIndex.set(index, newIndex);

			let vIndex = index * 3;
			let uvIndex = index * 2;
			remappedVertices.push(meshDatas.v[vIndex], meshDatas.v[vIndex + 1], meshDatas.v[vIndex + 2]);
			remappedNormals.push(meshDatas.vn[vIndex], meshDatas.vn[vIndex + 1], meshDatas.vn[vIndex + 2]);
			remappedUV.push(meshDatas.vt[uvIndex], meshDatas.vt[uvIndex + 1]);

			return newIndex;
		}

		for (let i = 0, j = 0, l = vertexIndices.length; i < l; i += 3, j += 2) {
			vertexIndex1 = remapIndex(vertexIndices[i]);
			vertexIndex2 = remapIndex(vertexIndices[i + 1]);
			vertexIndex3 = remapIndex(vertexIndices[i + 2]);
			polygons.push(vertexIndex1, vertexIndex2, ~vertexIndex3);
			uvIndex.push(vertexIndex1, vertexIndex2, vertexIndex3);
			edges.push(vertexIndex1, vertexIndex2, vertexIndex3);
		}

		fbxGeometry.vertices = remappedVertices;
		fbxGeometry.normals = remappedNormals;
		fbxGeometry.polygons = polygons;
		fbxGeometry.edges = edges;
		fbxGeometry.uv = remappedUV;
		fbxGeometry.uvIndex = uvIndex;

		//let attributes = {f:'index',v:'aVertexPosition',vn:'aVertexNormal',vt:'aTextureCoord'};

		let fbxModel = new FBXModel(fbxGeometry, fbxMaterial);
		fbxModel.name = mesh.name;
		fbxFile.addModel(fbxModel);
	}

	if (playing) {
		Graphics.play();
	}

	return fbxFile;
}
*/

async function configureMaterial(material: Material, fbxMaterial: FBXSurfacePhong, materialsParams: DynamicParams) {
	const fbxManager = fbxMaterial.manager;
	if (material.uniforms['colorMap']) {
		const fbxTexture = fbxManager.createObject('FBXTexture', 'DiffuseColor') as FBXTexture;
		const fbxVideo = fbxManager.createObject('FBXVideo', 'FBXVideo') as FBXVideo;
		//fbxTexture.fbxMapping = 'DiffuseColor'; TODO ?????
		fbxTexture.media = fbxVideo;
		fbxTexture.name = 'mat_' + fbxTexture.id + '.png';
		fbxVideo.name = 'mat_' + fbxVideo.id + '.png';


		const renderResult = await renderMaterial(material, materialsParams, RenderMode.Color);
		if (renderResult) {
			fbxVideo.content = new Uint8Array(renderResult);
		}

		//fbxMaterial.addTexture(fbxTexture);
		fbxMaterial.diffuse.connectSrcObject(fbxTexture);
	}

	if (material.uniforms['colorMap']) {
		const fbxTexture = fbxManager.createObject('FBXTexture', 'DiffuseColor') as FBXTexture;
		const fbxVideo = fbxManager.createObject('FBXVideo', 'FBXVideo') as FBXVideo;
		//fbxTexture.fbxMapping = 'DiffuseColor'; TODO ?????
		fbxTexture.media = fbxVideo;
		fbxTexture.name = 'mat_' + fbxTexture.id + '.png';
		fbxVideo.name = 'mat_' + fbxVideo.id + '.png';


		const renderResult = await renderMaterial(material, materialsParams, RenderMode.Normal);
		if (renderResult) {
			fbxVideo.content = new Uint8Array(renderResult);
		}

		// TODO: create a helper function in harmony-fbx
		fbxMaterial.normalMap = fbxMaterial.createProperty(FBX_PROPERTY_TYPE_COLOR_3, 'NormalMap', [0.2, 0.2, 0.2], FBX_PROPERTY_FLAG_STATIC);
		fbxMaterial.normalMap.connectSrcObject(fbxTexture);

		//fbxMaterial.createProperty(FBX_PROPERTY_TYPE_DOUBLE, 'BumpFactor', 1, FBX_PROPERTY_FLAG_STATIC);
	}
}

let scene: Scene;
let camera: Camera;
let fullScreenQuadMesh: FullScreenQuad;
enum RenderMode {
	Color = 0,
	Normal = 1,
}
async function renderMaterial(material: Material, materialsParams: DynamicParams, renderMode: RenderMode): Promise<ArrayBuffer | null> {
	if (!scene) {
		scene = new Scene();
		camera = new Camera();
		camera.position = [0, 0, 100];
		fullScreenQuadMesh = new FullScreenQuad();
		scene.addChild(fullScreenQuadMesh);
	}

	const [previousWidth, previousHeight] = Graphics.setSize(1024, 1024);//TODOv3: constant
	const previousClearColor = Graphics.getClearColor();
	Graphics.clearColor(vec4.fromValues(0, 0, 0, 0));
	Graphics.setIncludeCode('EXPORT_TEXTURES', '#define EXPORT_TEXTURES');
	Graphics.setIncludeCode('SKIP_PROJECTION', '#define SKIP_PROJECTION');
	Graphics.setIncludeCode('SKIP_LIGHTING', '#define SKIP_LIGHTING');

	switch (renderMode) {
		case RenderMode.Normal:
			Graphics.setIncludeCode('RENDER_MODE', '#define RENDER_MODE 12');
			break;
	}


	fullScreenQuadMesh.material = material;
	fullScreenQuadMesh.materialsParams = materialsParams;
	Graphics.render(scene, camera, 0, { DisableToolRendering: true });

	const imgContent = await Graphics.toBlob();

	Graphics.setIncludeCode('EXPORT_TEXTURES', '');
	Graphics.setIncludeCode('SKIP_PROJECTION', '');
	Graphics.setIncludeCode('SKIP_LIGHTING', '');
	Graphics.removeIncludeCode('RENDER_MODE');
	Graphics.setSize(previousWidth, previousHeight);
	Graphics.clearColor(previousClearColor);

	return imgContent?.arrayBuffer() ?? null;
}
