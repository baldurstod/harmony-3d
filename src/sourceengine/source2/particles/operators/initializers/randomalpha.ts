import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { RandomFloatExp } from '../../../../../math/functions';

export class RandomAlpha extends Operator {
	alphaMin = 255;
	alphaMax = 255;
	alphaRandExponent = 1;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nAlphaMin':
				this.alphaMin = Number(value);
				break;
			case 'm_nAlphaMax':
				this.alphaMax = Number(value);
				break;
			case 'm_flAlphaRandExponent':
				this.alphaRandExponent = Number(value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		let alpha = RandomFloatExp(this.alphaMin, this.alphaMax, this.alphaRandExponent) / 255.0;
		particle.alpha = alpha;
		particle.startAlpha = alpha;
		//TODO: use fieldOutput
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomAlpha', RandomAlpha);
