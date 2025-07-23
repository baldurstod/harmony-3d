import { RandomFloat } from '../../../../../math/functions';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class RampScalarLinear extends Operator {
	#rateMin = 0;
	#rateMax = 0;
	#startTimeMin = 0;
	#startTimeMax = 0;
	#endTimeMin = 1;
	#endTimeMax = 1;
	#field = PARTICLE_FIELD_RADIUS;// TODO: not sure about the field
	#proportionalOp = true;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_RateMin':
				this.#rateMin = param.getValueAsNumber() ?? 0;
				break;
			case 'm_RateMax':
				this.#rateMax = param.getValueAsNumber() ?? 0;
				break;
			case 'm_flStartTime_min':
				console.error('do this param', paramName, param);
				this.#startTimeMin = param;
				break;
			case 'm_flStartTime_max':
				console.error('do this param', paramName, param);
				this.#startTimeMax = param;
				break;
			case 'm_flEndTime_min':
				this.#endTimeMin = param.getValueAsNumber() ?? 1;
				break;
			case 'm_flEndTime_max':
				this.#endTimeMax = param.getValueAsNumber() ?? 1;
				break;
			case 'm_nField':
				this.#field = param.getValueAsNumber() ?? PARTICLE_FIELD_RADIUS;
				break;
			case 'm_bProportionalOp':
				this.#proportionalOp = param.getValueAsBool() ?? true;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle | null | Source2Particle[], elapsedTime: number, strength: number): void {
		const context = particle.context.get(this);
		let rate, startTime, endTime;
		if (context == undefined) {
			//Init per particle parameters
			rate = RandomFloat(this.#rateMin, this.#rateMax);
			startTime = RandomFloat(this.#startTimeMin, this.#startTimeMax);
			endTime = RandomFloat(this.#endTimeMin, this.#endTimeMax);
			particle.context.set(this, { r: rate, s: startTime, e: endTime });
		} else {
			rate = context.r;
			startTime = context.s;
			endTime = context.e;
		}

		const particleTime = this.#proportionalOp ? particle.proportionOfLife : particle.currentTime;
		if (particleTime < startTime || particleTime > endTime) {
			return;
		}

		const value = particle.getField(this.#field) + rate * elapsedTime;
		particle.setField(this.#field, value);

	}
}
RegisterSource2ParticleOperator('C_OP_RampScalarLinear', RampScalarLinear);
