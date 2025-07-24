import { vec3, vec4 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const randomColorTempVec4 = vec4.create();

const DEFAULT_UPDATE_THRESHOLD = 32;// TODO: check default value
const DEFAULT_TINT_CP = 0;// TODO: check default value
const DEFAULT_LIGHT_AMPLIFICATION = 1;// TODO: check default value
const DEFAULT_TINT_PERC = 0;// TODO: check default value

export class RandomColor extends Operator {
	#colorMin = vec4.fromValues(1, 1, 1, 1);// TODO: check default value
	#colorMax = vec4.fromValues(1, 1, 1, 1);// TODO: check default value
	#tintMin = vec3.fromValues(0, 0, 0);// TODO: check default value
	#tintMax = vec3.fromValues(1, 1, 1);// TODO: check default value
	#updateThreshold = DEFAULT_UPDATE_THRESHOLD;
	#tintCP = DEFAULT_TINT_CP;
	#tintBlendMode = null;
	#lightAmplification = DEFAULT_LIGHT_AMPLIFICATION;
	#tintPerc = DEFAULT_TINT_PERC;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_ColorMin':
				//console.error('do this param', paramName, param);
				//vec3.set(this.#colorMin, Number(param[0]) / 255, Number(param[1]) / 255, Number(param[2]) / 255);
				if (param.getValueAsVec4(randomColorTempVec4)) {
					vec4.scale(this.#colorMin, randomColorTempVec4, 1 / 255);
				};
				break;
			case 'm_ColorMax':
				if (param.getValueAsVec4(randomColorTempVec4)) {
					vec4.scale(this.#colorMax, randomColorTempVec4, 1 / 255);
				};
				break;
			case 'm_TintMin':
				console.error('do this param', paramName, param);
				vec3.set(this.#tintMin, Number(param[0]) / 255, Number(param[1]) / 255, Number(param[2]) / 255);
				break;
			case 'm_TintMax':
				if (param.getValueAsVec3(this.#tintMax)) {
					vec3.scale(this.#tintMax, this.#tintMax, 1 / 255);
				}
				break;
			case 'm_flUpdateThreshold':
				this.#updateThreshold = param.getValueAsNumber() ?? DEFAULT_UPDATE_THRESHOLD;
				break;
			case 'm_nTintCP':
				console.error('do this param', paramName, param);
				this.#tintCP = param;
				break;
			case 'm_nTintBlendMode':
				console.error('do this param', paramName, param);
				this.#tintBlendMode = param;
				break;
			case 'm_flLightAmplification':
				this.#lightAmplification = param.getValueAsNumber() ?? DEFAULT_LIGHT_AMPLIFICATION;
				break;
			case 'm_flTintPerc':
				console.error('do this param', paramName, param);
				this.#tintPerc = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: use tint
		const rand = Math.random();
		vec3.lerp(particle.color, this.#colorMin, this.#colorMax, rand);
		vec3.copy(particle.initialColor, particle.color);
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomColor', RandomColor);
