import { Bias } from '../../../../common/math/sse';
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
		this.addParam('fade bias', PARAM_TYPE_FLOAT, 0.5); //Neutral bias
	}

	doOperate(particle: Source1Particle, elapsedTime: number) {
		const proportional = this.getParameter('proportional 0/1');

		const fade_out_time_min = this.getParameter('fade out time min');
		const fade_out_time_max = this.getParameter('fade out time max');
		const fadeBias = this.getParameter('fade bias');
		const m_flFadeOutTimeExp = this.getParameter('fade in time exponent');

		const fade_out_time = (fade_out_time_max - fade_out_time_min) * Math.pow(ParticleRandomFloat(particle.id, particle.system.operatorRandomSampleOffset), m_flFadeOutTimeExp) + fade_out_time_min;

		let time;
		let start_fade_out_time;

		let lifeSpan;
		if (proportional == 1) {
			time = particle.currentTime / particle.timeToLive;
			start_fade_out_time = 1 - fade_out_time;
			lifeSpan = 1 - time;
		}
		else {
			time = particle.currentTime;
			start_fade_out_time = particle.timeToLive - fade_out_time;
			lifeSpan = particle.timeToLive - time;
		}

		let alpha = 0;
		switch (true) {
			case time > start_fade_out_time:
				const d = fade_out_time;
				if (d != 0) {
					const d2 = particle.startAlpha;
					alpha = d2 * (lifeSpan);
				}
				Bias(alpha, fadeBias);//TODOv3
				break;
			default:
				alpha = particle.startAlpha;
				break;
		}
		particle.alpha = alpha;
	}
}
Source1ParticleOperators.registerOperator(AlphaFadeOutRandom);
