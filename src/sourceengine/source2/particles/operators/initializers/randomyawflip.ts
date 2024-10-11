import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class RandomYawFlip extends Operator {
	percent = 0.5;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flPercent':
				this.percent = Number(value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		particle.rotationYaw += (Math.random() < this.percent) ? Math.PI : 0;
	}

	initMultipleOverride() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomYawFlip', RandomYawFlip);
