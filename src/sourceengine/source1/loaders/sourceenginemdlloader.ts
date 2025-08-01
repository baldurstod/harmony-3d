import { mat4, quat, vec3 } from 'gl-matrix';
import { BinaryReader } from 'harmony-binary-reader';
import { DEBUG, LOG, TESTING } from '../../../buildoptions';
import { registerLoader } from '../../../loaders/loaderfactory';
import { RemapValClamped } from '../../../math/functions';
import { SourceBinaryLoader } from '../../common/loaders/sourcebinaryloader';
import { StringStrip } from '../utils/utils';
import { MAX_NUM_LODS } from './constants';
import { MdlBone } from './mdlbone';
import { MdlStudioAnim, MdlStudioAnimValuePtr, STUDIO_ANIM_ANIMPOS, STUDIO_ANIM_ANIMROT, STUDIO_ANIM_RAWPOS, STUDIO_ANIM_RAWROT, STUDIO_ANIM_RAWROT2 } from './mdlstudioanim';
import { MdlStudioAutoLayer, MdlStudioEvent, MdlStudioSeqDesc } from './mdlstudioseqdesc';
import { MdlAttachment, MdlBodyPart, MdlStudioAnimDesc, MdlStudioFlexOp, MdlStudioFlexRule, MdlStudioModelGroup, MdlStudioPoseParam, MdlTexture, SourceMdl, SourceMdlHeader } from './sourcemdl';

const BODYPART_STRUCT_SIZE = 16;
const MODEL_VERTEX_DATA_STRUCT_SIZE = 8;// Size in bytes of mstudio_modelvertexdata_t
const MODEL_STRUCT_SIZE = 140 + MODEL_VERTEX_DATA_STRUCT_SIZE;// Size in bytes of mstudio_modelvertexdata_t

const MESH_VERTEX_DATA_STRUCT_SIZE = 4 + 4 * MAX_NUM_LODS; // Size in bytes of mstudio_meshvertexdata_t
const MESH_STRUCT_SIZE = 80 + MESH_VERTEX_DATA_STRUCT_SIZE;
const EYEBALL_STRUCT_SIZE = 172;// Size in bytes of mstudioeyeball_t

const STUDIO_VERT_ANIM_NORMAL = 0;
const STUDIO_VERT_ANIM_WRINKLE = 1;

const STUDIO_VERT_ANIM_NORMAL_STRUCT_SIZE = 16;// Size in bytes of mstudiovertanim_t
const STUDIO_VERT_ANIM_WRINKLE_STRUCT_SIZE = STUDIO_VERT_ANIM_NORMAL_STRUCT_SIZE + 2;// Size in bytes of mstudiovertanim_wrinkle_t

const TEXTURE_STRUCT_SIZE = 64;

const STUDIO_MODEL_GROUP_STRUCT_SIZE = 8;
const STUDIO_ANIM_DESC_STRUCT_SIZE = 25 * 4; // Size in bytes of mstudioanimdesc_t

const STUDIO_SEQUENCE_DESC_STRUCT_SIZE = 53 * 4;// Size in bytes of mstudioseqdesc_t

const STUDIO_EVENT_STRUCT_SIZE = 80;// Size in bytes of mstudioevent_t
const STUDIO_AUTO_LAYER_STRUCT_SIZE = 24;// Size in bytes of mstudioautolayer_t

const BONE_STRUCT_SIZE = 216;
const STUDIO_POSE_PARAMETER_STRUCT_SIZE = 20; // Size in bytes of mstudioposeparamdesc_t

const ATTACHMENT_STRUCT_SIZE = 92;

const STUDIO_FLEX_RULE_STRUCT_SIZE = 12;
const STUDIO_FLEX_OP_STRUCT_SIZE = 8;

const STUDIO_FLEX_CONTROLLER_STRUCT_SIZE = 20; // Size in bytes of mstudioflexcontroller_t

const STUDIO_FLEX_STRUCT_SIZE = 60; // Size in bytes of mstudioflex_t

const STUDIO_HITBOX_SET_STRUCT_SIZE = 12; // Size in bytes of mstudiohitboxset_t
const STUDIO_HITBOX_STRUCT_SIZE = 68; // Size in bytes of mstudiobbox_t

export class ModelTest /*TODO: rename class*/ {
	render = true;//removeme
	name = '';
	type = 0;
	boundingradius = 0;
	readonly meshArray: MeshTest[] = [];
	readonly vertexArray: never[] = [];
	readonly eyeballArray: MdlEyeball[] = [];
	numvertices = 0;
	vertexindex = 0;
	tangentsindex = 0;
	numattachments = 0;
	attachmentindex = 0;
	numeyeballs = 0;
	eyeballindex = 0;
}

export class MeshTest/*TODO: rename class*/ {
	render = true;//removeme
	model: ModelTest;
	material = 0;
	modelindex = 0;
	numvertices = 0;
	vertexoffset = 0;
	numflexes = 0;
	flexindex = 0;
	materialtype = 0;
	materialparam = 0;
	meshid = 0;
	readonly center = vec3.create();
	readonly flexes: MdlStudioFlex[] = [];
	initialized = false;

	constructor(model: ModelTest) {
		this.model = model;
	}
}

export class MdlStudioFlex {////TODO: turn into type
	flexdesc = 0;
	target0 = 0;
	target1 = 0;
	target2 = 0;
	target3 = 0;
	numverts = 0;
	vertindex = 0;
	flexpair = 0;
	vertanimtype = 0;
	readonly vertAnims: MdlStudioVertAnim[] = [];
}

class MdlStudioVertAnim { // mstudiovertanim_t//TODO: turn into type
	index = 0;
	speed = 0;
	side = 0;
	readonly flDelta: number[] = [];
	readonly flNDelta: number[] = [];
}

class MdlEyeball {////TODO: turn into type
	name = '';
	bone = -1;
	readonly org = vec3.create();
	zoffset = 0;
	radius = 0;
	readonly up = vec3.create();
	readonly forward = vec3.create();
	texture = 0;
	irisScale = 0;
	readonly upperflexdesc: number[] = [];
	readonly lowerflexdesc: number[] = [];
	readonly uppertarget = vec3.create();
	readonly lowertarget = vec3.create();
	upperlidflexdesc = 0;
	lowerlidflexdesc = 0;
	m_bNonFACS = 0;
}

export class MdlStudioFlexController { //mstudioflexcontroller_t//TODO: turn into type
	localToGlobal = 0;
	min = 0;
	max = 0;
	type = '';
	name = '';
}
export class MdlStudioHitboxSet { //mstudiohitboxset_t//TODO: turn into type
	name = '';
	hitboxes: MdlStudioHitbox[] = [];
}
export class MdlStudioHitbox { //mstudiobbox_t//TODO: turn into type
	name = '';
	readonly bbmin = vec3.create();
	readonly bbmax = vec3.create();
	boneId = -1;
	groupId = -1;
}

const invQuaternion64 = (1 / 1048576.5);
function readQuaternion64(reader: BinaryReader, q: quat = quat.create()): quat {
	const b = reader.getBytes(8);

	const x = ((b[7]! & 0x7F) << 14) | (b[6]! << 6) | ((b[5]! & 0xFC) >> 2);
	const y = ((b[5]! & 0x03) << 19) | (b[4]! << 11) | (b[3]! << 3) | ((b[2]! & 0xE0) >> 5);
	const z = ((b[2]! & 0x1F) << 16) | (b[1]! << 8) | b[0]!;
	const neg = (b[7]! & 0x80) >> 7;

	const tmpx = (x - 1048576) * invQuaternion64;
	const tmpy = (y - 1048576) * invQuaternion64;
	const tmpz = (z - 1048576) * invQuaternion64;
	let tmpw = Math.sqrt(1 - tmpx * tmpx - tmpy * tmpy - tmpz * tmpz);

	if (neg) {
		tmpw = -tmpw;
	}

	return quat.set(q, tmpx, tmpy, tmpz, tmpw);
}

const invQuaternion48xy = (1 / 32768.0);
const invQuaternion48z = (1 / 16384.0);

function readQuaternion48(reader: BinaryReader, q: quat = quat.create()): quat {
	const x = reader.getUint16();
	const y = reader.getUint16();
	const tmp = reader.getUint16();
	const z = tmp & 0x7FFF;
	const neg = tmp & 0x8000;

	const tmpx = (x - 32768) * invQuaternion48xy;
	const tmpy = (y - 32768) * invQuaternion48xy;
	const tmpz = (z - 16384) * invQuaternion48z;
	let tmpw = Math.sqrt(1 - tmpx * tmpx - tmpy * tmpy - tmpz * tmpz);

	if (neg) {
		tmpw = -tmpw;
	}

	return quat.set(q, tmpx, tmpy, tmpz, tmpw);
}


export class SourceEngineMDLLoader extends SourceBinaryLoader {
	#parseAnimSectionOnce = false;

	async load(repository: string, path: string): Promise<SourceMdl | null> {
		return super.load(repository, path) as Promise<SourceMdl | null>;
	}

	parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer) {
		const mdl = new SourceMdl(repository);
		const reader = new BinaryReader(arrayBuffer);
		mdl.reader = reader;//TODOv3//removeme
		mdl.loader = this;//TODOv3//removeme
		this.#parseHeader(reader, mdl);
		this.#parseBodyParts(reader, mdl);
		this.#parseSkinReferences(reader, mdl);
		this.#parseTextures(reader, mdl);
		this.#parseTextureDirs(reader, mdl);
		this.#parseModelGroups(reader, mdl);
		this.#parseAnimDescriptions(reader, mdl);
		this.#parseSequences(reader, mdl);
		this.#parseBones(reader, mdl);
		parsePoseParameters(reader, mdl);
		this.#parseAttachments(reader, mdl);
		this.#parseFlexRules(reader, mdl);
		this.#parseFlexControllers(reader, mdl);
		parseHitBoxSets(reader, mdl);
		return mdl;
	}

	#parseHeader(reader: BinaryReader, mdl: SourceMdl) {
		mdl.header = {} as SourceMdlHeader;
		const header = mdl.header;
		reader.seek(0);
		header.modelFormatID = reader.getInt32();
		header.formatVersionID = reader.getInt32();

		header.checkSum = reader.getInt32();
		header.modelName = StringStrip(reader.getString(64));
		header.dataLength = reader.getInt32();

		header.eyeposition = reader.getVector3();
		header.illumposition = reader.getVector3();
		header.hull_min = reader.getVector3();
		header.hull_max = reader.getVector3();
		header.view_bbmin = reader.getVector3();
		header.view_bbmax = reader.getVector3();

		header.flags = reader.getInt32();

		mdl.boneCount = reader.getInt32();
		mdl.boneOffset = reader.getInt32();

		mdl.boneControllerCount = reader.getInt32();
		mdl.boneControllerOffset = reader.getInt32();

		mdl.hitboxCount = reader.getInt32();
		mdl.hitboxOffset = reader.getInt32();

		mdl.localAnimCount = reader.getInt32();
		mdl.localAnimOffset = reader.getInt32();

		mdl.localSeqCount = reader.getInt32();
		mdl.localSeqOffset = reader.getInt32();

		header.activitylistversion = reader.getInt32();
		header.eventsindexed = reader.getInt32();

		mdl.textureCount = reader.getInt32();
		mdl.textureOffset = reader.getInt32();

		mdl.textureDirCount = reader.getInt32();
		mdl.textureDirOffset = reader.getInt32();

		mdl.skinReferenceCount = reader.getInt32();
		mdl.skinFamilyCount = reader.getInt32();
		mdl.skinReferenceOffset = reader.getInt32();

		mdl.bodyPartCount = reader.getInt32();
		mdl.bodyPartOffset = reader.getInt32();

		mdl.attachmentCount = reader.getInt32();
		mdl.attachmentOffset = reader.getInt32();

		mdl.localNodeCount = reader.getInt32();
		mdl.localNodeIndex = reader.getInt32();
		mdl.localNodeNameIndex = reader.getInt32();

		header.numFlexDesc = reader.getInt32();
		mdl.flexDescIndex = reader.getInt32();

		mdl.flexControllerCount = reader.getInt32();
		mdl.flexControllerIndex = reader.getInt32();

		mdl.numFlexRules = reader.getInt32();
		mdl.flexRulesIndex = reader.getInt32();

		mdl.ikChainCount = reader.getInt32();
		mdl.ikChainIndex = reader.getInt32();

		mdl.mouthsCount = reader.getInt32();
		mdl.mouthsIndex = reader.getInt32();

		mdl.localPoseParamCount = reader.getInt32();
		mdl.localPoseParamOffset = reader.getInt32();

		mdl.surfacePropIndex = reader.getInt32();

		mdl.keyValueIndex = reader.getInt32();
		mdl.keyValueCount = reader.getInt32();

		mdl.ikLockCount = reader.getInt32();
		mdl.ikLockIndex = reader.getInt32();

		header.mass = reader.getFloat32();

		header.contents = reader.getInt32();

		mdl.includeModelCount = reader.getInt32();
		mdl.includeModelOffset = reader.getInt32();

		header.virtualModel = reader.getInt32();

		mdl.animBlocksNameIndex = reader.getInt32();
		header.animBlocksCount = reader.getInt32();
		header.animBlocksIndex = reader.getInt32();

		header.animBlockModel = reader.getInt32();

		mdl.boneTableByNameIndex = reader.getInt32();

		mdl.vertexBase = reader.getInt32();
		mdl.offsetBase = reader.getInt32();

		header.directionaldotproduct = reader.getInt8();
		header.rootLod = reader.getInt8();
		header.numAllowedRootLods = reader.getInt8();

		reader.getInt8();
		reader.getInt32();

		mdl.flexControllerUICount = reader.getInt32();
		mdl.flexControllerUIIndex = reader.getInt32();

		reader.getInt32();
		reader.getInt32();

		mdl.studiohdr2index = reader.getInt32();
		reader.getInt32();

		if (mdl.studiohdr2index != 0) {

			//if (this.hasChunk(this.studiohdr2index, 5 * 4)) {
			// seek the start of header2
			reader.seek(mdl.studiohdr2index);

			mdl.srcbonetransform_count = reader.getInt32();
			mdl.srcbonetransform_index = reader.getInt32();
			mdl.illumpositionattachmentindex = reader.getInt32();
			mdl.flMaxEyeDeflection = reader.getFloat32();

			mdl.linearboneOffset = reader.getInt32();
		}
	}

	#parseBodyParts(reader: BinaryReader, mdl: SourceMdl) {
		const bodyParts = mdl.bodyParts;

		for (let i = 0; i < mdl.bodyPartCount; ++i) {
			const bodyPart = this.#parseBodyPart(reader, mdl, mdl.bodyPartOffset + i * BODYPART_STRUCT_SIZE);
			bodyParts.push(bodyPart);
		}
	}

	#parseBodyPart(reader: BinaryReader, mdl: SourceMdl, startOffset: number): MdlBodyPart {
		const nameOffset = reader.getInt32(startOffset) + startOffset;
		// Ensure we have enough data for the name
		const bodyPart = new MdlBodyPart();

		const nummodels = reader.getInt32();
		bodyPart.base = reader.getInt32();
		const modelOffset = reader.getInt32();
		bodyPart.models = [];

		for (let i = 0; i < nummodels; ++i) {
			const model = this.#parseModel(reader, mdl, startOffset + modelOffset + i * MODEL_STRUCT_SIZE);
			bodyPart.models.push(model);
			//reader.seek(baseOffset + bodypart.modelindex + i*MODEL_STRUCT_SIZE);
			//bodyPart.models.push(this.readModel());
		}

		bodyPart.name = reader.getNullString(nameOffset);
		return bodyPart;
	}

	#parseModel(reader: BinaryReader, mdl: SourceMdl, startOffset: number): ModelTest {
		// Ensure we have enough data for the name
		const model = new ModelTest();

		model.name = StringStrip(reader.getString(64, startOffset));
		model.type = reader.getInt32();
		model.boundingradius = reader.getFloat32();
		const nummeshes = reader.getInt32();
		const meshOffset = reader.getInt32();

		model.numvertices = reader.getInt32();
		model.vertexindex = reader.getInt32();
		model.tangentsindex = reader.getInt32();

		model.numattachments = reader.getInt32();
		model.attachmentindex = reader.getInt32();
		model.numeyeballs = reader.getInt32();
		model.eyeballindex = reader.getInt32();

		//this.readModelVertexData();//TODO
		reader.skip(4 * 8);

		for (let i = 0; i < nummeshes; ++i) {
			const mesh = this.#parseMesh(reader, mdl, startOffset + meshOffset + i * MESH_STRUCT_SIZE, model);
			model.meshArray.push(mesh);
			//mesh.model = model;
		}

		for (let i = 0; i < model.numeyeballs; ++i) {
			const eyeBall = this.#parseEyeBall(reader, startOffset + model.eyeballindex + i * EYEBALL_STRUCT_SIZE);
			model.eyeballArray.push(eyeBall);
		}
		return model;
	}

	#parseMesh(reader: BinaryReader, mdl: SourceMdl, startOffset: number, model: ModelTest): MeshTest {
		// Ensure we have enough data
		//const mesh = new MdlMesh();TODO
		const mesh = new MeshTest(model);//TODO

		mesh.material = reader.getInt32(startOffset);
		mesh.modelindex = reader.getInt32();

		mesh.numvertices = reader.getInt32();
		mesh.vertexoffset = reader.getInt32();

		mesh.numflexes = reader.getInt32();
		mesh.flexindex = reader.getInt32() + startOffset;//TODO: add array

		mesh.materialtype = reader.getInt32();
		mesh.materialparam = reader.getInt32();

		mesh.meshid = reader.getInt32();
		reader.getVector3(undefined, undefined, mesh.center as Float32Array<ArrayBuffer>);

		//mesh.vertexData = this.readMeshVertexData();
		reader.skip(4 + MAX_NUM_LODS * 4);
		//mesh.flexes = [];

		reader.skip(4 * 8);

		//TODO: read flexes
		this.#parseFlexes(reader, mdl, mesh.flexindex, mesh.numflexes, mesh.flexes);

		return mesh;
	}

	#parseFlexes(reader: BinaryReader, mdl: SourceMdl, startOffset: number, count: number, flexes: MdlStudioFlex[]): void {
		for (let i = 0; i < count; ++i) {
			flexes.push(this.#parseFlex(reader, startOffset + i * STUDIO_FLEX_STRUCT_SIZE));
		}
	}

	#parseFlex(reader: BinaryReader, startOffset: number): MdlStudioFlex {
		reader.seek(startOffset);

		const flex = new MdlStudioFlex();
		flex.flexdesc = reader.getInt32();
		flex.target0 = reader.getFloat32();
		flex.target1 = reader.getFloat32();
		flex.target2 = reader.getFloat32();
		flex.target3 = reader.getFloat32();

		flex.numverts = reader.getInt32();
		flex.vertindex = reader.getInt32();
		flex.flexpair = reader.getInt32();
		flex.vertanimtype = reader.getInt8();

		const vertOffset = startOffset + flex.vertindex;
		if (flex.vertanimtype == STUDIO_VERT_ANIM_NORMAL) {

			//const size = flex.numverts * STUDIO_VERT_ANIM_NORMAL_STRUCT_SIZE;

			for (let i = 0; i < flex.numverts; ++i) {
				//reader.seek(vertOffset + i*STUDIO_VERT_ANIM_NORMAL_STRUCT_SIZE);
				const vertAnim = this.#parseVertAnim(reader, vertOffset + i * STUDIO_VERT_ANIM_NORMAL_STRUCT_SIZE);

				flex.vertAnims.push(vertAnim);
			}
		} else {
			if (DEBUG) { console.error('Flex type STUDIO_VERT_ANIM_WRINKLE' + flex); }
		}
		return flex;
	}

	#parseVertAnim(reader: BinaryReader, startOffset: number): MdlStudioVertAnim {
		reader.seek(startOffset);

		const vert = new MdlStudioVertAnim();
		vert.index = reader.getUint16();
		vert.speed = reader.getUint8();
		vert.side = reader.getUint8();

		vert.flDelta[0] = reader.getFloat16();
		vert.flDelta[1] = reader.getFloat16();
		vert.flDelta[2] = reader.getFloat16();
		vert.flNDelta[0] = reader.getFloat16();
		vert.flNDelta[1] = reader.getFloat16();
		vert.flNDelta[2] = reader.getFloat16();

		return vert;
	}

	#parseEyeBall(reader: BinaryReader, startOffset: number): MdlEyeball {//mstudioeyeball_t
		const eyeball = new MdlEyeball();

		const nameOffset = startOffset + reader.getInt32(startOffset);

		eyeball.bone = reader.getInt32();
		reader.getVector3(undefined, undefined, eyeball.org as Float32Array<ArrayBuffer>);
		eyeball.zoffset = reader.getFloat32();
		eyeball.radius = reader.getFloat32();
		reader.getVector3(undefined, undefined, eyeball.up as Float32Array<ArrayBuffer>);
		reader.getVector3(undefined, undefined, eyeball.forward as Float32Array<ArrayBuffer>);
		eyeball.texture = reader.getInt32();

		reader.skip(4);//unused
		eyeball.irisScale = reader.getFloat32();
		reader.skip(4);//unused

		eyeball.upperflexdesc.push(reader.getInt32(), reader.getInt32(), reader.getInt32());
		eyeball.lowerflexdesc.push(reader.getInt32(), reader.getInt32(), reader.getInt32());
		reader.getVector3(undefined, undefined, eyeball.uppertarget as Float32Array<ArrayBuffer>);
		reader.getVector3(undefined, undefined, eyeball.lowertarget as Float32Array<ArrayBuffer>);

		eyeball.upperlidflexdesc = reader.getInt32();
		eyeball.lowerlidflexdesc = reader.getInt32();

		reader.skip(4 * 4);//unused
		eyeball.m_bNonFACS = reader.getInt8();
		reader.skip(3 * 1 + 7 * 4);//unused

		eyeball.name = reader.getNullString(nameOffset);

		//console.error(eyeball);

		return eyeball;
	}

	#parseSkinReferences(reader: BinaryReader, mdl: SourceMdl): void {
		const skinReferences = mdl.skinReferences;
		// Ensure we have enough data

		reader.seek(mdl.skinReferenceOffset);
		for (let i = 0; i < mdl.skinFamilyCount; ++i) {
			skinReferences[i] = [];
			for (let j = 0; j < mdl.skinReferenceCount; ++j) {
				skinReferences[i]!.push(reader.getInt16());
			}
		}
		//mdl.skinReferences = skinReferences;
	}

	#parseTextures(reader: BinaryReader, mdl: SourceMdl) {
		const textures = mdl.textures;

		for (let i = 0; i < mdl.textureCount; ++i) {
			const texture = this.#parseTexture(reader, mdl, mdl.textureOffset + i * TEXTURE_STRUCT_SIZE);
			texture.name = texture.name;
			textures.push(texture);
		}
	}

	#parseTexture(reader: BinaryReader, mdl: SourceMdl, startOffset: number) {
		reader.seek(startOffset);
		const nameOffset = reader.getInt32() + startOffset;

		// Ensure we have enough data for the name
		const texture = new MdlTexture();
		const flags = reader.getInt32();
		const used = reader.getInt32();
		const unused = reader.getInt32();
		const material = reader.getInt32();
		const client_material = reader.getInt32();

		texture.name = reader.getNullString(nameOffset);
		texture.originalName = texture.name;

		/*
		if (!mdl.baseTexturePath) {
			const regex = /(.*(\\|\/))* /i;
			const result = regex.exec(texture.name);
			if (result) {
				mdl.baseTexturePath = result[0];
			}
		}
		*/
		return texture;
	}

	#parseTextureDirs(reader: BinaryReader, mdl: SourceMdl) {

		for (let i = 0; i < mdl.textureDirCount; ++i) {
			const nameOffset = reader.getInt32(mdl.textureDirOffset + i * 4);
			const textureDir = reader.getNullString(nameOffset);

			if (textureDir !== null) {
				mdl.texturesDir.push(textureDir.replace(/\\/g, '/').toLowerCase());
			}
		}
	}

	#parseModelGroups(reader: BinaryReader, mdl: SourceMdl) {
		for (let i = 0; i < mdl.includeModelCount; ++i) {
			mdl.modelGroups.push(this.#parseModelGroup(reader, mdl, mdl.includeModelOffset + i * STUDIO_MODEL_GROUP_STRUCT_SIZE));
		}
	}

	#parseModelGroup(reader: BinaryReader, mdl: SourceMdl, startOffset: number) {
		reader.seek(startOffset);
		const labelOffset = reader.getInt32() + startOffset;
		const nameOffset = reader.getInt32() + startOffset;

		const modelgroup = new MdlStudioModelGroup();

		modelgroup.label = reader.getNullString(labelOffset);

		modelgroup.name = reader.getNullString(nameOffset);
		return modelgroup;
	}

	#parseAnimDescriptions(reader: BinaryReader, mdl: SourceMdl) {
		const animDescriptions = mdl.animDesc;

		for (let i = 0; i < mdl.localAnimCount; ++i) {
			const animDescription = this.#parseAnimDescription(reader, mdl, mdl.localAnimOffset + i * STUDIO_ANIM_DESC_STRUCT_SIZE);
			animDescriptions.push(animDescription);
		}
	}

	#parseAnimDescription(reader: BinaryReader, mdl: SourceMdl, startOffset: number) {
		reader.seek(startOffset + 4);//skip 4 first bytes
		const nameOffset = reader.getInt32() + startOffset;

		const animDesc = new MdlStudioAnimDesc();
		animDesc.mdl = mdl;
		animDesc.startOffset = startOffset;//TODOv2: remove?Non
		animDesc.fps = reader.getFloat32();
		animDesc.flags = reader.getInt32();
		animDesc.numframes = reader.getInt32();
		animDesc.nummovements = reader.getInt32();
		const movementOffset = reader.getInt32();

		reader.skip(24);

		animDesc.animblock = reader.getInt32();
		animDesc.animIndex = reader.getInt32();

		animDesc.numikrules = reader.getInt32();
		const ikruleOffset = reader.getInt32();
		const animblockikruleOffset = reader.getInt32();

		animDesc.numlocalhierarchy = reader.getInt32();
		const localhierarchyOffset = reader.getInt32();

		animDesc.sectionOffset = reader.getInt32();
		animDesc.sectionframes = reader.getInt32();

		animDesc.zeroframespan = reader.getInt16();
		animDesc.zeroframecount = reader.getInt16();
		//console.log(animDesc.zeroframecount);
		animDesc.zeroframeOffset = reader.getInt32();

		const spanStallTime = reader.getFloat32();

		//TODO
		let numSection;
		if (animDesc.sectionframes != 0) {
			numSection = Math.ceil(animDesc.numframes / animDesc.sectionframes) + 1;
		} else {
			numSection = 1;
		}
		numSection = 0;
		/*
		for (let i = 0; i < numSection; i++) {
			const section = this._parseAnimSection(reader, animDesc, i);//TODOv3
			if (section) {
				animDesc.animSections.push(section);
			}
		}
		*/

		animDesc.name = reader.getNullString(nameOffset);
		return animDesc;
	}

	#parseSequences(reader: BinaryReader, mdl: SourceMdl) {
		for (let i = 0; i < mdl.localSeqCount; ++i) {
			const sequence = this.#parseSequence(reader, mdl, mdl.localSeqOffset + i * STUDIO_SEQUENCE_DESC_STRUCT_SIZE);
			sequence.id = i;
			mdl.sequences.push(sequence);
		}
	}

	#parseSequence(reader: BinaryReader, mdl: SourceMdl, startOffset: number) {
		reader.seek(startOffset + 4);//skip 4 first bytes

		const nameOffset = reader.getInt32() + startOffset;
		const activityNameOffset = reader.getInt32() + startOffset;

		const sequence = new MdlStudioSeqDesc();
		sequence.mdl = mdl;
		sequence.startOffset = startOffset;//TODO: remove me

		sequence.flags = reader.getInt32();
		sequence.activity = reader.getInt32();
		sequence.actweight = reader.getInt32();
		sequence.numevents = reader.getInt32();
		sequence.eventindex = reader.getInt32();

		// Bounding box
		sequence.bbmin = reader.getVector3();
		sequence.bbmax = reader.getVector3();

		sequence.numblends = reader.getInt32();

		sequence.animindexindex = reader.getInt32() + startOffset;
		sequence.movementindex = reader.getInt32();

		sequence.groupsize[0] = reader.getInt32();
		sequence.groupsize[1] = reader.getInt32();

		sequence.paramindex.push(reader.getInt32());
		sequence.paramindex.push(reader.getInt32());

		sequence.paramstart.push(reader.getFloat32());
		sequence.paramstart.push(reader.getFloat32());

		sequence.paramend.push(reader.getFloat32());
		sequence.paramend.push(reader.getFloat32());
		sequence.paramparent = reader.getInt32();

		sequence.fadeintime = reader.getFloat32();
		sequence.fadeouttime = reader.getFloat32();

		sequence.localentrynode = reader.getInt32();
		sequence.localexitnode = reader.getInt32();
		sequence.nodeflags = reader.getInt32();

		sequence.entryphase = reader.getFloat32();
		sequence.exitphase = reader.getFloat32();

		sequence.lastframe = reader.getFloat32();

		sequence.nextseq = reader.getInt32();
		sequence.pose = reader.getInt32();

		sequence.numikrules = reader.getInt32();
		sequence.numautolayers = reader.getInt32();
		sequence.autolayerindex = reader.getInt32() + startOffset;
		sequence.weightlistindex = reader.getInt32();

		sequence.posekeyindex = reader.getInt32() + startOffset;
		sequence.numiklocks = reader.getInt32();
		sequence.iklockindex = reader.getInt32();

		sequence.keyvalueindex = reader.getInt32();
		sequence.keyvaluesize = reader.getInt32();

		sequence.cycleposeindex = reader.getInt32();

		//TODO: check size
		reader.seek(sequence.animindexindex);
		for (let i = 0; i < sequence.groupsize[1]; ++i) {
			const arrI: number[] = new Array(sequence.groupsize[0]);
			sequence.blend.push(arrI);
			for (let j = 0; j < sequence.groupsize[0]; ++j) {//TODO: optimize
				arrI[j] = reader.getInt16();
			}
		}

		if (sequence.numautolayers && sequence.autolayerindex) {
			//const size = sequence.numautolayers * STUDIO_AUTO_LAYER_STRUCT_SIZE;

			for (let i = 0; i < sequence.numautolayers; ++i) {
				reader.seek(sequence.autolayerindex + i * STUDIO_AUTO_LAYER_STRUCT_SIZE);
				//this.readAutoLayer();


				const autoLayer = new MdlStudioAutoLayer();

				autoLayer.iSequence = reader.getInt16();
				autoLayer.iPose = reader.getInt16();
				autoLayer.flags = reader.getInt32();
				autoLayer.start = reader.getFloat32();
				autoLayer.peak = reader.getFloat32();
				autoLayer.tail = reader.getFloat32();
				autoLayer.end = reader.getFloat32();

				sequence.autolayer.push(autoLayer);
			}
		}

		sequence.name = reader.getNullString(nameOffset).toLowerCase();
		//console.log(sequence.name);

		sequence.activityName = reader.getNullString(activityNameOffset);



		// TODO: check size
		if (false) {//TODO ?
			if (sequence.keyvaluesize != 0) {//TODOV2
				sequence.keyvalueText = reader.getNullString(sequence.keyvalueindex + startOffset);
				mdl.sequences.push(sequence);
			}
		}

		// TODO: check size
		for (let boneIndex = 0; boneIndex < mdl.boneCount; ++boneIndex) {
			reader.seek(startOffset + sequence.weightlistindex + boneIndex * 4);
			sequence.weightlist.push(reader.getFloat32());
		}

		for (let eventIndex = 0; eventIndex < sequence.numevents; ++eventIndex) {
			reader.seek(startOffset + sequence.eventindex + STUDIO_EVENT_STRUCT_SIZE * eventIndex);
			const event = this.#parseStudioEvent(reader, mdl, startOffset + sequence.eventindex + STUDIO_EVENT_STRUCT_SIZE * eventIndex);
			sequence.events.push(event);
			/*if (sequence.name.toLowerCase().indexOf('taunt07') != -1) {
				console.log(sequence.name, event);
			}*/
		}
		return sequence;
	}
	#parseStudioEvent(reader: BinaryReader, mdl: SourceMdl, startOffset: number) { // mstudioevent_t
		reader.seek(startOffset);

		const studioEvent = new MdlStudioEvent();
		studioEvent.cycle = reader.getFloat32();
		studioEvent.event = reader.getInt32();
		studioEvent.type = reader.getInt32();
		studioEvent.options = reader.getString(64).replace(/\u0000/g, '');
		const nameOffset = reader.getInt32() + startOffset;

		studioEvent.name = reader.getNullString(nameOffset);
		return studioEvent;
	}

	#parseBones(reader: BinaryReader, mdl: SourceMdl): void {
		const bones = mdl.bones;
		const boneNames = mdl.boneNames;

		for (let i = 0; i < mdl.boneCount; ++i) {
			const bone = this.#parseBone(reader, mdl.boneOffset + i * BONE_STRUCT_SIZE);
			if (bone.parentBone != -1) {
				//bone.setParent(bones[bone.parentBone]);
				bone.parent = bones[bone.parentBone] ?? null;
				//bone.worldPos = vec3.create();
				//bone.worldQuat = quat.create();
			} else {
				//bone.worldPos = vec3.clone(bone.position);
				//bone.worldQuat = quat.clone(bone.quaternion);
			}

			bones.push(bone);
			bone.boneId = bones.length - 1;
			boneNames.set(bone.lowcasename, bones.length - 1);
		}
	}

	#parseBone(reader: BinaryReader, startOffset: number): MdlBone {
		reader.seek(startOffset);
		const nameOffset = reader.getInt32() + startOffset;

		const bone = new MdlBone();

		bone.parentBone = reader.getInt32();

		bone.bonecontroller = [];
		for (let i = 0; i < 6; ++i) {
			bone.bonecontroller.push(reader.getInt32());
		}

		bone.position = reader.getVector3();
		bone.quaternion = reader.getVector4();
		reader.getVector3(undefined, undefined, bone.rot as Float32Array<ArrayBuffer>);
		reader.getVector3(undefined, undefined, bone.posscale as Float32Array<ArrayBuffer>);
		reader.getVector3(undefined, undefined, bone.rotscale as Float32Array<ArrayBuffer>);

		const poseToBone = readMatrix3x4(reader);
		bone.poseToBone = poseToBone;
		bone.initPoseToBone = poseToBone;
		//bone.invPoseToBone = mat4.invert(mat4.create(), bone.poseToBone);

		reader.getVector4(undefined, undefined, bone.qAlignment as Float32Array<ArrayBuffer>);
		bone.flags = reader.getInt32();
		bone.proctype = reader.getInt32();
		bone.procindex = reader.getInt32();
		bone.physicsbone = reader.getInt32();
		bone.surfacepropidx = reader.getInt32();
		bone.contents = reader.getInt32();

		reader.skip(8 * 4);

		if (bone.procindex && (bone.proctype == 5)) {
			reader.seek(startOffset + bone.procindex);
			//this.readJiggleBone();//TODO
		}

		bone.name = reader.getNullString(nameOffset);
		bone.lowcasename = bone.name.toLowerCase();

		return bone;
	}

	_parseAnimSection(reader: BinaryReader, animDesc: MdlStudioAnimDesc, frameIndex: number): MdlStudioAnim[] | null {//TODOv3
		//_parseAnimSection(reader, animDesc, sectionIndex) {

		if (animDesc.sectionframes != 0) {
			const sectionIndex = Math.floor(frameIndex / animDesc.sectionframes);//TODOv3

			const sectionOffset1 = animDesc.startOffset + animDesc.sectionOffset + sectionIndex * 8;//TODOv2: name
			reader.seek(sectionOffset1);

			const block = reader.getInt32();//block;//TODOv2
			const sectionOffset = reader.getInt32();
			if (TESTING && block == -1) {
				throw 'error';
			}

			if (block == 0) {
				const section = [];
				let blockOffset = 0;
				let anim;
				do {
					anim = this.#parseAnimBlock(reader, animDesc.startOffset + sectionOffset + blockOffset);
					if (!anim) {
						return null;
					}
					section.push(anim);
					blockOffset += anim.nextOffset;
				} while (anim.nextOffset)
				return section;
			} else {
				if (TESTING && !this.#parseAnimSectionOnce) {
					console.error('Code me _parseAnimSection');
					this.#parseAnimSectionOnce = true;
				}
			}

		} else { // animDesc.sectionframes == 0
			const section = [];
			if (animDesc.animblock == 0) {
				if (animDesc.animIndex) {
					let blockOffset = 0;
					let anim;
					do {
						anim = this.#parseAnimBlock(reader, animDesc.startOffset + animDesc.animIndex + blockOffset);
						if (!anim) {
							return null;
						}
						section.push(anim);
						blockOffset += anim.nextOffset;
					} while (anim.nextOffset)
				}
			} else {
				if (false && LOG) {//TODO
					console.log('animDesc.animblock ' + animDesc.animblock);
				}
			}
			//animDesc.animSections.push(section);
			return section;
		}
		return null;
	}

	#parseAnimBlock(reader: BinaryReader, startOffset: number): MdlStudioAnim {
		reader.seek(startOffset);

		const anim = new MdlStudioAnim();

		//anim.baseOffset = reader.tell();TODOv2
		anim.bone = reader.getUint8();
		anim.flags = reader.getUint8();
		anim.nextOffset = reader.getInt16();
		//anim.values = [];TODOv2

		// valid if animation unvaring over timeline
		if ((anim.flags & STUDIO_ANIM_RAWROT) == STUDIO_ANIM_RAWROT) { // 1: STUDIO_ANIM_RAWROT
			//reader.getString(6); //TODO: read Quaternion48
			readQuaternion48(reader, anim.rawrot);
		}
		if ((anim.flags & STUDIO_ANIM_RAWROT2) == STUDIO_ANIM_RAWROT2) { // 2: STUDIO_ANIM_RAWROT2
			readQuaternion64(reader, anim.rawrot2);
		}
		if ((anim.flags & STUDIO_ANIM_RAWPOS) == STUDIO_ANIM_RAWPOS) { // 3: STUDIO_ANIM_RAWROT
			reader.getVector48(undefined, undefined, anim.rawpos as Float32Array<ArrayBuffer>);
		}

		if ((anim.flags & STUDIO_ANIM_ANIMROT) == STUDIO_ANIM_ANIMROT) { // 1: STUDIO_ANIM_ANIMROT
			parseAnimValuePtr(reader, anim.animValuePtrRot);
		}
		if ((anim.flags & STUDIO_ANIM_ANIMPOS) == STUDIO_ANIM_ANIMPOS) { // 2: STUDIO_ANIM_ANIMPOS
			parseAnimValuePtr(reader, anim.animValuePtrPos);
		}

		return anim;
	}

	#parseAttachments(reader: BinaryReader, mdl: SourceMdl) {
		const attachments = mdl.attachments;
		const attachmentNames = mdl.attachmentNames;
		if (mdl.attachmentCount && mdl.attachmentOffset) {
			//const size = mdl.attachmentCount * ATTACHMENT_STRUCT_SIZE;

			for (let i = 0; i < mdl.attachmentCount; ++i) {
				const attachment = this.#parseAttachment(reader, mdl, mdl.attachmentOffset + i * ATTACHMENT_STRUCT_SIZE);
				attachments.push(attachment);
				attachmentNames.set(attachment.name.toLowerCase(), attachment);
			}
		}
	}

	#parseAttachment(reader: BinaryReader, mdl: SourceMdl, startOffset: number): MdlAttachment {
		const nameOffset = reader.getInt32(startOffset) + startOffset;

		const attachment = new MdlAttachment();
		attachment.mdl = mdl;

		attachment.flags = reader.getInt32();
		attachment.localbone = reader.getInt32();
		//attachment.local = [];

		for (let i = 0; i < 12; ++i) { //local
			attachment.local[i] = reader.getFloat32();
		}

		attachment.name = reader.getNullString(nameOffset);
		attachment.lowcasename = attachment.name.toLowerCase();

		return attachment;
	}

	#parseFlexRules(reader: BinaryReader, mdl: SourceMdl): void {
		if (mdl.numFlexRules && mdl.flexRulesIndex) {
			//const size = mdl.numFlexRules * STUDIO_FLEX_RULE_STRUCT_SIZE;
			for (let i = 0; i < mdl.numFlexRules; ++i) {
				mdl.flexRules.push(this.#parseFlexRule(reader, mdl.flexRulesIndex + i * STUDIO_FLEX_RULE_STRUCT_SIZE));
			}
		}
	}

	#parseFlexRule(reader: BinaryReader, startOffset: number): MdlStudioFlexRule {
		reader.seek(startOffset);

		const rule = new MdlStudioFlexRule();

		rule.flex = reader.getInt32();
		const numops = reader.getInt32();
		const opindex = startOffset + reader.getInt32();

		for (let i = 0; i < numops; ++i) {
			reader.seek(opindex + i * STUDIO_FLEX_OP_STRUCT_SIZE);

			const op = new MdlStudioFlexOp();
			op.op = reader.getInt32();
			const unionOffset = reader.tell();
			op.index = reader.getInt32();
			op.value = reader.getFloat32(unionOffset);
			rule.ops.push(op);
		}
		return rule;
	}

	#parseFlexControllers(reader: BinaryReader, mdl: SourceMdl): void {
		if (mdl.flexControllerCount && mdl.flexControllerIndex) {
			for (let i = 0; i < mdl.flexControllerCount; ++i) {
				mdl.flexControllers.push(this.#parseFlexController(reader, mdl, mdl.flexControllerIndex + i * STUDIO_FLEX_CONTROLLER_STRUCT_SIZE));
			}
		}
	}

	#parseFlexController(reader: BinaryReader, mdl: SourceMdl, startOffset: number): MdlStudioFlexController {
		reader.seek(startOffset);
		const typeOffset = reader.getInt32() + startOffset;
		const nameOffset = reader.getInt32() + startOffset;

		const flexController = new MdlStudioFlexController();

		flexController.localToGlobal = reader.getInt32();
		flexController.min = reader.getFloat32();
		flexController.max = reader.getFloat32();

		reader.seek(typeOffset);
		flexController.type = reader.getNullString();

		reader.seek(nameOffset);
		flexController.name = reader.getNullString().toLowerCase();

		// TODO: hack; fix this
		if (flexController.localToGlobal == -1) {
			flexController.localToGlobal = mdl.flexController.getController(flexController.name, flexController.min, flexController.max);
			//TODOv3
			//TODOv4
		}

		return flexController;
	}
}

registerLoader('SourceEngineMDLLoader', SourceEngineMDLLoader);


function readMatrix3x4(reader: BinaryReader) {
	const matrix = mat4.create();
	matrix[0] = reader.getFloat32();
	matrix[4] = reader.getFloat32();
	matrix[8] = reader.getFloat32();
	matrix[12] = reader.getFloat32();

	matrix[1] = reader.getFloat32();
	matrix[5] = reader.getFloat32();
	matrix[9] = reader.getFloat32();
	matrix[13] = reader.getFloat32();

	matrix[2] = reader.getFloat32();
	matrix[6] = reader.getFloat32();
	matrix[10] = reader.getFloat32();
	matrix[14] = reader.getFloat32();

	return matrix;
}

function parseHitBoxSets(reader: BinaryReader, mdl: SourceMdl): void {
	const hitboxSetCount = mdl.hitboxCount;
	let hitboxSetOffset = mdl.hitboxOffset;
	if (hitboxSetCount && hitboxSetOffset) {
		for (let i = 0; i < hitboxSetCount; ++i) {
			mdl.hitboxSets.push(parseHitboxSet(reader, mdl, hitboxSetOffset));
			hitboxSetOffset += STUDIO_HITBOX_SET_STRUCT_SIZE;
		}
		//mdl.hitboxSets = hitboxSets;
	}
}

function parseHitboxSet(reader: BinaryReader, mdl: SourceMdl, startOffset: number): MdlStudioHitboxSet {
	const hitboxSet = new MdlStudioHitboxSet();
	const nameOffset = reader.getInt32(startOffset) + startOffset;

	const hitboxCount = reader.getInt32();
	let hitboxOffset = reader.getInt32() + startOffset;
	hitboxSet.name = reader.getNullString(nameOffset);
	const hitboxes = [];
	for (let i = 0; i < hitboxCount; ++i) {
		hitboxes.push(parseHitbox(reader, hitboxOffset));
		hitboxOffset += STUDIO_HITBOX_STRUCT_SIZE;
	}
	hitboxSet.hitboxes = hitboxes;
	return hitboxSet;
}

function parseHitbox(reader: BinaryReader, startOffset: number) {
	reader.seek(startOffset);
	const hitbox = new MdlStudioHitbox();

	hitbox.boneId = reader.getInt32();
	hitbox.groupId = reader.getInt32();
	reader.getVector3(undefined, undefined, hitbox.bbmin as Float32Array<ArrayBuffer>);
	reader.getVector3(undefined, undefined, hitbox.bbmax as Float32Array<ArrayBuffer>);
	hitbox.name = reader.getNullString(reader.getInt32() + startOffset);
	return hitbox;
}


function parseAnimValuePtr(reader: BinaryReader, animValuePtr: MdlStudioAnimValuePtr): void {// mstudioanim_valueptr_t
	animValuePtr.base = reader.tell();

	for (let i = 0; i < 3; ++i) {
		animValuePtr.offset.push(reader.getInt16());
	}
}

function parsePoseParameters(reader: BinaryReader, mdl: SourceMdl): void {
	const poseParameters = mdl.poseParameters;

	for (let i = 0; i < mdl.localPoseParamCount; ++i) {
		const poseParameter = parsePoseParameter(reader, mdl.localPoseParamOffset + i * STUDIO_POSE_PARAMETER_STRUCT_SIZE);
		poseParameters.push(poseParameter);
	}
}

function parsePoseParameter(reader: BinaryReader, startOffset: number): MdlStudioPoseParam {
	reader.seek(startOffset);
	const nameOffset = reader.getInt32() + startOffset;
	const poseParameter = new MdlStudioPoseParam();
	poseParameter.flags = reader.getInt32();
	poseParameter.start = reader.getFloat32();
	poseParameter.end = reader.getFloat32();
	poseParameter.loop = reader.getFloat32();
	poseParameter.midpoint = RemapValClamped(0.5, poseParameter.start, poseParameter.end, 0, 1);

	reader.seek(nameOffset);
	poseParameter.name = reader.getNullString();
	return poseParameter;
}
