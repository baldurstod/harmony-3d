import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const vec = vec3.create();

const DEFAULT_HEIGHT_CP = 1;
const DEFAULT_DESIRED_HEIGHT = 1;
const DEFAULT_FORCE_Z = false;

export class CreateOnModelAtHeight extends Operator {// TODO: try to mutualize with CreateOnModel
	#heightCP = DEFAULT_HEIGHT_CP;
	#desiredHeight = DEFAULT_HEIGHT_CP;
	#forceZ = DEFAULT_FORCE_Z;
	/*
	#forceInModel = 0;
	#desiredHitbox = -1;
	#hitboxValueFromControlPointIndex = -1;
	#boneVelocity = 0;
	#maxBoneVelocity = 0;
	#directionBias = vec3.create();
	#hitboxSetName = 'default';
	#localCoords = false;
	#useBones = false;
	*/

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nHeightCP':
				this.#heightCP = param.getValueAsNumber() ?? DEFAULT_HEIGHT_CP;
				break;
			case 'm_flDesiredHeight':
				this.#heightCP = param.getValueAsNumber() ?? DEFAULT_DESIRED_HEIGHT;
				break;
			case 'm_bForceZ':
				this.#forceZ = param.getValueAsBool() ?? DEFAULT_FORCE_Z;
				break;
			case 'm_vecHitBoxScale':
				// used in doInit
				break;
				/*
			case 'm_nForceInModel':
				this.#forceInModel = param.getValueAsNumber() ?? 0;
				break;
			case 'm_nDesiredHitbox':
				console.error('do this param', paramName, param);
				this.#desiredHitbox = (param);
				break;
			case 'm_nHitboxValueFromControlPointIndex':
				console.error('do this param', paramName, param);
				this.#hitboxValueFromControlPointIndex = (param);
				break;
			case 'm_flBoneVelocity':
				console.error('do this param', paramName, param);
				this.#boneVelocity = param;
				break;
			case 'm_flMaxBoneVelocity':
				console.error('do this param', paramName, param);
				this.#maxBoneVelocity = param;
				break;
			case 'm_vecDirectionBias':
				param.getValueAsVec3(this.#directionBias);
				break;
			case 'm_HitboxSetName':
				this.#hitboxSetName = param.getValueAsString() ?? '';
				break;
			case 'm_bLocalCoords':
				this.#localCoords = param.getValueAsBool() ?? false;
				break;
			case 'm_bUseBones':
				console.error('do this param', paramName, param);
				this.#useBones = param;
				break;
				*/
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		// TODO
		/*
		// TODO: use m_vecHitBoxScale, forceInModel, directionBias, hitboxSetName
		//const hitBoxScale = this.getParamVectorValue('m_vecHitBoxScale');

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
		}*/
	}
}
RegisterSource2ParticleOperator('C_INIT_CreateOnModelAtHeight', CreateOnModelAtHeight);
