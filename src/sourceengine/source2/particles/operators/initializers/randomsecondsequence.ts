import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_SEQUENCE_MIN = 0;// TODO: check default value
const DEFAULT_SEQUENCE_MAX = 0;// TODO: check default value

export class RandomSecondSequence extends Operator {
	#sequenceMin = DEFAULT_SEQUENCE_MIN
	#sequenceMax = DEFAULT_SEQUENCE_MAX;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nSequenceMin':
				this.#sequenceMin = param.getValueAsNumber() ?? DEFAULT_SEQUENCE_MIN;
				break;
			case 'm_nSequenceMax':
				this.#sequenceMax = param.getValueAsNumber() ?? DEFAULT_SEQUENCE_MAX;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle: Source2Particle): void {
		particle.sequence2 = Math.round((this.#sequenceMax - this.#sequenceMin) * Math.random()) + this.#sequenceMin;
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomSecondSequence', RandomSecondSequence);
