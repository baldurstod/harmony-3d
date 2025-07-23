import { vec3, vec4 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Source2ParticleSystem } from '../../source2particlesystem';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const colorInterpolateTempVec4 = vec4.create();

export class ColorInterpolate extends Operator {
	#colorFade = vec4.fromValues(1, 1, 1, 1);
	#fadeStartTime = 0;
	#fadeEndTime = 1;
	#easeInAndOut = false;
	#invTime: number = 1;

	constructor(system: Source2ParticleSystem) {
		super(system);
		this._update();
	}

	_update() {
		this.#invTime = 1.0 / (this.#fadeEndTime - this.#fadeStartTime);
	}

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_ColorFade':
				if (param.getValueAsVec4(colorInterpolateTempVec4)) {
					vec4.scale(this.#colorFade, colorInterpolateTempVec4, 1 / 255);
				};
				break;
			case 'm_flFadeStartTime':
				this.#fadeStartTime = param.getValueAsNumber() ?? 0;
				this._update();
				break;
			case 'm_flFadeEndTime':
				this.#fadeEndTime = param.getValueAsNumber() ?? 1;
				this._update();
				break;
			case 'm_bEaseInAndOut':
				console.error('do this param', paramName, param);
				this.#easeInAndOut = param;
				break;
			case 'm_bEaseInOut':
				console.error('do this param', paramName, param);
				this.#easeInAndOut = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const color = vec3.clone(particle.initialColor);

		const proportionOfLife = Math.min(particle.currentTime / particle.timeToLive, 1.0);

		if (proportionOfLife < this.#fadeStartTime) {
			return;
		}

		if (proportionOfLife < this.#fadeEndTime) {
			const a = (proportionOfLife - this.#fadeStartTime) * this.#invTime;

			vec3.lerp(particle.color, particle.initialColor, this.#colorFade, a);
			return;
		}
		vec4.copy(particle.color, this.#colorFade);
	}
}
RegisterSource2ParticleOperator('C_OP_ColorInterpolate', ColorInterpolate);
