import { RandomFloat } from '../../../../../math/functions';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_RATE_MIN = 0;// TODO: check default value
const DEFAULT_RATE_MAX = 0;// TODO: check default value
const DEFAULT_START_TIME_MIN = 0;// TODO: check default value
const DEFAULT_START_TIME_MAX = 0;// TODO: check default value
const DEFAULT_END_TIME_MIN = 0;// TODO: check default value
const DEFAULT_END_TIME_MAX = 0;// TODO: check default value
const DEFAULT_FIELD = PARTICLE_FIELD_RADIUS;// TODO: check default value
const DEFAULT_PROPORTIONAL_OP = true;// TODO: check default value

export class RampScalarLinear extends Operator {
	#rateMin = DEFAULT_RATE_MIN;
	#rateMax = DEFAULT_RATE_MAX;
	#startTimeMin = DEFAULT_START_TIME_MIN;
	#startTimeMax = DEFAULT_START_TIME_MAX;
	#endTimeMin = DEFAULT_END_TIME_MIN;
	#endTimeMax = DEFAULT_END_TIME_MAX;
	#field = DEFAULT_FIELD;// TODO: not sure about the field
	#proportionalOp = DEFAULT_PROPORTIONAL_OP;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_RateMin':
				this.#rateMin = param.getValueAsNumber() ?? DEFAULT_RATE_MIN;
				break;
			case 'm_RateMax':
				this.#rateMax = param.getValueAsNumber() ?? DEFAULT_RATE_MAX;
				break;
			case 'm_flStartTime_min':
				console.error('do this param', paramName, param);
				this.#startTimeMin = param.getValueAsNumber() ?? DEFAULT_START_TIME_MIN;
				break;
			case 'm_flStartTime_max':
				this.#startTimeMax = param.getValueAsNumber() ?? DEFAULT_START_TIME_MAX;
				break;
			case 'm_flEndTime_min':
				this.#endTimeMin = param.getValueAsNumber() ?? DEFAULT_END_TIME_MIN;
				break;
			case 'm_flEndTime_max':
				this.#endTimeMax = param.getValueAsNumber() ?? DEFAULT_END_TIME_MAX;
				break;
			case 'm_nField':
				this.#field = param.getValueAsNumber() ?? PARTICLE_FIELD_RADIUS;
				break;
			case 'm_bProportionalOp':
				this.#proportionalOp = param.getValueAsBool() ?? DEFAULT_PROPORTIONAL_OP;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(particle: Source2Particle, elapsedTime: number): void {
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

		const value = particle.getScalarField(this.#field) + rate * elapsedTime;
		particle.setField(this.#field, value);

	}
}
RegisterSource2ParticleOperator('C_OP_RampScalarLinear', RampScalarLinear);
