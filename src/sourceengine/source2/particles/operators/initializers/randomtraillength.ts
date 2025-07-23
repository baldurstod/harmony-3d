import { RandomFloatExp } from '../../../../../math/functions';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class RandomTrailLength extends Operator {
	minLength = 0.1;
	maxLength = 0.1;
	lengthRandExponent = 1;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flMinLength':
				this.minLength = (param);
				break;
			case 'm_flMaxLength':
				this.maxLength = (param);
				break;
			case 'm_flLengthRandExponent':
				this.lengthRandExponent = (param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime) {
		particle.trailLength = RandomFloatExp(this.minLength, this.maxLength, this.lengthRandExponent);
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomTrailLength', RandomTrailLength);
