import { vec3, vec4 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { AddSIMD, MaxSIMD, MinSIMD, MulSIMD, SinEst01SIMD, MaskedAssign, Four_Ones, Four_Zeros } from '../../../../common/math/sse';

export class OscillateVector extends Operator {
	rateMin = vec3.create();
	rateMax = vec3.create();
	frequencyMin = vec3.fromValues(1, 1, 1);
	frequencyMax = vec3.fromValues(1, 1, 1);
	field = 0;
	proportional = true;
	proportionalOp = true;
	offset = true;
	startTimeMin = 0;
	startTimeMax = 0;
	endTimeMin = 1;
	endTimeMax = 1;
	oscMult = 2;
	oscAdd = 0.5;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_RateMin':
				vec3.copy(this.rateMin, value);
				break;
			case 'm_RateMax':
				vec3.copy(this.rateMax, value);
				break;
			case 'm_FrequencyMin':
				vec3.copy(this.frequencyMin, value);
				break;
			case 'm_FrequencyMax':
				vec3.copy(this.frequencyMax, value);
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
			case 'm_bOffset':
				this.offset = value;
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
		const m_nField = this.field;

		const pCreationTime = particle.cTime;//CM128AttributeIterator pCreationTime(PARTICLE_ATTRIBUTE_CREATION_TIME, pParticles);
		const pLifeDuration = particle.timeToLive;//CM128AttributeIterator pLifeDuration(PARTICLE_ATTRIBUTE_LIFE_DURATION, pParticles);
		//C4IAttributeIterator pParticleId (PARTICLE_ATTRIBUTE_PARTICLE_ID, pParticles);
		//C4VAttributeWriteIterator pOscField (m_nField, pParticles) ;

		const fl4CurTime = particle.currentTime;

		//const nRandomOffset = particle->OperatorRandomSampleOffset();

		const fvOscVal = vec3.create();//todov3optimize

		const flStrength = 1;
		const fl4ScaleFactor = flStrength * elapsedTime;

		const fl4CosFactorMultiplier = this.oscMult;
		const fl4CosFactorAdd = this.oscAdd;

		const fl4CosFactor = fl4CosFactorMultiplier * fl4CurTime + fl4CosFactorAdd;
		const fl4CosFactorProp = fl4CosFactorMultiplier;

		const fl4StartTimeWidth = this.startTimeMax - this.startTimeMin;
		const fl4EndTimeWidth = this.endTimeMax - this.endTimeMin;

		const fvFrequencyMin = this.frequencyMin;
		const fvFrequencyWidth = vec3.sub(vec3.create(), this.frequencyMax, fvFrequencyMin);//todov3optimize
		const fvRateMin = this.rateMin;
		const fvRateWidth = vec3.sub(vec3.create(), this.rateMax, fvRateMin);//todov3optimize

		//int nCtr = pParticles->m_nPaddedActiveParticles;


		//do
		{
			const fl4LifeDuration = pLifeDuration;
			const fl4GoodMask = fl4LifeDuration > 0.0;
			let fl4LifeTime;
			if (this.proportionalOp) {
				fl4LifeTime = particle.currentTime / particle.timeToLive;
			} else {
				fl4LifeTime = particle.currentTime;
			}

			//TODO: use random table
			let fl4StartTime = Math.random();//pParticles->RandomFloat(*pParticleId, nRandomOffset + 11);
			fl4StartTime = this.startTimeMin + fl4StartTimeWidth * fl4StartTime;
			//TODO: use random table
			let fl4EndTime= Math.random();//pParticles->RandomFloat(*pParticleId, nRandomOffset + 12);
			fl4EndTime = this.endTimeMin + fl4EndTimeWidth * fl4EndTime;

			if ((fl4LifeTime >= fl4StartTime) && (fl4LifeTime < fl4EndTime)) {
				//TODO: use random table
				let fvFrequency = vec3.fromValues(Math.random(), Math.random(), Math.random());
				//fvFrequency[0] = pParticles->RandomFloat(*pParticleId, nRandomOffset + 8);
				//fvFrequency[1] = pParticles->RandomFloat(*pParticleId, nRandomOffset + 12);
				//fvFrequency[2] = pParticles->RandomFloat(*pParticleId, nRandomOffset + 15);
				vec3.mul(fvFrequency, fvFrequency, fvFrequencyWidth);
				vec3.add(fvFrequency, fvFrequency, fvFrequencyMin);

				let fvRate = vec3.fromValues(Math.random(), Math.random(), Math.random());
				//fvRate[0] = pParticles->RandomFloat(*pParticleId, nRandomOffset + 3);
				//fvRate[1] = pParticles->RandomFloat(*pParticleId, nRandomOffset + 7);
				//fvRate[2] = pParticles->RandomFloat(*pParticleId, nRandomOffset + 9);

				//fvRate = AddSIMD(fvRateMin, MulSIMD(fvRateWidth, fvRate));
				vec3.mul(fvRate, fvRate, fvRateWidth);
				vec3.add(fvRate, fvRate, fvRateMin);

				const fvCos = vec3.create();//todov3optimize
				if (this.proportional) {
					fl4LifeTime = particle.currentTime / particle.timeToLive;
					fvCos[0] = fl4CosFactorProp * fvFrequency[0] * fl4LifeTime + fl4CosFactorAdd;
					fvCos[1] = fl4CosFactorProp * fvFrequency[1] * fl4LifeTime + fl4CosFactorAdd;
					fvCos[2] = fl4CosFactorProp * fvFrequency[2] * fl4LifeTime + fl4CosFactorAdd;
				} else {
					vec3.scale(fvCos, fvFrequency, fl4CosFactor);
				}

				const fvOscMultiplier = vec3.create();//todov3optimize
				vec3.scale(fvOscMultiplier, fvRate, fl4ScaleFactor);
				let fvOutput = vec4.create();//TODO: perf//todov3optimize
				this.getInputValueAsVector(m_nField, particle, fvOutput);//*pOscField;

				fvOscVal[0] = AddSIMD (fvOutput[0], MulSIMD (fvOscMultiplier[0], SinEst01SIMD(fvCos[0])));
				fvOscVal[1] = AddSIMD (fvOutput[1], MulSIMD (fvOscMultiplier[1], SinEst01SIMD(fvCos[1])));
				fvOscVal[2] = AddSIMD (fvOutput[2], MulSIMD (fvOscMultiplier[2], SinEst01SIMD(fvCos[2])));

				const pOscField = vec3.create();//todov3optimize
				if (m_nField == 6) {
					pOscField[0] = MaskedAssign(fl4GoodMask,
						MaxSIMD(MinSIMD(fvOscVal[0], Four_Ones), Four_Zeros), fvOutput[0]);
					pOscField[1] = MaskedAssign(fl4GoodMask,
						MaxSIMD(MinSIMD(fvOscVal[1], Four_Ones), Four_Zeros), fvOutput[1]);
					pOscField[2] = MaskedAssign(fl4GoodMask,
						MaxSIMD(MinSIMD(fvOscVal[2], Four_Ones), Four_Zeros), fvOutput[2]);
				} else {
					//pOscField[0] = MaskedAssign(fl4GoodMask, fvOscVal[0], fvOutput[0]);
					//pOscField[1] = MaskedAssign(fl4GoodMask, fvOscVal[1], fvOutput[1]);
					//pOscField[2] = MaskedAssign(fl4GoodMask, fvOscVal[2], fvOutput[2]);
					pOscField[0] = fvOscVal[0];
					pOscField[1] = fvOscVal[1];
					pOscField[2] = fvOscVal[2];
				}
				this.setOutputValue(m_nField, pOscField, particle);
			}
			//++pCreationTime;
			//++pLifeDuration;
			//++pOscField;
			//++pParticleId;
		//} while (--nCtr);
		}
	}
}
RegisterSource2ParticleOperator('C_OP_OscillateVector', OscillateVector);
