import { clamp } from '../../../../../math/functions';
import { PARTICLE_FIELD_ALPHA } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';


const DEFAULT_RATE_MIN = 0;// TODO: check default value
const DEFAULT_RATE_MAX = 0;// TODO: check default value
const DEFAULT_FREQUENCY_MIN = 1;// TODO: check default value
const DEFAULT_FREQUENCY_MAX = 1;// TODO: check default value
const DEFAULT_FIELD = PARTICLE_FIELD_ALPHA;// TODO: check default value
const DEFAULT_PROPORTIONAL = true;// TODO: check default value
const DEFAULT_PROPORTIONAL_OP = true;// TODO: check default value
const DEFAULT_START_TIME_MIN = 0;// TODO: check default value
const DEFAULT_START_TIME_MAX = 0;// TODO: check default value
const DEFAULT_END_TIME_MIN = 1;// TODO: check default value
const DEFAULT_END_TIME_MAX = 1;// TODO: check default value
const DEFAULT_OSC_MULT = 2;// TODO: check default value
const DEFAULT_OSC_ADD = 0.5;// TODO: check default value

export class OscillateScalar extends Operator {
	#rateMin = DEFAULT_RATE_MIN;
	#rateMax = DEFAULT_RATE_MAX;
	#frequencyMin = DEFAULT_FREQUENCY_MIN;
	#frequencyMax = DEFAULT_FREQUENCY_MAX;
	#field = DEFAULT_FIELD;
	#proportional = DEFAULT_PROPORTIONAL;
	#proportionalOp = DEFAULT_PROPORTIONAL_OP;
	#startTimeMin = DEFAULT_START_TIME_MIN;
	#startTimeMax = DEFAULT_START_TIME_MAX;
	#endTimeMin = DEFAULT_END_TIME_MIN;
	#endTimeMax = DEFAULT_END_TIME_MAX;
	#oscMult = DEFAULT_OSC_MULT;
	#oscAdd = DEFAULT_OSC_ADD;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_RateMin':// TODO: mutualize ?
				this.#rateMin = param.getValueAsNumber() ?? DEFAULT_RATE_MIN;
				break;
			case 'm_RateMax':
				this.#rateMax = param.getValueAsNumber() ?? DEFAULT_RATE_MAX;
				break;
			case 'm_FrequencyMin':
				this.#frequencyMin = param.getValueAsNumber() ?? DEFAULT_FREQUENCY_MIN;
				break;
			case 'm_FrequencyMax':
				this.#frequencyMax = param.getValueAsNumber() ?? DEFAULT_FREQUENCY_MAX;
				break;
			case 'm_nField':
				this.#field = param.getValueAsNumber() ?? DEFAULT_FIELD;
				break;
			case 'm_bProportional':
				this.#proportional = param.getValueAsBool() ?? DEFAULT_PROPORTIONAL;
				break;
			case 'm_bProportionalOp':
				this.#proportionalOp = param.getValueAsBool() ?? DEFAULT_PROPORTIONAL_OP;
				break;
			case 'm_flStartTime_min':
				this.#startTimeMin = param.getValueAsNumber() ?? DEFAULT_START_TIME_MIN;
				break;
			case 'm_flStartTime_max':
				this.#startTimeMax = param.getValueAsNumber() ?? DEFAULT_START_TIME_MAX;
				break;
			case 'm_flEndTime_min':
				this.#endTimeMin = param.getValueAsNumber() ?? DEFAULT_END_TIME_MAX;
				break;
			case 'm_flEndTime_max':
				this.#endTimeMax = param.getValueAsNumber() ?? DEFAULT_END_TIME_MAX;
				break;
			case 'm_flOscMult':// TODO: mutualize ?
				this.#oscMult = param.getValueAsNumber() ?? DEFAULT_OSC_MULT;
				break;
			case 'm_flOscAdd':// TODO: mutualize ?
				this.#oscAdd = param.getValueAsNumber() ?? DEFAULT_OSC_ADD;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(particle: Source2Particle, elapsedTime: number): void {
		const fl4StartTimeWidth = this.#startTimeMax - this.#startTimeMin;
		const fl4EndTimeWidth = this.#endTimeMax - this.#endTimeMin;

		const fl4FrequencyWidth = this.#frequencyMax - this.#frequencyMin;
		const fl4RateWidth = this.#rateMax - this.#rateMin;

		const fl4ScaleFactor = /*flStrength * */elapsedTime;

		const fl4CosFactor = this.#oscMult * particle.currentTime + this.#oscAdd;

		if (particle.timeToLive) {
			let fl4LifeTime;
			if (this.#proportionalOp) {
				fl4LifeTime = particle.proportionOfLife;
			} else {
				fl4LifeTime = particle.currentTime;
			}

			//TODO: use random table
			let fl4StartTime = 0.5;//Math.random();//pParticles->RandomFloat(*pParticleId, nRandomOffset + 11);
			fl4StartTime = this.#startTimeMin + fl4StartTimeWidth * fl4StartTime;

			//TODO: use random table
			let fl4EndTime = 0.5;//Math.random();//pParticles->RandomFloat(*pParticleId, nRandomOffset + 12);
			fl4EndTime = this.#endTimeMin + fl4EndTimeWidth * fl4EndTime;

			if ((fl4LifeTime >= fl4StartTime) && (fl4LifeTime < fl4EndTime)) {
				//TODO: use random table
				let fl4Frequency = 0.5;//Math.random();//pParticles->RandomFloat(*pParticleId, nRandomOffset);
				fl4Frequency = this.#frequencyMin + fl4FrequencyWidth * fl4Frequency;

				//TODO: use random table
				let fl4Rate = 0.5;//Math.random();//pParticles->RandomFloat(*pParticleId, nRandomOffset + 1);
				fl4Rate = this.#rateMin + fl4RateWidth * fl4Rate;

				let fl4Cos;
				if (this.#proportional) {
					fl4LifeTime = (particle.currentTime - particle.cTime) / particle.timeToLive;
					fl4Cos = ((this.#oscMult * (fl4LifeTime * fl4Frequency)) + this.#oscAdd);
				} else {
					fl4Cos = fl4CosFactor * fl4Frequency;
				}
				const fl4OscMultiplier = fl4Rate * fl4ScaleFactor;
				let fl4OscVal = particle.getScalarField(this.#field) + fl4OscMultiplier * Math.sin(fl4Cos * Math.PI);
				if (this.#field == PARTICLE_FIELD_ALPHA) {
					fl4OscVal = clamp(fl4OscVal, 0.0, 1.0);
				}
				particle.setField(this.#field, fl4OscVal);
			}
		}

	}
}
RegisterSource2ParticleOperator('C_OP_OscillateScalar', OscillateScalar);
