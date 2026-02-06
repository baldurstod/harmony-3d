import { once } from 'harmony-utils';
import { Source2ParticleRotationSetType, Source2ParticleVectorField, stringToRotationSetType } from '../../enums';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';


export const DEFAULT_LIFE_TIME_FADE_START = 0;
export const DEFAULT_LIFE_TIME_FADE_END = 0;
export const DEFAULT_JUMP_THRESHOLD = 100;
export const DEFAULT_PREV_POS_SCALE = 1;
export const DEFAULT_HITBOX_SET_NAME = 'default';
export const DEFAULT_RIGID = false;
export const DEFAULT_USE_BONES = false;
export const DEFAULT_FIELD_OUTPUT = Source2ParticleVectorField.Position;
export const DEFAULT_FIELD_OUTPUT_PREV = Source2ParticleVectorField.Position;
export const DEFAULT_ROTATION_SET_TYPE = Source2ParticleRotationSetType.None;
export const DEFAULT_RIGID_ROTATION_LOCK = false;

export class LockToBone extends Operator {
	#lifeTimeFadeStart = DEFAULT_LIFE_TIME_FADE_START;
	#lifeTimeFadeEnd = DEFAULT_LIFE_TIME_FADE_END;
	#jumpThreshold = DEFAULT_JUMP_THRESHOLD;
	#prevPosScale = DEFAULT_PREV_POS_SCALE;
	#hitboxSetName = DEFAULT_HITBOX_SET_NAME;
	#rigid = DEFAULT_RIGID;
	#useBones = DEFAULT_USE_BONES;//use bones instead of hitboxes
	#fieldOutput = DEFAULT_FIELD_OUTPUT;
	#fieldOutputPrev = DEFAULT_FIELD_OUTPUT_PREV;
	#rotationSetType = DEFAULT_ROTATION_SET_TYPE;
	#rigidRotationLock = DEFAULT_RIGID_ROTATION_LOCK;




	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flLifeTimeFadeStart':
				this.#lifeTimeFadeStart = param.getValueAsNumber() ?? DEFAULT_LIFE_TIME_FADE_START;
				break;
			case 'm_flLifeTimeFadeEnd':
				this.#lifeTimeFadeEnd = param.getValueAsNumber() ?? DEFAULT_LIFE_TIME_FADE_END;
				break;
			case 'm_flJumpThreshold':
				this.#jumpThreshold = param.getValueAsNumber() ?? DEFAULT_JUMP_THRESHOLD;
				break;
			case 'm_flPrevPosScale':
				this.#prevPosScale = param.getValueAsNumber() ?? DEFAULT_PREV_POS_SCALE;
				break;
			case 'm_HitboxSetName':
				this.#hitboxSetName = param.getValueAsString() ?? DEFAULT_HITBOX_SET_NAME;
				break;
			case 'm_bRigid':
				this.#rigid = param.getValueAsBool() ?? DEFAULT_RIGID;
				break;
			case 'm_bUseBones':
				this.#useBones = param.getValueAsBool() ?? DEFAULT_USE_BONES;
				break;
			case 'm_nFieldOutput':
				this.#fieldOutput = param.getValueAsNumber() ?? DEFAULT_FIELD_OUTPUT;
				break;
			case 'm_nFieldOutputPrev':
				this.#fieldOutputPrev = param.getValueAsNumber() ?? DEFAULT_FIELD_OUTPUT_PREV;
				break;
			case 'm_nRotationSetType':
				this.#rotationSetType = stringToRotationSetType(param.getValueAsString()) ?? DEFAULT_ROTATION_SET_TYPE;
				break;
			case 'm_bRigidRotationLock':
				this.#rigidRotationLock = param.getValueAsBool() ?? DEFAULT_RIGID_ROTATION_LOCK;
				break;
			case 'm_modelInput':
			case 'm_transformInput':
			case 'm_vecRotation':
			case 'm_flRotLerp':
				// used in doOperate
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(): void {
		error();
		// TODO: use 'm_modelInput''m_transformInput', m_vecRotation, m_flRotLerp
		/*
					m_modelInput =
			{
				m_nType = "PM_TYPE_CONTROL_POINT"
				m_nControlPoint = 2
			}
			m_transformInput =
			{
				m_bUseOrientation = false
				m_nControlPoint = 1
			}
				*/
	}
}
RegisterSource2ParticleOperator('C_OP_LockToBone', LockToBone);

const error = once(() => console.error('TODO C_OP_LockToBone'));
