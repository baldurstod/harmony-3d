import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { RandomFloatExp } from '../../../../../math/functions';

export class RandomLifeTime extends Operator {
	lifetimeMin = 0;
	lifetimeMax = 0;
	lifetimeRandExponent = 1;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_fLifetimeMin':
				this.lifetimeMin = Number(value);
				break;
			case 'm_fLifetimeMax':
				this.lifetimeMax = Number(value);
				break;
			case 'm_fLifetimeRandExponent':
				this.lifetimeRandExponent = Number(value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		particle.setInitialTTL(RandomFloatExp(this.lifetimeMin, this.lifetimeMax, this.lifetimeRandExponent));
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomLifeTime', RandomLifeTime);
