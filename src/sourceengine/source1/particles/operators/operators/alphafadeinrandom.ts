import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT } from '../../constants';
import { ParticleRandomFloat } from '../../../../common/particles/randomfloats';

export class AlphaFadeInRandom extends SourceEngineParticleOperator {
	static functionName = 'Alpha Fade In Random';
	constructor() {
		super();
		this.addParam('fade in time min', PARAM_TYPE_FLOAT, 0.25);
		this.addParam('fade in time max', PARAM_TYPE_FLOAT, 0.25);
		this.addParam('fade in time exponent', PARAM_TYPE_FLOAT, 1);
		this.addParam('proportional 0/1', PARAM_TYPE_BOOL, 1);
	}

	doOperate(particle, elapsedTime) {
		const proportional = this.getParameter('proportional 0/1');

		const fade_in_time_min	= this.getParameter('fade in time min');
		const fade_in_time_max = this.getParameter('fade in time max');
		const m_flFadeInTimeExp = this.getParameter('fade in time exponent');


		//const fade_in_time = (fade_in_time_max - fade_in_time_min) * Math.random() + fade_in_time_min;
		const fade_in_time = (fade_in_time_max - fade_in_time_min) * Math.pow(ParticleRandomFloat(particle.id, particle.system.operatorRandomSampleOffset), m_flFadeInTimeExp) + fade_in_time_min;

		let time;
		if (proportional == 1 && particle.timeToLive) {
			time = particle.currentTime / particle.timeToLive;
		} else {
			time = particle.currentTime;
		}

		let d, d2
		if (time < fade_in_time) {
			d = fade_in_time;
			if (d!=0) {
				d2 = particle.startAlpha;
				particle.alpha = d2 / d * (time);
			}
		}
	}
}
SourceEngineParticleOperators.registerOperator(AlphaFadeInRandom);
