import { RandomFloatExp } from '../../../../../math/functions';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class RandomLifeTime extends Operator {
	lifetimeMin = 0;
	lifetimeMax = 0;
	lifetimeRandExponent = 1;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_fLifetimeMin':
				this.lifetimeMin = (param);
				break;
			case 'm_fLifetimeMax':
				this.lifetimeMax = (param);
				break;
			case 'm_fLifetimeRandExponent':
				this.lifetimeRandExponent = (param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime) {
		particle.setInitialTTL(RandomFloatExp(this.lifetimeMin, this.lifetimeMax, this.lifetimeRandExponent));
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomLifeTime', RandomLifeTime);
