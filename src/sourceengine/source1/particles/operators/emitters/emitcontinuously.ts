import { PARAM_TYPE_FLOAT } from '../../constants';
import { SourceEngineParticleOperators } from '../../source1particleoperators';
import { SourceEngineParticleSystem } from '../../source1particlesystem';
import { SourceEngineParticleOperator } from '../operator';

export class EmitContinuously extends SourceEngineParticleOperator {
	static functionName = 'emit continuously';
	remainder = 0;

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		//this.setNameId('Emit Continuously');
		this.addParam('emission_start_time', PARAM_TYPE_FLOAT, 0);
		this.addParam('emission_rate', PARAM_TYPE_FLOAT, 100);
		this.addParam('emission_duration', PARAM_TYPE_FLOAT, 0);

	}

	doEmit(elapsedTime: number) {
		const emission_start_time = this.getParameter('emission_start_time') || 0;
		let emission_rate = this.getParameter('emission_rate') || 100;
		const emission_duration = this.getParameter('emission_duration') || 0;

		const fade = this.getOperatorFade();
		emission_rate *= fade;
		//console.log(emission_rate + ' ' + this.remainder);

		let currentTime = this.particleSystem.currentTime;

		if (currentTime < emission_start_time) return;
		if (emission_duration != 0 && (currentTime > emission_start_time + emission_duration)) return;

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

	finished() {
		const emission_start_time = this.getParameter('emission_start_time') ?? 0;
		const emission_duration = this.getParameter('emission_duration') ?? 0;
		const currentTime = this.particleSystem.currentTime;
		return emission_duration != 0 && (currentTime > emission_start_time + emission_duration);
	}
}
SourceEngineParticleOperators.registerOperator(EmitContinuously);
