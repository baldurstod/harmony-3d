
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { } from '../operatorparams';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_EMISSION_DURATION = 0;
const DEFAULT_EMISSION_START_TIME = 0;
const DEFAULT_EMIT_RATE = 100;

export class ContinuousEmitter extends Operator {
	//#emitRate = DEFAULT_EMIT_RATE;
	#remainder = 0;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flEmissionDuration':
			case 'm_flEmitRate':
			case 'm_flStartTime':
				// used in doEmit
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doEmit(elapsedTime: number) {
		// TODO: use m_flEmissionDuration
		const emissionDuration = this.getParamScalarValue('m_flEmissionDuration') ?? DEFAULT_EMISSION_DURATION;

		const emissionStartTime = this.getParamScalarValue('m_flStartTime') ??  DEFAULT_EMISSION_START_TIME;
		//let emitRate = this.#emitRate;
		//const emissionDuration = this.getParameter('emission_duration') ?? 0;

		const fade = this.getOperatorFade();
		const emitRate = (this.getParamScalarValue('m_flEmitRate') ?? DEFAULT_EMIT_RATE) * fade;

		let currentTime = this.system.currentTime;

		if (currentTime < emissionStartTime) return;
		if (emissionDuration != 0 && (currentTime > emissionStartTime + emissionDuration)) return;

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
