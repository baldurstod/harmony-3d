import { RandomFloat } from '../../../../../math/functions';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

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

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_RateMin':
				this.rateMin = param;
				break;
			case 'm_RateMax':
				this.rateMax = param;
				break;
			case 'm_flStartTime_min':
				this.startTime_min = param;
				break;
			case 'm_flStartTime_max':
				this.startTime_max = param;
				break;
			case 'm_flEndTime_min':
				this.endTime_min = param;
				break;
			case 'm_flEndTime_max':
				this.endTime_max = param;
				break;
			case 'm_nField':
				this.field = (param);
				break;
			case 'm_bProportionalOp':
				this.proportionalOp = param;
				break;
			case 'm_flBias':
				this.bias = param;
				break;
			case 'm_bEaseOut':
				this.easeOut = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime) {
		//TODO : use m_flBias m_bEaseOut
		const context = particle.context.get(this);
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

		const particleTime = this.proportionalOp ? particle.proportionOfLife : particle.currentTime;
		if (particleTime < startTime || particleTime > endTime) {
			return;
		}

		const value = particle.getField(this.field) + rate * elapsedTime;
		particle.setField(this.field, value);

	}
}
RegisterSource2ParticleOperator('C_OP_RampScalarSpline', RampScalarSpline);
