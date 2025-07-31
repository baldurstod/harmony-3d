import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2ParticleModelInput } from '../utils/modelinput';
import { Source2ParticleTransformInput } from '../utils/transforminput';

const vec = vec3.create();

const DEFAULT_FORCE_IN_MODEL = 0;
const DEFAULT_SCALE_TO_VOLUME = false;
const DEFAULT_HITBOX_VALUE_FROM_CONTROL_POINT_INDEX = -1;
const DEFAULT_BONE_VELOCITY = 0;
const DEFAULT_MAX_BONE_VELOCITY = 0;
const DEFAULT_HITBOX_SET_NAME = 'default';
const DEFAULT_LOCAL_COORDS = false;
const DEFAULT_USE_BONES = false;

export class CreateOnModel extends Operator {
	#modelInput = new Source2ParticleModelInput();
	#transformInput = new Source2ParticleTransformInput();
	#forceInModel = DEFAULT_FORCE_IN_MODEL;
	#scaleToVolume = DEFAULT_SCALE_TO_VOLUME;
	#hitboxValueFromControlPointIndex = DEFAULT_HITBOX_VALUE_FROM_CONTROL_POINT_INDEX;
	#boneVelocity = DEFAULT_BONE_VELOCITY;//inherited velocity scale
	#maxBoneVelocity = DEFAULT_MAX_BONE_VELOCITY;//maximum inherited velocity
	#hitboxSetName = DEFAULT_HITBOX_SET_NAME;
	#localCoords = DEFAULT_LOCAL_COORDS;//bias in local space
	#useBones = DEFAULT_USE_BONES;//use bones instead of hitboxes

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nForceInModel':
				this.#forceInModel = param.getValueAsNumber() ?? DEFAULT_FORCE_IN_MODEL;
				break;
			case 'm_bScaleToVolume':
				this.#scaleToVolume = param.getValueAsBool() ?? DEFAULT_SCALE_TO_VOLUME;
				break;
			case 'm_nHitboxValueFromControlPointIndex':
				this.#hitboxValueFromControlPointIndex = param.getValueAsNumber() ?? DEFAULT_HITBOX_VALUE_FROM_CONTROL_POINT_INDEX;
				break;
			case 'm_flBoneVelocity':
				this.#boneVelocity = param.getValueAsNumber() ?? DEFAULT_BONE_VELOCITY;
				break;
			case 'm_flMaxBoneVelocity':
				console.error('do this param', paramName, param);
				this.#maxBoneVelocity  = param.getValueAsNumber() ?? DEFAULT_MAX_BONE_VELOCITY;
				break;
			case 'm_HitboxSetName':
				this.#hitboxSetName = param.getValueAsString() ?? DEFAULT_HITBOX_SET_NAME;
				break;
			case 'm_bLocalCoords':
				this.#localCoords = param.getValueAsBool() ?? DEFAULT_LOCAL_COORDS;
				break;
			case 'm_bUseBones':
				this.#useBones = param.getValueAsBool() ?? DEFAULT_USE_BONES;
				break;
			case 'm_modelInput':
			case 'm_transformInput':
			case 'm_nDesiredHitbox':
			case 'm_vecHitBoxScale':
			case 'm_vecDirectionBias':
				//used in doInit
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		// TODO: use m_vecHitBoxScale, forceInModel, directionBias, hitboxSetName, m_modelInput, m_transformInput, m_nDesiredHitbox, m_vecDirectionBias
		//const hitBoxScale = this.getParamVectorValue('m_vecHitBoxScale');

		const controlPoint = this.system.getControlPoint(this.controlPointNumber);
		if (controlPoint) {
			const controllingModel = controlPoint.parentModel;
			if ((controllingModel as any)?.getRandomPointOnModel) {
				const bones: any[] = []/*TODO: improve type*/;
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
