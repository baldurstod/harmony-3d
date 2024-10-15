import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_ALPHA } from '../../../../common/particles/particlefields';
import { clamp } from '../../../../../math/functions';

export class OscillateScalar extends Operator {
	rateMin = 0;
	rateMax = 0;
	frequencyMin = 1;
	frequencyMax = 1;
	field = PARTICLE_FIELD_ALPHA;
	proportional = true;
	proportionalOp = true;
	startTimeMin = 0;
	startTimeMax = 0;
	endTimeMin = 1;
	endTimeMax = 1;
	oscMult = 2;
	oscAdd = 0.5;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_RateMin':
				this.rateMin = value;
				break;
			case 'm_RateMax':
				this.rateMax = value;
				break;
			case 'm_FrequencyMin':
				this.frequencyMin = value;
				break;
			case 'm_FrequencyMax':
				this.frequencyMax = value;
				break;
			case 'm_nField':
				this.field = Number(value);
				break;
			case 'm_bProportional':
				this.proportional = value;
				break;
			case 'm_bProportionalOp':
				this.proportionalOp = value;
				break;
			case 'm_flStartTime_min':
				this.startTimeMin = value;
				break;
			case 'm_flStartTime_max':
				this.startTimeMax = value;
				break;
			case 'm_flEndTime_min':
				this.endTimeMin = value;
				break;
			case 'm_flEndTime_max':
				this.endTimeMax = value;
				break;
			case 'm_flOscMult':
				this.oscMult = value;
				break;
			case 'm_flOscAdd':
				this.oscAdd = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		let fl4StartTimeWidth = this.startTimeMax - this.startTimeMin;
		let fl4EndTimeWidth = this.endTimeMax - this.endTimeMin;

		let fl4FrequencyWidth = this.frequencyMax - this.frequencyMin;
		let fl4RateWidth = this.rateMax - this.rateMin;

		let fl4ScaleFactor = /*flStrength * */elapsedTime;

		let fl4CosFactor = this.oscMult * particle.currentTime + this.oscAdd;

		if (particle.timeToLive) {
			let fl4LifeTime;
			if (this.proportionalOp) {
				fl4LifeTime = particle.proportionOfLife;
			} else {
				fl4LifeTime = particle.currentTime;
			}

			//TODO: use random table
			let fl4StartTime = 0.5;//Math.random();//pParticles->RandomFloat(*pParticleId, nRandomOffset + 11);
			fl4StartTime = this.startTimeMin + fl4StartTimeWidth * fl4StartTime;

			//TODO: use random table
			let fl4EndTime = 0.5;//Math.random();//pParticles->RandomFloat(*pParticleId, nRandomOffset + 12);
			fl4EndTime = this.endTimeMin + fl4EndTimeWidth * fl4EndTime;

			if ((fl4LifeTime >= fl4StartTime) && (fl4LifeTime < fl4EndTime)) {
				//TODO: use random table
				let fl4Frequency = 0.5;//Math.random();//pParticles->RandomFloat(*pParticleId, nRandomOffset);
				fl4Frequency = this.frequencyMin + fl4FrequencyWidth * fl4Frequency;

				//TODO: use random table
				let fl4Rate = 0.5;//Math.random();//pParticles->RandomFloat(*pParticleId, nRandomOffset + 1);
				fl4Rate = this.rateMin + fl4RateWidth * fl4Rate;

				let fl4Cos;
				if (this.proportional) {
					fl4LifeTime = (particle.currentTime - particle.cTime) / particle.timeToLive;
					fl4Cos = ((this.oscMult *(fl4LifeTime * fl4Frequency)) + this.oscAdd);
				} else {
					fl4Cos = fl4CosFactor * fl4Frequency;
				}
				let fl4OscMultiplier = fl4Rate * fl4ScaleFactor;
				let fl4OscVal = particle.getField(this.field) + fl4OscMultiplier * Math.sin(fl4Cos * Math.PI);
				if (this.field == PARTICLE_FIELD_ALPHA) {
					fl4OscVal = clamp(fl4OscVal, 0.0, 1.0);
				}
				particle.setField(this.field, fl4OscVal);
			}
		}

	}
}
RegisterSource2ParticleOperator('C_OP_OscillateScalar', OscillateScalar);
