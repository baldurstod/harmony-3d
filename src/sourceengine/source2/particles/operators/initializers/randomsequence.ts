import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class RandomSequence extends Operator {
	#sequenceMin = 0;
	#sequenceMax = 0;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nSequenceMin':
				this.#sequenceMin = param.getValueAsNumber() ?? 0;
				break;
			case 'm_nSequenceMax':
				this.#sequenceMax = param.getValueAsNumber() ?? 0;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		particle.setInitialSequence(Math.round((this.#sequenceMax - this.#sequenceMin) * Math.random()) + this.#sequenceMin);
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomSequence', RandomSequence);
