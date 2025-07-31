import { RandomFloat } from '../../../../../math/functions';
import { Source2ParticleScalarField } from '../../enums';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_RATE_MIN = 0;
const DEFAULT_RATE_MAX = 0;
const DEFAULT_START_TIME_MIN = 0;
const DEFAULT_START_TIME_MAX = 0;
const DEFAULT_END_TIME_MIN = 1;
const DEFAULT_END_TIME_MAX = 1;
const DEFAULT_BIAS = 0.5;
const DEFAULT_PROPORTIONAL_OP = true;
const DEFAULT_EASE_OUT = false;
const DEFAULT_FIELD = Source2ParticleScalarField.Radius;

export class RampScalarSpline extends Operator {//Ramp scalar spline random
	#rateMin = DEFAULT_RATE_MIN;
	#rateMax = DEFAULT_RATE_MAX;
	#startTimeMin = DEFAULT_START_TIME_MIN;
	#startTimeMax = DEFAULT_START_TIME_MAX;
	#endTimeMin = DEFAULT_END_TIME_MIN;
	#endTimeMax = DEFAULT_END_TIME_MAX;
	#field = DEFAULT_FIELD;
	#proportionalOp = DEFAULT_PROPORTIONAL_OP;
	#bias = DEFAULT_BIAS;
	#easeOut = DEFAULT_EASE_OUT;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_RateMin':
				this.#rateMin = param.getValueAsNumber() ?? DEFAULT_RATE_MIN;
				break;
			case 'm_RateMax':
				this.#rateMax = param.getValueAsNumber() ?? DEFAULT_RATE_MAX;
				break;
			case 'm_flStartTime_min':
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
			case 'm_flBias':
				this.#bias = param.getValueAsNumber() ?? DEFAULT_BIAS;
				break;
			case 'm_nField':
				this.#field = param.getValueAsNumber() ?? DEFAULT_FIELD;
				break;
			case 'm_bProportionalOp':
				console.error('do this param', paramName, param);
				this.#proportionalOp = param.getValueAsBool() ?? DEFAULT_PROPORTIONAL_OP;
				break;
			case 'm_bEaseOut':
				this.#easeOut = param.getValueAsBool() ?? DEFAULT_EASE_OUT;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO : use m_flBias m_bEaseOut
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

		const value = particle.getField(this.#field) as number + rate * elapsedTime;
		particle.setField(this.#field, value);

	}
}
RegisterSource2ParticleOperator('C_OP_RampScalarSpline', RampScalarSpline);
