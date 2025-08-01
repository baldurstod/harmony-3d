import { RandomFloatExp } from '../../../../../math/functions';
import { SimpleSplineRemapValWithDeltasClamped } from '../../../../common/math/sse';
import { Source2Particle } from '../../source2particle';
import { Source2ParticleSystem } from '../../source2particlesystem';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_FADE_IN_TIME_MIN = 0.25;
const DEFAULT_FADE_IN_TIME_MAX = 0.25;
const DEFAULT_FADE_IN_TIME_EXP = 1;
const DEFAULT_PROPORTIONAL = true;

export class FadeIn extends Operator {
	#fadeInTimeMin = DEFAULT_FADE_IN_TIME_MIN;
	#fadeInTimeMax = DEFAULT_FADE_IN_TIME_MAX;
	#fadeInTimeExp = DEFAULT_FADE_IN_TIME_EXP;
	#proportional = DEFAULT_PROPORTIONAL;
	//computed
	#fadeInTime = 0;
	#invFadeInTime = 0;

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.#update();
	}

	#update() {
		//TODO: this is wrong: must be done per particle
		this.#fadeInTime = RandomFloatExp(this.#fadeInTimeMin, this.#fadeInTimeMax, this.#fadeInTimeExp);
		this.#invFadeInTime = 1.0 / this.#fadeInTime;
	}

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flFadeInTimeMin':
				this.#fadeInTimeMin = param.getValueAsNumber() ?? DEFAULT_FADE_IN_TIME_MIN;
				this.#update();
				break;
			case 'm_flFadeInTimeMax':
				this.#fadeInTimeMax = param.getValueAsNumber() ?? DEFAULT_FADE_IN_TIME_MAX;
				this.#update();
				break;
			case 'm_flFadeInTimeExp':
				this.#fadeInTimeExp = param.getValueAsNumber() ?? DEFAULT_FADE_IN_TIME_EXP;
				this.#update();
				break;
			case 'm_bProportional':
				this.#proportional = param.getValueAsBool() ?? DEFAULT_PROPORTIONAL;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		particle.alpha = SimpleSplineRemapValWithDeltasClamped(this.#proportional ? particle.currentTime / particle.timeToLive : particle.currentTime, 0, this.#fadeInTime, this.#invFadeInTime, 0, particle.startAlpha);
	}
}
RegisterSource2ParticleOperator('C_OP_FadeIn', FadeIn);
