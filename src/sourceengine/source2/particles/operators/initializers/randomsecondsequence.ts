import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class RandomSecondSequence extends Operator {
	sequenceMin = 0;
	sequenceMax = 0;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nSequenceMin':
				this.sequenceMin = (param);
				break;
			case 'm_nSequenceMax':
				this.sequenceMax = (param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime) {
		particle.sequence2 = Math.round((this.sequenceMax - this.sequenceMin) * Math.random()) + this.sequenceMin;
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomSecondSequence', RandomSecondSequence);
