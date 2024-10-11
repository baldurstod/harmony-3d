import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class RandomSecondSequence extends Operator {
	sequenceMin = 0;
	sequenceMax = 0;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nSequenceMin':
				this.sequenceMin = Number(value);
				break;
			case 'm_nSequenceMax':
				this.sequenceMax = Number(value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		particle.sequence2 = Math.round((this.sequenceMax - this.sequenceMin) * Math.random()) + this.sequenceMin;
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomSecondSequence', RandomSecondSequence);
