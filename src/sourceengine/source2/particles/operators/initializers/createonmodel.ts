import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

let vec = vec3.create();

export class CreateOnModel extends Operator {
	forceInModel = 0;
	desiredHitbox = -1;
	hitboxValueFromControlPointIndex = -1;
	boneVelocity = 0;
	maxBoneVelocity = 0;
	directionBias = vec3.create();
	hitboxSetName = 'default';
	localCoords = false;
	useBones = false;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_vecHitBoxScale':
				break;
			case 'm_nForceInModel':
				this.forceInModel = Number(value);
				break;
			case 'm_nDesiredHitbox':
				this.desiredHitbox = Number(value);
				break;
			case 'm_nHitboxValueFromControlPointIndex':
				this.hitboxValueFromControlPointIndex = Number(value);
				break;
			case 'm_flBoneVelocity':
				this.boneVelocity = value;
				break;
			case 'm_flMaxBoneVelocity':
				this.maxBoneVelocity = value;
				break;
			case 'm_vecDirectionBias':
				vec3.copy(this.directionBias, value);
				break;
			case 'm_HitboxSetName':
				this.hitboxSetName = value;
				break;
			case 'm_bLocalCoords':
				this.localCoords = value;
				break;
			case 'm_bUseBones':
				this.useBones = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		let hitBoxScale = this.getParamVectorValue('m_vecHitBoxScale');

		let controlPoint = this.system.getControlPoint(this.controlPointNumber);
		if (controlPoint) {
			let controllingModel = controlPoint.parentModel;
			if ((controllingModel as any)?.getRandomPointOnModel) {
				let bones = [];
				particle.bones = bones;
				particle.initialVec = vec3.create();
				const position = (controllingModel as any).getRandomPointOnModel(vec3.create(), particle.initialVec, bones);
				if (controlPoint) {
					vec3.copy(particle.position, position);
					vec3.copy(particle.prevPosition, position);
				}
			} else {
				if (controlPoint) {
					vec3.copy(particle.position, controlPoint.getWorldPosition(vec));
					vec3.copy(particle.prevPosition, particle.position);
				}
			}
		}
	}
}
RegisterSource2ParticleOperator('C_INIT_CreateOnModel', CreateOnModel);
