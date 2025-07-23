import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class LockToBone extends Operator {
	#hitboxSetName = 'default';
	#lifeTimeFadeStart = 0;
	#lifeTimeFadeEnd = 0;
	#jumpThreshold = 100;
	#prevPosScale = 1;
	#rigid = false;
	#useBones = false;
	#rotationSetType = null;
	#rigidRotationLock = false;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_HitboxSetName':
				this.#hitboxSetName = param.getValueAsString() ?? '';
				break;
			case 'm_flLifeTimeFadeStart':
				console.error('do this param', paramName, param);
				this.#lifeTimeFadeStart = param;
				break;
			case 'm_flLifeTimeFadeEnd':
				console.error('do this param', paramName, param);
				this.#lifeTimeFadeEnd = param;
				break;
			case 'm_flJumpThreshold':
				console.error('do this param', paramName, param);
				this.#jumpThreshold = param;
				break;
			case 'm_flPrevPosScale':
				console.error('do this param', paramName, param);
				this.#prevPosScale = param;
				break;
			case 'm_bRigid':
				console.error('do this param', paramName, param);
				this.#rigid = param;
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
