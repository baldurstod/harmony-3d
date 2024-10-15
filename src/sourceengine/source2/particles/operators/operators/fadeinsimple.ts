import { RegisterSource2ParticleOperator } from '../source2particleoperators.js';
import { Operator } from '../operator.js';
import { SimpleSplineRemapValWithDeltasClamped } from '../../../../common/math/sse.js';

export class FadeInSimple extends Operator {
	fadeInTime = 0.25;
	invFadeInTime = 0.25;
	constructor(system) {
		super(system);
		this._update();
	}

	_update() {
		this.invFadeInTime = 1.0 / this.fadeInTime;
	}

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flFadeInTime':
				this.fadeInTime = value;
				this._update();
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		let proportionOfLife = particle.currentTime / particle.timeToLive;
		particle.alpha = SimpleSplineRemapValWithDeltasClamped(proportionOfLife, 0, this.fadeInTime, this.invFadeInTime, 0, particle.startAlpha);
		//TODO: use fieldOutput
	}
}
RegisterSource2ParticleOperator('C_OP_FadeInSimple', FadeInSimple);
