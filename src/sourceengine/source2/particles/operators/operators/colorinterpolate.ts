import { vec3, vec4 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Source2ParticleSystem } from '../../source2particlesystem';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const colorInterpolateTempVec4 = vec4.create();


const DEFAULT_FADE_START_TIME = 0;// TODO: check default value
const DEFAULT_FADE_END_TIME = 1;// TODO: check default value
const DEFAULT_EASE_IN_AND_OUT = false;// TODO: check default value

export class ColorInterpolate extends Operator {
	#colorFade = vec4.fromValues(1, 1, 1, 1);// TODO: check default value
	#fadeStartTime = DEFAULT_FADE_START_TIME;
	#fadeEndTime = DEFAULT_FADE_END_TIME;
	#easeInAndOut = DEFAULT_EASE_IN_AND_OUT;
	#invTime = 1;//computed

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.#update();
	}

	#update(): void {
		this.#invTime = 1.0 / (this.#fadeEndTime - this.#fadeStartTime);
	}

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_ColorFade':
				if (param.getValueAsVec4(colorInterpolateTempVec4)) {
					vec4.scale(this.#colorFade, colorInterpolateTempVec4, 1 / 255);
				};
				break;
			case 'm_flFadeStartTime':
				this.#fadeStartTime = param.getValueAsNumber() ?? DEFAULT_FADE_START_TIME;
				this.#update();
				break;
			case 'm_flFadeEndTime':
				this.#fadeEndTime = param.getValueAsNumber() ?? DEFAULT_FADE_END_TIME;
				this.#update();
				break;
			case 'm_bEaseInAndOut'://TODO: check thoses params m_bEaseInAndOut and m_bEaseInOut
				//case 'm_bEaseInOut':
				this.#easeInAndOut = param.getValueAsBool() ?? DEFAULT_EASE_IN_AND_OUT;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(particle: Source2Particle): void {
		//const color = vec3.clone(particle.initialColor as vec3);//TODO: optimize

		const proportionOfLife = Math.min(particle.currentTime / particle.timeToLive, 1.0);

		if (proportionOfLife < this.#fadeStartTime) {
			return;
		}

		if (proportionOfLife < this.#fadeEndTime) {
			const a = (proportionOfLife - this.#fadeStartTime) * this.#invTime;

			vec3.lerp(particle.color as vec3, particle.initialColor as vec3, this.#colorFade as vec3, a);
			return;
		}
		vec4.copy(particle.color, this.#colorFade);
	}
}
RegisterSource2ParticleOperator('C_OP_ColorInterpolate', ColorInterpolate);
