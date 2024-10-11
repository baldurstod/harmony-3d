import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { RandomFloatExp } from '../../../../../math/functions';

export class RandomScalar extends Operator {
	min = 0;
	max = 0;
	exponent = 1;
	fieldOutput = PARTICLE_FIELD_RADIUS;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flMin':
				this.min = value;
				break;
			case 'm_flMax':
				this.max = value;
				break;
			case 'm_flExponent':
				this.exponent = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		particle.setInitialField(this.fieldOutput, RandomFloatExp(this.min, this.max, this.exponent));
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomScalar', RandomScalar);
