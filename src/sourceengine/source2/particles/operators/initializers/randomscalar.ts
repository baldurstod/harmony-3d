import { RandomFloatExp } from '../../../../../math/functions';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class RandomScalar extends Operator {
	min = 0;
	max = 0;
	exponent = 1;
	#fieldOutput = PARTICLE_FIELD_RADIUS;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flMin':
				this.min = param;
				break;
			case 'm_flMax':
				this.max = param;
				break;
			case 'm_flExponent':
				this.exponent = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime) {
		particle.setInitialField(this.#fieldOutput, RandomFloatExp(this.min, this.max, this.exponent));
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomScalar', RandomScalar);
