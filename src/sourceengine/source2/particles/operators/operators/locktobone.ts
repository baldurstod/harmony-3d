import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class LockToBone extends Operator {
	hitboxSetName = 'default';
	lifeTimeFadeStart = 0;
	lifeTimeFadeEnd = 0;
	jumpThreshold = 100;
	prevPosScale = 1;
	rigid = false;
	useBones = false;
	rotationSetType = null;
	rigidRotationLock = false;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_HitboxSetName':
				this.hitboxSetName = param;
				break;
			case 'm_flLifeTimeFadeStart':
				this.lifeTimeFadeStart = param;
				break;
			case 'm_flLifeTimeFadeEnd':
				this.lifeTimeFadeEnd = param;
				break;
			case 'm_flJumpThreshold':
				this.jumpThreshold = param;
				break;
			case 'm_flPrevPosScale':
				this.prevPosScale = param;
				break;
			case 'm_bRigid':
				this.rigid = param;
				break;
			case 'm_bUseBones':
				this.useBones = param;
				break;
			case 'm_nRotationSetType':
				this.rotationSetType = (param);
				break;
			case 'm_bRigidRotationLock':
				this.rigidRotationLock = param;
				break;
			case 'm_vecRotation':
			case 'm_flRotLerp':
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime) {
		//console.error('TODO');
	}
}
RegisterSource2ParticleOperator('C_OP_LockToBone', LockToBone);
