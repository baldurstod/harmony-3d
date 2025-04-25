import { mat4, quat, vec3, vec4 } from 'gl-matrix';
import { FBXExporter, fbxSceneToFBXFile, FBX_SKELETON_TYPE_LIMB, FBXManager, FBX_PROPERTY_TYPE_DOUBLE } from 'harmony-fbx';

import { Camera } from '../cameras/camera';
import { Graphics } from '../graphics/graphics';
import { quatToEulerDeg } from '../math/quaternion';
import { FullScreenQuad } from '../primitives/fullscreenquad';
import { Scene } from '../scenes/scene';
import { HALF_PI } from '../math/constants';
import { DEBUG } from '../buildoptions';

const EXPORT_SKELETON = true;
const EXPORT_ANIM_CURVE = false;
const ROTATE_Z = quat.create();
quat.rotateX(ROTATE_Z, ROTATE_Z, -HALF_PI);

const tempMat4 = mat4.create();

export async function exportToBinaryFBX(entity) {
	const fbxManager = new FBXManager();
	let fbxFile = fbxSceneToFBXFile(await entityToFBXScene(fbxManager, entity));
	return new FBXExporter().exportBinary(fbxFile);
}

export async function entityToFBXScene(fbxManager, entity) {
	const fbxScene = fbxManager.createObject('FBXScene', 'Scene');
	let playing = new Graphics().isRunning();
	new Graphics().pause();

	await createFBXSceneEntity(fbxScene, entity);

	if (playing) {
		new Graphics().play();
	}
	return fbxScene;
}

async function createFBXSceneEntity(fbxScene, entity, context: any = {}) {
	if (!context.exportedBones) {
		context.exportedBones = new Map();
	}
	if (!context.animStackPerEntity) {
		context.animStackPerEntity = new Map();
	}
	if (!context.animLayerPerEntity) {
		context.animLayerPerEntity = new Map();
	}
	switch (true) {
		case entity.isSource1ModelInstance:
			await createSource1ModelInstance(fbxScene, entity, context);
			break;
		case entity.is('Mesh'):
			await createFBXMesh(fbxScene, entity, context);
			break;
		case entity.is('Camera'):
			await createFBXCamera(fbxScene, entity);
			break;
	}
	await createChildEntities(fbxScene, entity, context);
}

async function createChildEntities(fbxScene, entity, context) {
	for (let childEntity of entity.children) {
		await createFBXSceneEntity(fbxScene, childEntity, context);
	}
}

async function createSource1ModelInstance(fbxScene, entity, context) {
	const fbxManager = fbxScene.manager;
	let animStack;
	let animLayer;
	animStack = context.animStackPerEntity.get(entity.parent);
	animLayer = context.animLayerPerEntity.get(entity.parent);
	if (!animStack) {
		animStack = fbxManager.createObject('FBXAnimStack', 'test FBXAnimStack');
		fbxScene.addObject(animStack);
		context.animStackPerEntity.set(entity, animStack);

		animLayer = fbxManager.createObject('FBXAnimLayer', 'test FBXAnimLayer');
		animStack.add(animLayer);
	}


	const exportedBones = context.exportedBones;

	if (EXPORT_SKELETON && entity.skeleton) {
		const bones = entity.skeleton.bones;
		for (let bone of bones) {
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

function createAnimCurveNode(fbxAnimLayer, limbNode) {
	const fbxManager = fbxAnimLayer.manager;
	const animCurveNode = fbxManager.createObject('FBXAnimCurveNode', 'T');
	fbxAnimLayer.add(animCurveNode);

	const xProperty = animCurveNode.addChannel(FBX_PROPERTY_TYPE_DOUBLE, 'X', 0);
	const yProperty = animCurveNode.addChannel(FBX_PROPERTY_TYPE_DOUBLE, 'Y', 0);
	const zProperty = animCurveNode.addChannel(FBX_PROPERTY_TYPE_DOUBLE, 'Z', 0);

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

async function createFBXMesh(fbxScene, mesh, context) {
	const fbxManager = fbxScene.manager;
	let meshPose = fbxManager.createObject('FBXPose', 'Pose ' + mesh.name);
	fbxScene.addObject(meshPose);
	if (!mesh.exportObj || !mesh.visible || !mesh.is('Mesh') || mesh.parent?.isParticleSystem) {
		return;
	}

	let fbxMeshNode = fbxManager.createObject('FBXNode', mesh.name);
	fbxMeshNode.localRotation.value = quatToEulerDeg([0, 0, 0], quat.mul(quat.create(), ROTATE_Z, mesh.getWorldQuaternion()));
	fbxMeshNode.localTranslation.value = vec3.transformQuat(vec3.create(), mesh.getWorldPosition(), ROTATE_Z);
	fbxMeshNode.localScaling.value = mesh.getWorldScale();

	let fbxMaterial = fbxManager.createObject('FBXSurfacePhong');
	fbxMaterial.name = 'mat_' + fbxMaterial.id + '.png';
	let fbxMesh = fbxManager.createObject('FBXMesh', 'Name me FBXMesh');
	fbxMeshNode.nodeAttribute = fbxMesh;
	fbxMeshNode.addMaterial(fbxMaterial);
	fbxScene.rootNode.addChild(fbxMeshNode);

	let meshMaterial = mesh.material;
	//console.log(meshMaterial);
	if (meshMaterial) {
		await configureMaterial(meshMaterial, fbxMaterial, mesh.materialsParams);
	}

	let meshDatas = mesh.exportObj();

	let meshDatasBi;
	let meshDatasBw;
	if (EXPORT_SKELETON && mesh.skeleton) {
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

	let boneIndexes = new Map();
	let boneWeights = new Map();

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
	let remappedBoneIndices = [];
	let remappedBoneWeight = [];
	const bonesPerVertex = mesh.bonesPerVertex;
	function remapIndex(index) {
		if (remappedIndex.has(index)) {
			return remappedIndex.get(index);
		}

		let newIndex = currentIndex++;
		remappedIndex.set(index, newIndex);

		let vIndex = index * 3;
		let uvIndex = index * 2;
		if (meshDatas.v) {
			remappedVertices.push(meshDatas.v[vIndex], meshDatas.v[vIndex + 1], meshDatas.v[vIndex + 2]);
		}
		if (meshDatas.vn) {
			remappedNormals.push(meshDatas.vn[vIndex], meshDatas.vn[vIndex + 1], meshDatas.vn[vIndex + 2]);
		}
		if (meshDatas.vt) {
			remappedUV.push(meshDatas.vt[uvIndex], meshDatas.vt[uvIndex + 1]);
		}

		if (EXPORT_SKELETON) {
			const boneIndex = index * bonesPerVertex;
			if (meshDatas.bi) {
				for (let j = 0; j < bonesPerVertex; ++j) {
					remappedBoneIndices.push(meshDatas.bi[boneIndex + j]);
					remappedBoneWeight.push(meshDatas.bw[boneIndex + j]);
				}
			}
		}

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

	if (EXPORT_SKELETON) {
		for (let vertexIndex = 0, l = remappedBoneIndices.length / bonesPerVertex; vertexIndex < l; ++vertexIndex) {
			for (let j = 0; j < bonesPerVertex; ++j) {
				let k = vertexIndex * bonesPerVertex + j;
				let boneIndex = remappedBoneIndices[k];
				let boneWeight = remappedBoneWeight[k];
				if (boneWeight != 0) {
					if (!boneIndexes.has(boneIndex)) {
						boneIndexes.set(boneIndex, []);
						boneWeights.set(boneIndex, []);
					}

					boneIndexes.get(boneIndex).push(vertexIndex);
					boneWeights.get(boneIndex).push(boneWeight);
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
	if (mesh.skeleton) {
		let boneDatas = { bi: boneIndexes, bw: boneWeights };
		//for (let i = 0; i < )
		if (EXPORT_SKELETON) {
			exportSkeleton(fbxScene, mesh.skeleton, context, fbxMesh, boneDatas, meshPose);
		}
	}
}

async function createFBXCamera(fbxScene, camera) {
	const fbxManager = fbxScene.manager;
	console.log(camera);
	let fbxCameraNode = fbxManager.createObject('FBXNode', camera.name);
	let fbxCamera = fbxManager.createObject('FBXCamera', camera.name);
	fbxCameraNode.nodeAttribute = fbxCamera;

	//fbxCamera.position.value = camera.position;
	fbxCameraNode.localTranslation.value = camera.position;
	let angles = quatToEulerDeg([0, 0, 0], camera.quaternion);
	//fbxCameraNode.localRotation.value = angles;

	fbxCameraNode.parent = fbxScene.rootNode;//TODO: set the actual parent
}

//NodeAttribute -> Model -> cluster (subdeformer) -> skin(deformer) -> geometry
//38772576 -> 39350848 -> 49570336 -> 49569504 -> 39673840 samba dancing

function exportSkeleton(fbxScene, skeleton, context, fbxMesh, boneDatas, meshPose) {
	const fbxManager = fbxScene.manager;
	let fbxSkin = fbxManager.createObject('FBXSkin', skeleton.name);
	const exportedClusters = new WeakMap();
	fbxSkin.geometry = fbxMesh;
	for (let bone of skeleton.bones) {
		exportBone(fbxScene, bone, context, exportedClusters, fbxSkin, boneDatas, meshPose);
	}
}

function exportBone(fbxScene, bone, context, exportedClusters, fbxSkin, boneDatas, meshPose) {
	const fbxManager = fbxScene.manager;
	let boneParent = bone.parent ?? bone.skeleton;
	const boneParentSkeletonBone = bone.parentSkeletonBone;
	if (boneParent) {
		if (boneParent.isBone) {
			// Ensure the parent is already exported
			exportBone(fbxScene, boneParent, context, exportedClusters, fbxSkin, boneDatas, meshPose);
		} else {
			// it's a skeleton
		}
	} else {// DO WHAT ?
	}


	// Export this very bone
	let fbxBone;
	const exportedBones = context.exportedBones;
	if (exportedBones.has(bone)) {
		fbxBone = exportedBones.get(bone);
	} else if (exportedBones.has(boneParentSkeletonBone)) {
		fbxBone = exportedBones.get(boneParentSkeletonBone);
		exportedBones.set(bone, fbxBone);
	} else {
		fbxBone = fbxManager.createObject('FBXNode', bone.name);//TODO

		let angles = vec3.create();
		let transformedQuat = quat.create();
		let transformedVec = vec3.create();

		if (boneParentSkeletonBone) {
			if (boneParent.isSkeleton) {
				fbxBone.localTranslation.value = vec3.transformQuat(transformedVec, boneParentSkeletonBone.worldPos, ROTATE_Z);
				quat.mul(transformedQuat, ROTATE_Z, boneParentSkeletonBone.worldQuat);
				quatToEulerDeg(angles, transformedQuat);
			} else {
				fbxBone.localTranslation.value = boneParentSkeletonBone.position;
				quatToEulerDeg(angles, boneParentSkeletonBone.quaternion);
			}
		} else {
			if (boneParent.isSkeleton) {
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


		let fbxLimb = fbxManager.createObject('FBXSkeleton', 'Name me FBXSkeleton', FBX_SKELETON_TYPE_LIMB);
		fbxBone.nodeAttribute = fbxLimb;

		fbxBone.parent = exportedBones.get(boneParent) ?? fbxScene.rootNode;

		exportedBones.set(bone, fbxBone);
	}


	if (!exportedClusters.has(bone)) {

		let fbxCluster = fbxManager.createObject('FBXCluster', bone.name);
		fbxCluster.transformMatrix = bone.poseToBone;
		fbxCluster.transformLinkMatrix = mat4.invert(tempMat4, bone.poseToBone);
		fbxCluster.link = fbxBone;

		if (boneDatas.bi.has(bone.boneId)) {
			for (let i = 0; i < boneDatas.bi.get(bone.boneId).length; ++i) {
				fbxCluster.addVertexIndex(boneDatas.bi.get(bone.boneId)[i], boneDatas.bw.get(bone.boneId)[i]);
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

async function configureMaterial(material, fbxMaterial, materialsParams) {
	const fbxManager = fbxMaterial.manager;
	if (material.uniforms['colorMap']) {
		let fbxTexture = fbxManager.createObject('FBXTexture');
		let fbxVideo = fbxManager.createObject('FBXVideo');
		fbxTexture.fbxMapping = 'DiffuseColor';
		fbxTexture.media = fbxVideo;
		fbxTexture.name = 'mat_' + fbxTexture.id + '.png';
		fbxVideo.name = 'mat_' + fbxVideo.id + '.png';


		fbxVideo.content = new Uint8Array(await renderMaterial(material, materialsParams));

		//fbxMaterial.addTexture(fbxTexture);
		fbxMaterial.diffuse.connectSrcObject(fbxTexture);
	}

}

let scene;
let camera;
let fullScreenQuadMesh;
async function renderMaterial(material, materialsParams) {
	if (!scene) {
		scene = new Scene();
		camera = new Camera();
		camera.position = [0, 0, 100];
		fullScreenQuadMesh = new FullScreenQuad();
		scene.addChild(fullScreenQuadMesh);
	}

	let [previousWidth, previousHeight] = new Graphics().setSize(1024, 1024);//TODOv3: constant
	let previousClearColor = new Graphics().getClearColor();
	new Graphics().clearColor(vec4.fromValues(0, 0, 0, 0));
	new Graphics().setIncludeCode('EXPORT_TEXTURES', '#define EXPORT_TEXTURES');
	new Graphics().setIncludeCode('SKIP_PROJECTION', '#define SKIP_PROJECTION');
	new Graphics().setIncludeCode('SKIP_LIGHTING', '#define SKIP_LIGHTING');

	fullScreenQuadMesh.material = material;
	fullScreenQuadMesh.materialsParams = materialsParams;
	new Graphics().render(scene, camera, 0, { DisableToolRendering: true });

	let imgContent = await new Graphics().toBlob();

	new Graphics().setIncludeCode('EXPORT_TEXTURES', '');
	new Graphics().setIncludeCode('SKIP_PROJECTION', '');
	new Graphics().setIncludeCode('SKIP_LIGHTING', '');
	new Graphics().setSize(previousWidth, previousHeight);
	new Graphics().clearColor(previousClearColor);

	return imgContent.arrayBuffer();
}
