import { clamp, SimpleSpline } from '../../../../../math/functions';
import { Color, WHITE } from '../../color';
import { PARAM_TYPE_BOOL, PARAM_TYPE_COLOR, PARAM_TYPE_FLOAT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

export class ColorFade extends Source1ParticleOperator {
	static functionName = 'Color Fade';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('color_fade', PARAM_TYPE_COLOR, WHITE);
		this.addParam('fade_start_time', PARAM_TYPE_FLOAT, 0);
		this.addParam('fade_end_time', PARAM_TYPE_FLOAT, 1);
		this.addParam('ease_in_and_out', PARAM_TYPE_BOOL, 1);
		//	DMXELEMENT_UNPACK_FIELD('color_fade', '255 255 255 255', Color, m_ColorFade)
		//	DMXELEMENT_UNPACK_FIELD('fade_start_time', '0', float, m_flFadeStartTime)
		//	DMXELEMENT_UNPACK_FIELD('fade_end_time', '1', float, m_flFadeEndTime)
		//	DMXELEMENT_UNPACK_FIELD('ease_in_and_out', '1', bool, m_bEaseInOut)
	}

	doOperate(particle: Source1Particle, elapsedTime: number) {
		const color_fade = this.getParameter('color_fade');

		const fade_start_time = this.getParameter('fade_start_time');
		const fade_end_time = this.getParameter('fade_end_time');
		const m_bEaseInOut = this.getParameter('ease_in_and_out');

		if (fade_start_time == fade_end_time) {
			return;
		}

		const ooInRange = 1 / (fade_end_time - fade_start_time);

		const color = new Color().setColor(particle.initialColor);

		const flLifeTime = particle.currentTime / particle.timeToLive;
		//if (proportionOfLife>1)proportionOfLife=1;

		/*
		if (proportionOfLife<fade_start_time) {
			return;
		}
			*/

		let T = (flLifeTime - fade_start_time) * ooInRange;
		T = clamp(T, 0, 1);
		if (m_bEaseInOut) {
			T = SimpleSpline(T);
		}
		particle.color.r = (color_fade.r - color.r) * T + color.r;
		particle.color.g = (color_fade.g - color.g) * T + color.g;
		particle.color.b = (color_fade.b - color.b) * T + color.b;
		/*
					if (proportionOfLife < fade_end_time) {
						const a = (proportionOfLife - fade_start_time) / (fade_end_time - fade_start_time);
						particle.color.r = (color_fade.r - color.r) * a + color.r;
						particle.color.g = (color_fade.g - color.g) * a + color.g;
						particle.color.b = (color_fade.b - color.b) * a + color.b;

						return;
					}*/
	}
}
Source1ParticleOperators.registerOperator(ColorFade);
