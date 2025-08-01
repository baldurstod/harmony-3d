import { RandomFloatExp } from '../../../../../math/functions';
import { SimpleSplineRemapValWithDeltasClamped } from '../../../../common/math/sse';
import { Source2Particle } from '../../source2particle';
import { Source2ParticleSystem } from '../../source2particlesystem';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_FADE_OUT_TIME_MIN = 0.25;
const DEFAULT_FADE_OUT_TIME_MAX = 0.25;
const DEFAULT_FADE_OUT_TIME_EXP = 1;
const DEFAULT_FADE_BIAS = 0.5;
const DEFAULT_PROPORTIONAL = true;
const DEFAULT_EASE_IN_AND_OUT = true;

export class FadeOut extends Operator {
	#fadeOutTimeMin = DEFAULT_FADE_OUT_TIME_MIN;
	#fadeOutTimeMax = DEFAULT_FADE_OUT_TIME_MAX;
	#fadeOutTimeExp = DEFAULT_FADE_OUT_TIME_EXP;
	#fadeBias = DEFAULT_FADE_BIAS;
	#proportional = DEFAULT_PROPORTIONAL;
	#easeInAndOut = DEFAULT_EASE_IN_AND_OUT;
	//computed
	#fadeOutTime = 0;
	#startFadeOutTime = 0;
	#invFadeOutTime = 0;

	constructor(system: Source2ParticleSystem) {//Alpha fade out random
		super(system);
		this.#update();
	}

	#update() {
		//TODO: this is wrong: must be done per particle
		this.#fadeOutTime = RandomFloatExp(this.#fadeOutTimeMin, this.#fadeOutTimeMax, this.#fadeOutTimeExp);
		this.#startFadeOutTime = 1.0 - this.#fadeOutTime;
		this.#invFadeOutTime = 1.0 / this.#fadeOutTime;
	}

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flFadeOutTimeMin':
				this.#fadeOutTimeMin = param.getValueAsNumber() ?? DEFAULT_FADE_OUT_TIME_MIN;
				this.#update();
				break;
			case 'm_flFadeOutTimeMax':
				this.#fadeOutTimeMax = param.getValueAsNumber() ?? DEFAULT_FADE_OUT_TIME_MAX;
				this.#update();
				break;
			case 'm_flFadeOutTimeExp':
				this.#fadeOutTimeExp  = param.getValueAsNumber() ?? DEFAULT_FADE_OUT_TIME_EXP;
				this.#update();
				break;
			case 'm_flFadeBias':
				this.#fadeBias  = param.getValueAsNumber() ?? DEFAULT_FADE_BIAS;
				this.#update();
				break;
			case 'm_bProportional':
				this.#proportional = param.getValueAsBool() ?? DEFAULT_PROPORTIONAL;
				break;
			case 'm_bEaseInAndOut':
				this.#easeInAndOut = param.getValueAsBool() ?? DEFAULT_EASE_IN_AND_OUT;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: use fadeBias, easeInAndOut
		//particle.alpha = SimpleSplineRemapValWithDeltasClamped(this.proportional ? particle.currentTime / particle.timeToLive : particle.currentTime, 0, this.fadeInTime, this.invFadeInTime, 0, particle.startAlpha);
		particle.alpha = SimpleSplineRemapValWithDeltasClamped(this.#proportional ? particle.currentTime / particle.timeToLive : particle.currentTime, this.#startFadeOutTime, this.#fadeOutTime, this.#invFadeOutTime, particle.startAlpha, -particle.startAlpha);
		//TODO: if not proportional, set start time per particle
	}
}
RegisterSource2ParticleOperator('C_OP_FadeOut', FadeOut);
