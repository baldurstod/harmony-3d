import { clamp } from '../../../../../math/functions';
import { SimpleSplineRemapValWithDeltasClamped } from '../../../../common/math/sse';
import { ParticleRandomFloat } from '../../../../common/particles/randomfloats';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

export class AlphaFadeOutRandom extends Source1ParticleOperator {
	static functionName = 'Alpha Fade Out Random';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('fade out time min', PARAM_TYPE_FLOAT, 0.25);
		this.addParam('fade out time max', PARAM_TYPE_FLOAT, 0.25);
		this.addParam('fade out time exponent', PARAM_TYPE_FLOAT, 1);
		this.addParam('proportional 0/1', PARAM_TYPE_BOOL, 1);
		this.addParam('ease in and out', PARAM_TYPE_BOOL, 1);
		this.addParam('fade bias', PARAM_TYPE_FLOAT, 0.5); //Neutral bias
	}

	doOperate(particle: Source1Particle, elapsedTime: number) {
		const proportional = this.getParameter('proportional 0/1');

		const fadeOutTimeMin = this.getParameter('fade out time min');
		const fadeOutTimeMax = this.getParameter('fade out time max');
		const easeInAndOut = this.getParameter('ease in and out');
		//const fadeBias = this.getParameter('fade bias');
		const m_flFadeOutTimeExp = this.getParameter('fade out time exponent');

		let fadeOutTime = (fadeOutTimeMax - fadeOutTimeMin) * Math.pow(ParticleRandomFloat(particle.id, particle.system.operatorRandomSampleOffset), m_flFadeOutTimeExp) + fadeOutTimeMin;

		let lifeTime;
		let lifeSpan;

		if (proportional == 1) {
			lifeTime = particle.currentTime / particle.timeToLive;
			fadeOutTime = 1 - fadeOutTime;
			lifeSpan = 1 - fadeOutTime;
		}
		else {
			lifeTime = particle.currentTime;
			fadeOutTime = particle.timeToLive - fadeOutTime;
			lifeSpan = particle.timeToLive - fadeOutTime;
		}

		if (lifeTime > fadeOutTime) {
			if (easeInAndOut) {
				const newAlpha = SimpleSplineRemapValWithDeltasClamped(
					lifeTime, fadeOutTime,
					lifeSpan, 1 / lifeSpan,
					particle.startAlpha, 0 - particle.startAlpha);

				particle.alpha = Math.max(0, newAlpha);
			} else {
				const fl4Frac = 1 - clamp((particle.currentTime - fadeOutTime) / lifeSpan, 0, 1);
				// TODO: add bias
				particle.alpha = particle.startAlpha * fl4Frac;
			}
		}
	}
}
Source1ParticleOperators.registerOperator(AlphaFadeOutRandom);
