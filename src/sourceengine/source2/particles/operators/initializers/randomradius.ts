import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { RandomFloatExp } from '../../../../../math/functions';

export class RandomRadius extends Operator {
	radiusMin = 1;
	radiusMax = 1;
	radiusRandExponent = 1;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flRadiusMin':
				this.radiusMin = value;
				break;
			case 'm_flRadiusMax':
				this.radiusMax = value;
				break;
			case 'm_flRadiusRandExponent':
				this.radiusRandExponent = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		particle.setInitialRadius(RandomFloatExp(this.radiusMin, this.radiusMax, this.radiusRandExponent));
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomRadius', RandomRadius);
