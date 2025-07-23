import { RandomFloatExp } from '../../../../../math/functions';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class RandomRadius extends Operator {
	radiusMin = 1;
	radiusMax = 1;
	radiusRandExponent = 1;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flRadiusMin':
				this.radiusMin = param;
				break;
			case 'm_flRadiusMax':
				this.radiusMax = param;
				break;
			case 'm_flRadiusRandExponent':
				this.radiusRandExponent = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime) {
		particle.setInitialRadius(RandomFloatExp(this.radiusMin, this.radiusMax, this.radiusRandExponent));
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomRadius', RandomRadius);
