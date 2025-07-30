import { DEG_TO_RAD, TWO_PI } from '../../../../../math/constants';
import { RandomFloat, RandomFloatExp } from '../../../../../math/functions';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

//disabled: replaced by C_INIT_InitFloat
/*
export class RandomRotationSpeed extends Operator {
	radians = 0;
	radiansMin = 0;
	radiansMax = TWO_PI;
	rotationRandExponent = 1;
	randomlyFlipDirection = false;//TODO: actual default value ?

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flDegreesMin':
				this.radiansMin = DEG_TO_RAD * param;
				break;
			case 'm_flDegreesMax':
				this.radiansMax = DEG_TO_RAD * param;
				break;
			case 'm_flDegrees':
				this.radians = DEG_TO_RAD * param;
				break;
			case 'm_nFieldOutput':
				//NOTE : this parameter seems to have no effect. It's always roll speed
				//this.fieldOutput = (value);
				break;
			case 'm_flRotationRandExponent':
				this.rotationRandExponent = param;
				break;
			case 'm_bRandomlyFlipDirection':
				this.randomlyFlipDirection = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime) {
		let rotation = this.radians + RandomFloatExp(this.radiansMin, this.radiansMax, this.rotationRandExponent);
		if (this.randomlyFlipDirection && (RandomFloat(-1, 1) >= 0)) {
			rotation -= rotation;
		}
		//particle.setInitialField(this.fieldOutput, rotation);
		particle.rotationSpeedRoll = rotation;
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomRotationSpeed', RandomRotationSpeed);
*/
