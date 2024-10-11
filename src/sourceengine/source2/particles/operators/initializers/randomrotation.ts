import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_ROTATION_ROLL } from '../../../../common/particles/particlefields';
import { TWO_PI, DEG_TO_RAD } from '../../../../../math/constants';
import { RandomFloat, RandomFloatExp } from '../../../../../math/functions';

export class RandomRotation extends Operator {
	radians = 0;
	radiansMin = 0;
	radiansMax = TWO_PI;
	rotationRandExponent = 1;
	randomlyFlipDirection = false;//TODO: actual default value

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flDegreesMin':
				this.radiansMin = DEG_TO_RAD * value;
				break;
			case 'm_flDegreesMax':
				this.radiansMax = DEG_TO_RAD * value;
				break;
			case 'm_flDegrees':
				this.radians = DEG_TO_RAD * value;
				break;
			case 'm_flRotationRandExponent':
				this.rotationRandExponent = value;
				break;
			case 'm_bRandomlyFlipDirection':
				this.randomlyFlipDirection = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		let rotation = this.radians + RandomFloatExp(this.radiansMin, this.radiansMax, this.rotationRandExponent);
		if (this.randomlyFlipDirection && (RandomFloat(-1, 1) >= 0)) {
			rotation -= rotation;
		}
		particle.setInitialField(/*this.fieldOutput*/PARTICLE_FIELD_ROTATION_ROLL, rotation);
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomRotation', RandomRotation);
