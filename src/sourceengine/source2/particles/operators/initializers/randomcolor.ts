import { vec3, vec4 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const randomColorTempVec4 = vec4.create();

export enum Source2ParticleTintBlendMode {//TODO: move enum elsewhere
	Replace = 'PARTICLEBLEND_REPLACE',
	Overlay = 'PARTICLEBLEND_OVERLAY',
	Darken = 'PARTICLEBLEND_DARKEN',
	Lighten = 'PARTICLEBLEND_LIGHTEN',
	Multiply = 'PARTICLEBLEND_MULTIPLY',
}

export function stringToTintBlendMode(blend: string | null): Source2ParticleTintBlendMode | undefined {
	switch (blend) {
		case Source2ParticleTintBlendMode.Replace:
			return Source2ParticleTintBlendMode.Replace;
		case Source2ParticleTintBlendMode.Overlay:
			return Source2ParticleTintBlendMode.Overlay;
		case Source2ParticleTintBlendMode.Darken:
			return Source2ParticleTintBlendMode.Darken;
		case Source2ParticleTintBlendMode.Lighten:
			return Source2ParticleTintBlendMode.Lighten;
		case Source2ParticleTintBlendMode.Multiply:
			return Source2ParticleTintBlendMode.Multiply;
	}
}

const DEFAULT_UPDATE_THRESHOLD = 32;// TODO: check default value
const DEFAULT_TINT_CP = 0;// TODO: check default value
const DEFAULT_LIGHT_AMPLIFICATION = 1;// TODO: check default value
const DEFAULT_TINT_PERC = 0;// TODO: check default value
const DEFAULT_TINT_BLEND_MODE = Source2ParticleTintBlendMode.Replace;// TODO: check default value

export class RandomColor extends Operator {
	#colorMin = vec4.fromValues(1, 1, 1, 1);// TODO: check default value
	#colorMax = vec4.fromValues(1, 1, 1, 1);// TODO: check default value
	#tintMin = vec3.fromValues(0, 0, 0);// TODO: check default value
	#tintMax = vec3.fromValues(1, 1, 1);// TODO: check default value
	#updateThreshold = DEFAULT_UPDATE_THRESHOLD;
	#tintCP = DEFAULT_TINT_CP;
	#tintBlendMode = DEFAULT_TINT_BLEND_MODE;
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
				if (param.getValueAsVec3(this.#tintMin)) {
					vec3.scale(this.#tintMin, this.#tintMin, 1 / 255);
				}
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
				this.#tintCP = param.getValueAsNumber() ?? DEFAULT_TINT_CP;
				break;
			case 'm_nTintBlendMode':
				this.#tintBlendMode = stringToTintBlendMode(param.getValueAsString()) ?? DEFAULT_TINT_BLEND_MODE;
				break;
			case 'm_flLightAmplification':
				this.#lightAmplification = param.getValueAsNumber() ?? DEFAULT_LIGHT_AMPLIFICATION;
				break;
			case 'm_flTintPerc':
				this.#tintPerc = param.getValueAsNumber() ?? DEFAULT_TINT_PERC;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: use tint
		const rand = Math.random();
		vec4.lerp(particle.color, this.#colorMin, this.#colorMax, rand);
		vec4.copy(particle.initialColor, particle.color);
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomColor', RandomColor);
