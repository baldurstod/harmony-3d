import { clamp } from '../../../../../math/functions';
import { SimpleSplineRemapValWithDeltasClamped } from '../../../../common/math/sse';
import { ParticleRandomFloat } from '../../../../common/particles/randomfloats';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

export class AlphaFadeInRandom extends Source1ParticleOperator {
	static functionName = 'Alpha Fade In Random';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('fade in time min', PARAM_TYPE_FLOAT, 0.25);
		this.addParam('fade in time max', PARAM_TYPE_FLOAT, 0.25);
		this.addParam('fade in time exponent', PARAM_TYPE_FLOAT, 1);
		this.addParam('proportional 0/1', PARAM_TYPE_BOOL, 1);
	}

	doOperate(particle: Source1Particle, elapsedTime: number) {
		const proportional = this.getParameter('proportional 0/1');

		const fadeInTimeMin = this.getParameter('fade in time min') as number;
		const fadeInTimeMax = this.getParameter('fade in time max') as number;
		const m_flFadeInTimeExp = this.getParameter('fade in time exponent') as number;

		//const fade_in_time = (fade_in_time_max - fade_in_time_min) * Math.random() + fade_in_time_min;
		const fadeTimeWidth = fadeInTimeMax - fadeInTimeMin;
		const fadeInTime = fadeTimeWidth * Math.pow(ParticleRandomFloat(particle.id, particle.system.operatorRandomSampleOffset), m_flFadeInTimeExp) + fadeInTimeMin;

		let lifeTime;
		if (proportional == 1 && particle.timeToLive) {
			lifeTime = clamp(particle.currentTime / particle.timeToLive, 0, 1);
		} else {
			lifeTime = particle.currentTime;
		}

		let d, d2
		if (lifeTime < fadeInTime) {
			particle.alpha = SimpleSplineRemapValWithDeltasClamped(
				lifeTime, 0,
				fadeInTime, 1 / fadeInTime,
				0, particle.startAlpha);
		}
	}
}
Source1ParticleOperators.registerOperator(AlphaFadeInRandom);
