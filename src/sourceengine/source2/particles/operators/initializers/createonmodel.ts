import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';

const vec = vec3.create();

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

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_vecHitBoxScale':
				break;
			case 'm_nForceInModel':
				this.forceInModel = (param);
				break;
			case 'm_nDesiredHitbox':
				this.desiredHitbox = (param);
				break;
			case 'm_nHitboxValueFromControlPointIndex':
				this.hitboxValueFromControlPointIndex = (param);
				break;
			case 'm_flBoneVelocity':
				this.boneVelocity = param;
				break;
			case 'm_flMaxBoneVelocity':
				this.maxBoneVelocity = param;
				break;
			case 'm_vecDirectionBias':
				vec3.copy(this.directionBias, param);
				break;
			case 'm_HitboxSetName':
				this.hitboxSetName = param;
				break;
			case 'm_bLocalCoords':
				this.localCoords = param;
				break;
			case 'm_bUseBones':
				this.useBones = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime) {
		const hitBoxScale = this.getParamVectorValue('m_vecHitBoxScale');

		const controlPoint = this.system.getControlPoint(this.controlPointNumber);
		if (controlPoint) {
			const controllingModel = controlPoint.parentModel;
			if ((controllingModel as any)?.getRandomPointOnModel) {
				const bones = [];
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
