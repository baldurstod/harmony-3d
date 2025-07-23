import { RandomFloatExp } from '../../../../../math/functions';
import { SimpleSplineRemapValWithDeltasClamped } from '../../../../common/math/sse';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class FadeIn extends Operator {
	fadeInTimeMin = 0.25;
	fadeInTimeMax = 0.25;
	fadeInTimeExp = 1;
	proportional = true;
	fadeInTime;
	invFadeInTime;
	constructor(system) {
		super(system);
		this._update();
	}

	_update() {
		//TODO: this is wrong: must be done per particle
		this.fadeInTime = RandomFloatExp(this.fadeInTimeMin, this.fadeInTimeMax, this.fadeInTimeExp);
		this.invFadeInTime = 1.0 / this.fadeInTime;
	}

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flFadeInTimeMin':
				this.fadeInTimeMin = param;
				this._update();
				break;
			case 'm_flFadeInTimeMax':
				this.fadeInTimeMax = param;
				this._update();
				break;
			case 'm_flFadeInTimeExp':
				this.fadeInTimeExp = param;
				this._update();
				break;
			case 'm_bProportional':
				this.proportional = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime) {
		particle.alpha = SimpleSplineRemapValWithDeltasClamped(this.proportional ? particle.currentTime / particle.timeToLive : particle.currentTime, 0, this.fadeInTime, this.invFadeInTime, 0, particle.startAlpha);
	}
}
RegisterSource2ParticleOperator('C_OP_FadeIn', FadeIn);
