import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { RandomFloatExp } from '../../../../../math/functions';
import { SimpleSplineRemapValWithDeltasClamped } from '../../../../common/math/sse';
import { Source2ParticleSystem } from '../../export';
import { Source2Particle } from '../../source2particle';

export class FadeOut extends Operator {
	#fadeOutTimeMin = 0.25;
	#fadeOutTimeMax = 0.25;
	#fadeOutTimeExp = 1;
	#proportional = true;
	#fadeOutTime = 0;
	#startFadeOutTime = 0;
	#invFadeOutTime = 0;

	constructor(system: Source2ParticleSystem) {
		super(system);
		this._update();
	}

	_update() {
		//TODO: this is wrong: must be done per particle
		this.#fadeOutTime = RandomFloatExp(this.#fadeOutTimeMin, this.#fadeOutTimeMax, this.#fadeOutTimeExp);
		this.#startFadeOutTime = 1.0 - this.#fadeOutTime;
		this.#invFadeOutTime = 1.0 / this.#fadeOutTime;
	}

	_paramChanged(paramName: string, value: any) {
		switch (paramName) {
			case 'm_flFadeOutTimeMin':
				this.#fadeOutTimeMin = value;
				this._update();
				break;
			case 'm_flFadeOutTimeMax':
				this.#fadeOutTimeMax = value;
				this._update();
				break;
			case 'm_flFadeOutTimeExp':
				this.#fadeOutTimeExp = value;
				this._update();
				break;
			case 'm_bProportional':
				this.#proportional = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number) {
		//particle.alpha = SimpleSplineRemapValWithDeltasClamped(this.proportional ? particle.currentTime / particle.timeToLive : particle.currentTime, 0, this.fadeInTime, this.invFadeInTime, 0, particle.startAlpha);
		particle.alpha = SimpleSplineRemapValWithDeltasClamped(this.#proportional ? particle.currentTime / particle.timeToLive : particle.currentTime, this.#startFadeOutTime, this.#fadeOutTime, this.#invFadeOutTime, particle.startAlpha, -particle.startAlpha);
		//TODO: if not proportional, set start time per particle
	}
}
RegisterSource2ParticleOperator('C_OP_FadeOut', FadeOut);
