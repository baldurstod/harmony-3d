import { vec3 } from 'gl-matrix';

import { } from '../operatorparams';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class ContinuousEmitter extends Operator {
	emitRate = 100;
	remainder = 0;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flEmitRate':
				this.emitRate = value.m_flLiteralValue ?? value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doEmit(elapsedTime) {
		const emission_start_time = this.getParameter('emission_start_time') ?? 0;
		let emission_rate = this.emitRate;
		const emission_duration = this.getParameter('emission_duration') ?? 0;

		const fade = this.getOperatorFade();
		emission_rate *= fade;

		let currentTime = this.system.currentTime;

		if (currentTime<emission_start_time) return;
		if (emission_duration!=0 && (currentTime>emission_start_time + emission_duration)) return;

		let nToEmit = this.remainder + elapsedTime * emission_rate;
		this.remainder = nToEmit % 1;
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
