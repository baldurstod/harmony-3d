import { vec3, vec4 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const randomColorTempVec4 = vec4.create();

export class RandomColor extends Operator {
	#colorMin = vec4.fromValues(1, 1, 1, 1);
	#colorMax = vec4.fromValues(1, 1, 1, 1);
	tintMin = vec3.fromValues(0, 0, 0);
	tintMax = vec3.fromValues(1, 1, 1);
	updateThreshold = 32;
	tintCP = 0;
	tintBlendMode = null;
	lightAmplification = 1;
	tintPerc = 0;

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
				vec3.set(this.tintMin, Number(param[0]) / 255, Number(param[1]) / 255, Number(param[2]) / 255);
				break;
			case 'm_TintMax':
				console.error('do this param', paramName, param);
				vec3.set(this.tintMax, Number(param[0]) / 255, Number(param[1]) / 255, Number(param[2]) / 255);
				break;
			case 'm_flUpdateThreshold':
				console.error('do this param', paramName, param);
				this.updateThreshold = param;
				break;
			case 'm_nTintCP':
				console.error('do this param', paramName, param);
				this.tintCP = param;
				break;
			case 'm_nTintBlendMode':
				console.error('do this param', paramName, param);
				this.tintBlendMode = param;
				break;
			case 'm_flLightAmplification':
				console.error('do this param', paramName, param);
				this.lightAmplification = param;
				break;
			case 'm_flTintPerc':
				console.error('do this param', paramName, param);
				this.tintPerc = param;
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
