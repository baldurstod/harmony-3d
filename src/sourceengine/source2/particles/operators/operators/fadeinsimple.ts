import { SimpleSplineRemapValWithDeltasClamped } from '../../../../common/math/sse';
import { Source2Particle } from '../../source2particle';
import { Source2ParticleSystem } from '../../source2particlesystem';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_FADE_IN_TIME = 0.25;// TODO: check default value

export class FadeInSimple extends Operator {
	#fadeInTime = DEFAULT_FADE_IN_TIME;
	#invFadeInTime!: number;

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.#update();
	}

	#update() {
		this.#invFadeInTime = 1.0 / this.#fadeInTime;
	}

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flFadeInTime':
				this.#fadeInTime = param.getValueAsNumber() ?? DEFAULT_FADE_IN_TIME;
				this.#update();
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const proportionOfLife = particle.currentTime / particle.timeToLive;
		particle.alpha = SimpleSplineRemapValWithDeltasClamped(proportionOfLife, 0, this.#fadeInTime, this.#invFadeInTime, 0, particle.startAlpha);
		//TODO: use fieldOutput
	}
}
RegisterSource2ParticleOperator('C_OP_FadeInSimple', FadeInSimple);
