import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { RandomFloatExp } from '../../../../../math/functions';

export class RandomTrailLength extends Operator {
	minLength = 0.1;
	maxLength = 0.1;
	lengthRandExponent = 1;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flMinLength':
				this.minLength = Number(value);
				break;
			case 'm_flMaxLength':
				this.maxLength = Number(value);
				break;
			case 'm_flLengthRandExponent':
				this.lengthRandExponent = Number(value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		particle.trailLength = RandomFloatExp(this.minLength, this.maxLength, this.lengthRandExponent);
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomTrailLength', RandomTrailLength);
