
import { Operator, Source2OperatorParamValue } from '../operator';
import { OperatorParam } from '../operatorparam';
import { } from '../operatorparams';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_EMIT_RATE = 100;// TODO: check default value
const DEFAULT_EMISSION_DURATION = 100;// TODO: check default value

export class ContinuousEmitter extends Operator {
	//#emitRate = DEFAULT_EMIT_RATE;
	#remainder = 0;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flEmissionDuration':
			case 'm_flEmitRate':
				// used in doEmit
				//this.#emitRate = param.getValueAsNumber() ?? DEFAULT_EMIT_RATE;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doEmit(elapsedTime: number) {
		// TODO: use m_flEmissionDuration
		const emissionDuration = this.getParamScalarValue('m_flEmissionDuration') ?? DEFAULT_EMISSION_DURATION;

		const emission_start_time = this.getParameter('emission_start_time') ?? 0;
		//let emitRate = this.#emitRate;
		const emission_duration = this.getParameter('emission_duration') ?? 0;

		const fade = this.getOperatorFade();
		const emitRate = (this.getParamScalarValue('m_flEmitRate') ?? DEFAULT_EMIT_RATE) * fade;

		let currentTime = this.system.currentTime;

		if (currentTime < emission_start_time) return;
		if (emission_duration != 0 && (currentTime > emission_start_time + emission_duration)) return;

		let nToEmit = this.#remainder + elapsedTime * emitRate;
		this.#remainder = nToEmit % 1;
		nToEmit = Math.floor(nToEmit);

		const timeStampStep = elapsedTime / nToEmit;
		for (let i = 0; i < nToEmit; ++i) {
			const particle = this.emitParticle(currentTime, elapsedTime);
			if (particle == null) {
				break; // Break if a particule can't emitted (max reached)
			}
			currentTime += timeStampStep;
		}
	}
}
RegisterSource2ParticleOperator('C_OP_ContinuousEmitter', ContinuousEmitter);
