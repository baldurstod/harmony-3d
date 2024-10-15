import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

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

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_HitboxSetName':
				this.hitboxSetName = value;
				break;
			case 'm_flLifeTimeFadeStart':
				this.lifeTimeFadeStart = value;
				break;
			case 'm_flLifeTimeFadeEnd':
				this.lifeTimeFadeEnd = value;
				break;
			case 'm_flJumpThreshold':
				this.jumpThreshold = value;
				break;
			case 'm_flPrevPosScale':
				this.prevPosScale = value;
				break;
			case 'm_bRigid':
				this.rigid = value;
				break;
			case 'm_bUseBones':
				this.useBones = value;
				break;
			case 'm_nRotationSetType':
				this.rotationSetType = Number(value);
				break;
			case 'm_bRigidRotationLock':
				this.rigidRotationLock = value;
				break;
			case 'm_vecRotation':
			case 'm_flRotLerp':
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		//console.error('TODO');
	}
}
RegisterSource2ParticleOperator('C_OP_LockToBone', LockToBone);
