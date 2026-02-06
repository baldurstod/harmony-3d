import { mat3, mat4, vec3 } from 'gl-matrix';
import { TESTING } from '../../../../../buildoptions';
import { DEFAULT_PARTICLE_NORMAL, Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const mat = mat4.create();
const nmat = mat3.create();
const IDENTITY_MAT4 = mat4.create();

const DEFAULT_TRANSFORM_NORMALS = false;// TODO: check default value

export class SnapshotRigidSkinToBones extends Operator {
	#transformNormals = DEFAULT_TRANSFORM_NORMALS;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_bTransformNormals':
				//normal seems to be transformed whatever this parameter value is ?
				this.#transformNormals = param.getValueAsBool() ?? DEFAULT_TRANSFORM_NORMALS;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(particle: Source2Particle): void {
		let bone, boneName, boneWeight, boneMat;
		const cp = this.system.getControlPoint(this.controlPointNumber);
		if (!cp) {
			if (TESTING) {
				console.warn(`Missing cp ${this.controlPointNumber} in system ${this.system.name}`, this.system);
			}
			return;
		}

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
			//const particleHitboxOffset = particle.snapHitboxOffset;
			if (particleHitbox) {
				bone = skeleton.getBoneByName(particleHitbox);
				if (bone) {
					boneMat = bone ? bone.boneMat : IDENTITY_MAT4;

					//vec3.transformMat4(particle.position, particleInitialPosition, boneMat);
					mat3.normalFromMat4(nmat, boneMat);
					vec3.transformMat3(particle.normal, particleInitialNormal, nmat);
					vec3.copy(particle.prevPosition, particle.position);

				}
			}
		}
	}
}
RegisterSource2ParticleOperator('C_OP_SnapshotRigidSkinToBones', SnapshotRigidSkinToBones);
RegisterSource2ParticleOperator('C_OP_SnapshotSkinToBones', SnapshotRigidSkinToBones);//TODO: set proper operator
