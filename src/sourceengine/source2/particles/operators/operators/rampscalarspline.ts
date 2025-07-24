import { RandomFloat } from '../../../../../math/functions';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_BIAS = 0.5;
const DEFAULT_EASE_OUT = false;
const DEFAULT_RATE_MIN = 0;
const DEFAULT_RATE_MAX = 0;
const DEFAULT_FIELD = PARTICLE_FIELD_RADIUS;

export class RampScalarSpline extends Operator {
	#rateMin = 0;
	#rateMax = 0;
	#startTimeMin = 0;
	#startTimeMax = 0;
	#endTimeMin = 1;
	#endTimeMax = 1;
	#field = DEFAULT_FIELD;
	#proportionalOp = true;
	#bias = DEFAULT_BIAS;
	#easeOut = DEFAULT_EASE_OUT;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_RateMin':// TODO: mutualize ?
				this.#rateMin = param.getValueAsNumber() ?? DEFAULT_RATE_MIN;
				break;
			case 'm_RateMax':// TODO: mutualize ?
				this.#rateMax = param.getValueAsNumber() ?? DEFAULT_RATE_MAX;
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
				console.error('do this param', paramName, param);
				this.#endTimeMin = param;
				break;
			case 'm_flEndTime_max':
				console.error('do this param', paramName, param);
				this.#endTimeMax = param;
				break;
			case 'm_nField':// TODO: mutualize ?
				this.#field = param.getValueAsNumber() ?? DEFAULT_FIELD;
				break;
			case 'm_bProportionalOp':
				console.error('do this param', paramName, param);
				this.#proportionalOp = param;
				break;
			case 'm_flBias':
				this.#bias = param.getValueAsNumber() ?? DEFAULT_BIAS;
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
