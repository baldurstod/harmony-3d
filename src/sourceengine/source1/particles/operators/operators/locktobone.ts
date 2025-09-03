import { mat4, vec3 } from 'gl-matrix';
import { PARAM_TYPE_INT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

const tempVec3 = vec3.create();
const tempMat4 = mat4.create();
const IDENTITY_MAT4 = mat4.create();

export class LockToBone extends Source1ParticleOperator {
	static functionName = 'Movement Lock to Bone';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('control_point_number', PARAM_TYPE_INT, 0);
	}

	doOperate(particle: Source1Particle, elapsedTime: number) {
		const controlPoint = particle.system.getControlPoint(this.getParameter('control_point_number'));
		if (controlPoint) {
			// TODO : Actually we should get the model parenting the control point
			const controllingModel = controlPoint.parentModel;
			if (controllingModel) {
				const bones = particle.bones;
				const initialVec = particle.initialVec;
				if (bones && initialVec) {

					tempMat4[0] = 0; tempMat4[1] = 0; tempMat4[2] = 0;
					tempMat4[4] = 0; tempMat4[5] = 0; tempMat4[6] = 0;
					tempMat4[8] = 0; tempMat4[9] = 0; tempMat4[10] = 0;
					tempMat4[12] = 0; tempMat4[13] = 0; tempMat4[14] = 0;

					vec3.copy(tempVec3, initialVec);

					for (const [bone, boneWeight] of bones) {
						let boneMat;
						if (bone) {
							boneMat = mat4.fromRotationTranslationScale(mat4.create(), bone.worldQuat, bone.worldPos, bone.worldScale);
						} else {
							boneMat = IDENTITY_MAT4;
						}

						if (boneWeight && boneMat) {
							tempMat4[0] += boneWeight * boneMat[0];
							tempMat4[1] += boneWeight * boneMat[1];
							tempMat4[2] += boneWeight * boneMat[2];

							tempMat4[4] += boneWeight * boneMat[4];
							tempMat4[5] += boneWeight * boneMat[5];
							tempMat4[6] += boneWeight * boneMat[6];

							tempMat4[8] += boneWeight * boneMat[8];
							tempMat4[9] += boneWeight * boneMat[9];
							tempMat4[10] += boneWeight * boneMat[10];

							tempMat4[12] += boneWeight * boneMat[12];
							tempMat4[13] += boneWeight * boneMat[13];
							tempMat4[14] += boneWeight * boneMat[14];
						}
					}
					vec3.transformMat4(tempVec3, tempVec3, tempMat4);
					if (particle.initialVecOffset) {
						vec3.add(tempVec3, tempVec3, particle.initialVecOffset);
					}

					vec3.copy(particle.prevPosition, particle.position);
					vec3.copy(particle.position, tempVec3);
				}
			}
		}
	}
}
Source1ParticleOperators.registerOperator(LockToBone);
