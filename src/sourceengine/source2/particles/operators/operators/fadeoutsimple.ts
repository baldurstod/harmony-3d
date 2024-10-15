import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { SimpleSplineRemapValWithDeltasClamped } from '../../../../common/math/sse';

export class FadeOutSimple extends Operator {
	fadeOutTime = 0.25;
	startFadeOutTime;
	invFadeOutTime;
	constructor(system) {
		super(system);
		this._update();
	}

	_update() {
		this.startFadeOutTime = 1.0 - this.fadeOutTime;
		this.invFadeOutTime = 1.0 / this.fadeOutTime;
	}

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flFadeOutTime':
				this.fadeOutTime = value;
				this._update();
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		particle.alpha = SimpleSplineRemapValWithDeltasClamped(particle.proportionOfLife, this.startFadeOutTime, this.fadeOutTime, this.invFadeOutTime, particle.startAlpha, -particle.startAlpha);
		//TODO: use fieldOutput
	}
}
RegisterSource2ParticleOperator('C_OP_FadeOutSimple', FadeOutSimple);
