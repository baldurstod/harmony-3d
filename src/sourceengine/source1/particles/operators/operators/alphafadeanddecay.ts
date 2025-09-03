import { SimpleSplineRemapValWithDeltasClamped } from '../../../../common/math/sse';
import { PARAM_TYPE_FLOAT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

export class AlphaFadeAndDecay extends Source1ParticleOperator {
	static functionName = 'Alpha Fade and Decay';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('start_alpha', PARAM_TYPE_FLOAT, 1.0);
		this.addParam('end_alpha', PARAM_TYPE_FLOAT, 0.0);
		this.addParam('start_fade_in_time', PARAM_TYPE_FLOAT, 0);
		this.addParam('end_fade_in_time', PARAM_TYPE_FLOAT, 0.5);
		this.addParam('start_fade_out_time', PARAM_TYPE_FLOAT, 0.5);
		this.addParam('end_fade_out_time', PARAM_TYPE_FLOAT, 1.0);
	}

	doOperate(particle: Source1Particle, elapsedTime: number) {
		const start_alpha = this.getParameter('start_alpha');
		const end_alpha = this.getParameter('end_alpha');

		const m_flStartFadeInTime = this.getParameter('start_fade_in_time');
		const m_flEndFadeInTime = this.getParameter('end_fade_in_time');
		const m_flStartFadeOutTime = this.getParameter('start_fade_out_time');
		const m_flEndFadeOutTime = this.getParameter('end_fade_out_time');

		const alpha = 1.0;// = particle.startAlpha;


		const proportionOfLife = particle.currentTime / particle.timeToLive;
		const fl4FadeInDuration = m_flEndFadeInTime - m_flStartFadeInTime;
		const fl4OOFadeInDuration = 1.0 / fl4FadeInDuration;

		const fl4FadeOutDuration = m_flEndFadeOutTime - m_flStartFadeOutTime;
		const fl4OOFadeOutDuration = 1.0 / fl4FadeOutDuration;

		let fl4Goal, fl4NewAlpha;
		switch (true) {
			case proportionOfLife <= m_flStartFadeInTime:
				//				alpha = start_alpha;
				break;
			case proportionOfLife < m_flEndFadeInTime:
				fl4Goal = particle.startAlpha * start_alpha;
				fl4NewAlpha = SimpleSplineRemapValWithDeltasClamped(proportionOfLife, m_flStartFadeInTime, fl4FadeInDuration, fl4OOFadeInDuration, fl4Goal, particle.startAlpha - fl4Goal);
				particle.alpha = fl4NewAlpha;
				break;
			case proportionOfLife < m_flStartFadeOutTime:
				break;
			case proportionOfLife < m_flEndFadeOutTime:
				fl4Goal = particle.startAlpha * end_alpha;
				fl4NewAlpha = SimpleSplineRemapValWithDeltasClamped(proportionOfLife, m_flStartFadeOutTime, fl4FadeOutDuration, fl4OOFadeOutDuration, particle.startAlpha, fl4Goal - particle.startAlpha);
				particle.alpha = fl4NewAlpha;
				break;
			default:
				//alpha=end_alpha;
				break;
		}
		//alpha *= particle.startAlpha;
		//particle.alpha = alpha;

		if (particle.timeToLive < particle.currentTime) {
			particle.die();
		}
	}
}
Source1ParticleOperators.registerOperator(AlphaFadeAndDecay);
