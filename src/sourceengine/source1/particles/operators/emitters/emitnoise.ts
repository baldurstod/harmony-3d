import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT } from '../../constants';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

export class EmitNoise extends SourceEngineParticleOperator {
	static functionName = 'emit noise';
	#remainder = 0;

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('emission_start_time', PARAM_TYPE_FLOAT, 0);
		this.addParam('emission_duration', PARAM_TYPE_FLOAT, 0);
		this.addParam('scale emission to used control points', PARAM_TYPE_FLOAT, 0);
		this.addParam('time noise coordinate scale', PARAM_TYPE_FLOAT, 0.1);
		this.addParam('time coordinate offset', PARAM_TYPE_FLOAT, 0);
		this.addParam('absolute value', PARAM_TYPE_BOOL, 0);
		this.addParam('invert absolute value', PARAM_TYPE_BOOL, 0);
		this.addParam('emission minimum', PARAM_TYPE_FLOAT, 0);
		this.addParam('emission maximum', PARAM_TYPE_FLOAT, 100);
		this.addParam('world time noise coordinate scale', PARAM_TYPE_FLOAT, 0);

	}

	doEmit(elapsedTime) {
		const emission_start_time = this.getParameter('emission_start_time');
		const emissionMinimum = this.getParameter('emission minimum');
		const emissionMaximum = this.getParameter('emission maximum');
		const emission_duration = this.getParameter('emission_duration');

		let emission_rate = (emissionMinimum + emissionMaximum) / 2;

		const fade = this.getOperatorFade();
		emission_rate *= fade;
		//console.log(emission_rate + ' ' + this.remainder);

		let currentTime = this.particleSystem.currentTime;

		if (currentTime < emission_start_time) return;
		if (emission_duration != 0 && (currentTime > emission_start_time + emission_duration)) return;

		let nToEmit = this.#remainder + elapsedTime * emission_rate;
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
SourceEngineParticleOperators.registerOperator(EmitNoise);
