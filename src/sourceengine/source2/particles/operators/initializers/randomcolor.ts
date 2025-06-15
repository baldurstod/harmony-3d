import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class RandomColor extends Operator {
	colorMin = vec3.fromValues(1, 1, 1);
	colorMax = vec3.fromValues(1, 1, 1);
	tintMin = vec3.fromValues(0, 0, 0);
	tintMax = vec3.fromValues(1, 1, 1);
	updateThreshold = 32;
	tintCP = 0;
	tintBlendMode = null;
	lightAmplification = 1;
	tintPerc = 0;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_ColorMin':
				vec3.set(this.colorMin, Number(value[0]) / 255, Number(value[1]) / 255, Number(value[2]) / 255);
				break;
			case 'm_ColorMax':
				vec3.set(this.colorMax, Number(value[0]) / 255, Number(value[1]) / 255, Number(value[2]) / 255);
				break;
			case 'm_TintMin':
				vec3.set(this.tintMin, Number(value[0]) / 255, Number(value[1]) / 255, Number(value[2]) / 255);
				break;
			case 'm_TintMax':
				vec3.set(this.tintMax, Number(value[0]) / 255, Number(value[1]) / 255, Number(value[2]) / 255);
				break;
			case 'm_flUpdateThreshold':
				this.updateThreshold = value;
				break;
			case 'm_nTintCP':
				this.tintCP = value;
				break;
			case 'm_nTintBlendMode':
				this.tintBlendMode = value;
				break;
			case 'm_flLightAmplification':
				this.lightAmplification = value;
				break;
			case 'm_flTintPerc':
				this.tintPerc = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		//TODO: use tint
		const rand = Math.random();
		vec3.lerp(particle.color, this.colorMin, this.colorMax, rand);
		vec3.copy(particle.initialColor, particle.color);
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomColor', RandomColor);
