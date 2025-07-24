import { mat3, mat4, vec3 } from 'gl-matrix';
import { TESTING } from '../../../../../buildoptions';
import { PARTICLE_FIELD_POSITION } from '../../../../common/particles/particlefields';
import { DEFAULT_PARTICLE_NORMAL, Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const mat = mat4.create();
const nmat = mat3.create();
const IDENTITY_MAT4 = mat4.create();

const DEFAULT_SNAPSHOT_CONTROL_POINT_NUMBER = 1;// TODO: check default value
const DEFAULT_RANDOM = false;// TODO: check default value
const DEFAULT_RANDOM_SEED = 0;// TODO: check default value
const DEFAULT_RIGID = false;// TODO: check default value
const DEFAULT_SET_NORMAL = false;// TODO: check default value
const DEFAULT_IGNORE_DT = false;// TODO: check default value
const DEFAULT_MIN_NORMAL_VELOCITY = 0;// TODO: check default value
const DEFAULT_MAX_NORMAL_VELOCITY = 0;// TODO: check default value
const DEFAULT_INCREMENT = 1;// TODO: check default value
const DEFAULT_FULL_LOOP_INCREMENT = 0;// TODO: check default value
const DEFAULT_SNAPSHOT_START_POINT = 0;// TODO: check default value
const DEFAULT_BONE_VELOCITY = 0;// TODO: check default value
const DEFAULT_BONE_VELOCITY_MAX = 0;// TODO: check default value
const DEFAULT_COPY_COLOR = false;// TODO: check default value
const DEFAULT_COPY_ALPHA = false;// TODO: check default value
const DEFAULT_COPY_RADIUS = false;// TODO: check default value

export class InitSkinnedPositionFromCPSnapshot extends Operator {
	#rigidOnce = false;
	#snapshotControlPointNumber = DEFAULT_SNAPSHOT_CONTROL_POINT_NUMBER;
	#random = DEFAULT_RANDOM;
	#randomSeed = DEFAULT_RANDOM_SEED;
	#rigid = DEFAULT_RIGID;
	#setNormal = DEFAULT_SET_NORMAL;
	#ignoreDt = DEFAULT_IGNORE_DT;
	#minNormalVelocity = DEFAULT_MIN_NORMAL_VELOCITY;
	#maxNormalVelocity = DEFAULT_MAX_NORMAL_VELOCITY;
	#increment = DEFAULT_INCREMENT;
	#fullLoopIncrement = DEFAULT_FULL_LOOP_INCREMENT;
	#snapShotStartPoint = DEFAULT_SNAPSHOT_START_POINT;
	#boneVelocity = DEFAULT_BONE_VELOCITY;
	#boneVelocityMax = DEFAULT_BONE_VELOCITY_MAX;
	#copyColor = DEFAULT_COPY_COLOR;
	#copyAlpha = DEFAULT_COPY_ALPHA;
	#copyRadius = DEFAULT_COPY_RADIUS;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nSnapshotControlPointNumber':
				this.#snapshotControlPointNumber = param.getValueAsNumber() ?? DEFAULT_SNAPSHOT_CONTROL_POINT_NUMBER;
				break;
			case 'm_bRandom':
				this.#random = param.getValueAsBool() ?? DEFAULT_RANDOM;
				break;
			case 'm_nRandomSeed':
				this.#randomSeed = param.getValueAsNumber() ?? DEFAULT_RANDOM_SEED;
				break;
			case 'm_bRigid':
				this.#rigid = param.getValueAsBool() ?? DEFAULT_RIGID;
				break;
			case 'm_bSetNormal':
				this.#setNormal = param.getValueAsBool() ?? DEFAULT_SET_NORMAL;
				break;
			case 'm_bIgnoreDt':
				console.error('do this param', paramName, param);
				this.#ignoreDt = param;
				break;
			case 'm_flMinNormalVelocity':
				console.error('do this param', paramName, param);
				this.#minNormalVelocity = param;
				break;
			case 'm_flMaxNormalVelocity':
				console.error('do this param', paramName, param);
				this.#maxNormalVelocity = param;
				break;
			case 'm_flIncrement':
				console.error('do this param', paramName, param);
				this.#increment = param;
				break;
			case 'm_nFullLoopIncrement':
				console.error('do this param', paramName, param);
				this.#fullLoopIncrement = (param);
				break;
			case 'm_nSnapShotStartPoint':
				console.error('do this param', paramName, param);
				this.#snapShotStartPoint = (param);
				break;
			case 'm_flBoneVelocity':
				console.error('do this param', paramName, param);
				this.#boneVelocity = param;
				break;
			case 'm_flBoneVelocityMax':
				console.error('do this param', paramName, param);
				this.#boneVelocityMax = param;
				break;
			case 'm_bCopyColor':
				console.error('do this param', paramName, param);
				this.#copyColor = param;
				break;
			case 'm_bCopyAlpha':
				this.#copyAlpha = param.getValueAsBool() ?? DEFAULT_COPY_ALPHA;
				break;
			case 'm_bCopyRadius':
				console.error('do this param', paramName, param);
				this.#copyRadius = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: use all parameters
		const system = this.system;
		const snapshot = system.getControlPoint(this.#snapshotControlPointNumber)?.snapshot;

		if (!snapshot) {
			if (TESTING) {
				console.warn(`Missing snapshot for cp ${this.#snapshotControlPointNumber} in system ${this.system.name}`, system);
			}
			return;
		}

		const cp = system.getControlPoint(this.controlPointNumber);

		if (!cp) {
			if (TESTING) {
				console.warn(`Missing cp ${this.controlPointNumber} in system ${this.system.name}`, system);
			}
			return;
		}

		/*let attributeToReadName = ATTRIBUTE_NAME_PER_FIELD[this.attributeToRead];
		if (TESTING && attributeToReadName === undefined) {
			throw 'Unknown field';
		}*/
		let attributeId;
		if (this.#random) {
			attributeId = (snapshot.particleCount * Math.random() << 0) % snapshot.particleCount;
		} else {
			attributeId = (particle.id - 1) % snapshot.particleCount;
		}

		const positionAttribute = snapshot.attributes['position'];
		if (!positionAttribute) {
			if (TESTING) {
				console.warn(`Cannot find snapshot attribute position in system ${this.system.name}`, snapshot);
			}
			return;
		}

		const position = positionAttribute[attributeId];
		particle.setInitialField(PARTICLE_FIELD_POSITION, position);

		particle.initialSkinnedPosition = position;
		const skinningAttribute = snapshot.attributes['skinning'];
		if (skinningAttribute) {
			particle.skinning = skinningAttribute[attributeId];
		}

		const hitboxAttribute = snapshot.attributes['hitbox'];
		if (hitboxAttribute) {
			particle.snapHitbox = hitboxAttribute[attributeId];
		}

		const hitboxOffsetAttribute = snapshot.attributes['hitbox_offset'];
		if (hitboxOffsetAttribute) {
			particle.snapHitboxOffset = hitboxOffsetAttribute[attributeId];
		}

		if (this.#rigid) {
			if (TESTING && !this.#rigidOnce) {
				console.warn('Code me');
				this.#rigidOnce = true;
			}
			return;
		}

		let bone, boneName, boneWeight, boneMat;
		const model = cp.model;
		if (!model) {
			if (TESTING) {
				console.warn(`Cannot find cp model in system ${this.system.name}`, cp);
			}
			return;
		}

		const skeleton = model.skeleton;
		if (!skeleton) {
			if (TESTING) {
				console.warn(`Model doesnot have a skeleton in system ${this.system.name}`, model);
			}
			return;
		}

		const particleSkinning = particle.skinning;
		const particleInitialPosition = particle.initialSkinnedPosition;
		const particleInitialNormal = particle.initialSkinnedNormal ?? DEFAULT_PARTICLE_NORMAL;

		if (particleSkinning && particleInitialPosition) {
			mat[0] = 0; mat[1] = 0; mat[2] = 0;
			mat[4] = 0; mat[5] = 0; mat[6] = 0;
			mat[8] = 0; mat[9] = 0; mat[10] = 0;
			mat[12] = 0; mat[13] = 0; mat[14] = 0;
			for (let i = 0; i < 4; ++i) {
				boneName = particleSkinning.bones[i];
				if (boneName) {
					bone = skeleton.getBoneByName(boneName);
					boneWeight = particleSkinning.weights[i];
					if (bone && boneWeight) {
						boneMat = bone ? bone.boneMat : IDENTITY_MAT4;

						mat[0] += boneWeight * boneMat[0];
						mat[1] += boneWeight * boneMat[1];
						mat[2] += boneWeight * boneMat[2];

						mat[4] += boneWeight * boneMat[4];
						mat[5] += boneWeight * boneMat[5];
						mat[6] += boneWeight * boneMat[6];

						mat[8] += boneWeight * boneMat[8];
						mat[9] += boneWeight * boneMat[9];
						mat[10] += boneWeight * boneMat[10];

						mat[12] += boneWeight * boneMat[12];
						mat[13] += boneWeight * boneMat[13];
						mat[14] += boneWeight * boneMat[14];
					}
				}
			}
			//console.error(mat);
			vec3.transformMat4(particle.position, particleInitialPosition, mat);
			mat3.normalFromMat4(nmat, mat);
			vec3.transformMat3(particle.normal, particleInitialNormal, nmat);
			vec3.copy(particle.prevPosition, particle.position);
		} else {
			//Probably should do it better, but it just works
			const particleHitbox = particle.snapHitbox;
			const particleHitboxOffset = particle.snapHitboxOffset;
			if (particleHitbox) {
				bone = skeleton.getBoneByName(particleHitbox);
				if (bone) {
					boneMat = bone ? bone.boneMat : IDENTITY_MAT4;

					vec3.transformMat4(particle.position, particleInitialPosition, boneMat);
					mat3.normalFromMat4(nmat, boneMat);
					vec3.transformMat3(particle.normal, particleInitialNormal, nmat);
					vec3.copy(particle.prevPosition, particle.position);

				}
			}
		}
	}
}
RegisterSource2ParticleOperator('C_INIT_InitSkinnedPositionFromCPSnapshot', InitSkinnedPositionFromCPSnapshot);
