import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class ColorInterpolate extends Operator {
	colorFade = vec3.fromValues(1, 1, 1);
	fadeStartTime = 0;
	fadeEndTime = 1;
	easeInAndOut = false;
	fieldOutput = null;
	invTime: number;
	constructor(system) {
		super(system);
		this._update();
	}

	_update() {
		this.invTime = 1.0 / (this.fadeEndTime - this.fadeStartTime);
	}

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_ColorFade':
				vec3.set(this.colorFade, Number(value[0]) / 255, Number(value[1]) / 255, Number(value[2]) / 255);
				break;
			case 'm_flFadeStartTime':
				this.fadeStartTime = value;
				this._update();
				break;
			case 'm_flFadeEndTime':
				this.fadeEndTime = value;
				this._update();
				break;
			case 'm_bEaseInAndOut':
				this.easeInAndOut = value;
				break;
			case 'm_bEaseInOut':
				this.easeInAndOut = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		const color = vec3.clone(particle.initialColor);

		const proportionOfLife = Math.min(particle.currentTime / particle.timeToLive, 1.0);

		if (proportionOfLife < this.fadeStartTime) {
			return;
		}

		if (proportionOfLife < this.fadeEndTime) {
			const a = (proportionOfLife - this.fadeStartTime) * this.invTime;

			vec3.lerp(particle.color, particle.initialColor, this.colorFade, a);
			return;
		}
		vec3.copy(particle.color, this.colorFade);
	}
}
RegisterSource2ParticleOperator('C_OP_ColorInterpolate', ColorInterpolate);
