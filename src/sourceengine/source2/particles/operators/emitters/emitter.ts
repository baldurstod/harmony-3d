import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';

export const DEFAULT_EMITTER_INDEX = -1;
const DEFAULT_EMISSION_DURATION = 0;
const DEFAULT_START_TIME = 0;

export class Emitter extends Operator {
	emitterIndex = DEFAULT_EMITTER_INDEX;
	emissionDuration = DEFAULT_EMISSION_DURATION;
	startTime = DEFAULT_START_TIME;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nEmitterIndex':
				this.emitterIndex = param.getValueAsNumber() ?? DEFAULT_EMITTER_INDEX;
				break;
			case 'm_flEmissionDuration':
				this.emissionDuration = param.getValueAsNumber() ?? DEFAULT_EMISSION_DURATION;
				break;
			case 'm_flStartTime':
				this.startTime = param.getValueAsNumber() ?? DEFAULT_START_TIME;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	emitParticle(creationTime: number, elapsedTime: number): Source2Particle | undefined {
		if (!this.system || this.disableOperator) {
			return;
		}
		return this.system.createParticle(this.emitterIndex, creationTime, elapsedTime);
	}
}
