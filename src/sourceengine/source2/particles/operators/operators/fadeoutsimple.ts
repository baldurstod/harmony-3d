import { SimpleSplineRemapValWithDeltasClamped } from '../../../../common/math/sse';
import { Source2Particle } from '../../source2particle';
import { Source2ParticleSystem } from '../../source2particlesystem';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export const DEFAULT_FADE_OUT_TIME = 0.25;

export class FadeOutSimple extends Operator {
	fadeOutTime = DEFAULT_FADE_OUT_TIME;
	startFadeOutTime!: number;
	invFadeOutTime!: number;

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.#update();
	}

	#update() {
		this.startFadeOutTime = 1.0 - this.fadeOutTime;
		this.invFadeOutTime = 1.0 / this.fadeOutTime;
	}

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flFadeOutTime':
				this.fadeOutTime = param.getValueAsNumber() ?? DEFAULT_FADE_OUT_TIME;
				this.#update();
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		particle.alpha = SimpleSplineRemapValWithDeltasClamped(particle.proportionOfLife, this.startFadeOutTime, this.fadeOutTime, this.invFadeOutTime, particle.startAlpha, -particle.startAlpha);
		//TODO: use fieldOutput
	}
}
RegisterSource2ParticleOperator('C_OP_FadeOutSimple', FadeOutSimple);
