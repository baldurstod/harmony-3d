import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { RandomFloat } from '../../../../../math/functions';

export class RampScalarSpline extends Operator {
	rateMin = 0;
	rateMax = 0;
	startTime_min = 0;
	startTime_max = 0;
	endTime_min = 1;
	endTime_max = 1;
	field = PARTICLE_FIELD_RADIUS;
	proportionalOp = true;
	bias = 0.5;
	easeOut = false;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_RateMin':
				this.rateMin = value;
				break;
			case 'm_RateMax':
				this.rateMax = value;
				break;
			case 'm_flStartTime_min':
				this.startTime_min = value;
				break;
			case 'm_flStartTime_max':
				this.startTime_max = value;
				break;
			case 'm_flEndTime_min':
				this.endTime_min = value;
				break;
			case 'm_flEndTime_max':
				this.endTime_max = value;
				break;
			case 'm_nField':
				this.field = Number(value);
				break;
			case 'm_bProportionalOp':
				this.proportionalOp = value;
				break;
			case 'm_flBias':
				this.bias = value;
				break;
			case 'm_bEaseOut':
				this.easeOut = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		//TODO : use m_flBias m_bEaseOut
		let context = particle.context.get(this);
		let rate, startTime, endTime;
		if (context == undefined) {
			//Init per particle parameters
			rate = RandomFloat(this.rateMin, this.rateMax);
			startTime = RandomFloat(this.startTime_min, this.startTime_max);
			endTime = RandomFloat(this.endTime_min, this.endTime_max);
			particle.context.set(this, {r:rate, s:startTime, e:endTime});
		} else {
			rate = context.r;
			startTime = context.s;
			endTime = context.e;
		}

		let particleTime = this.proportionalOp ? particle.proportionOfLife : particle.currentTime;
		if (particleTime < startTime || particleTime > endTime) {
			return;
		}

		let value = particle.getField(this.field) + rate * elapsedTime;
		particle.setField(this.field, value);

	}
}
RegisterSource2ParticleOperator('C_OP_RampScalarSpline', RampScalarSpline);