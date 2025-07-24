import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { DEFAULT_JUMP_THRESHOLD } from './positionlock';


export const DEFAULT_LIFE_TIME_FADE_START = 0;// TODO: check default value
export const DEFAULT_LIFE_TIME_FADE_END = 0;// TODO: check default value
export const DEFAULT_PREV_POS_SCALE = 1;// TODO: check default value
export const DEFAULT_RIGID = false;// TODO: check default value

export class LockToBone extends Operator {
	#hitboxSetName = 'default';
	#lifeTimeFadeStart = DEFAULT_LIFE_TIME_FADE_START;
	#lifeTimeFadeEnd = DEFAULT_LIFE_TIME_FADE_END;
	#jumpThreshold = DEFAULT_JUMP_THRESHOLD;
	#prevPosScale = 1;
	#rigid = DEFAULT_RIGID;
	#useBones = false;
	#rotationSetType = null;
	#rigidRotationLock = false;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_HitboxSetName':
				this.#hitboxSetName = param.getValueAsString() ?? '';
				break;
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
			case 'm_bRigid':// TODO: mutualize ?
				this.#rigid = param.getValueAsBool() ?? DEFAULT_RIGID;
				break;
			case 'm_bUseBones':
				console.error('do this param', paramName, param);
				this.#useBones = param;
				break;
			case 'm_nRotationSetType':
				console.error('do this param', paramName, param);
				this.#rotationSetType = (param);
				break;
			case 'm_bRigidRotationLock':
				console.error('do this param', paramName, param);
				this.#rigidRotationLock = param;
				break;
			case 'm_vecRotation':
			case 'm_flRotLerp':
				// TODO ????
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle | null | Source2Particle[], elapsedTime: number, strength: number): void {
		//console.error('TODO');
	}
}
RegisterSource2ParticleOperator('C_OP_LockToBone', LockToBone);
