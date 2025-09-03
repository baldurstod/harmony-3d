import { vec3 } from 'gl-matrix';
import { AddSIMD, Four_Ones, Four_Zeros, MaskedAssign, MaxSIMD, MinSIMD, MulSIMD, SinEst01SIMD } from '../../../../common/math/sse';
import { ParticleRandomFloat, ParticleRandomVec3 } from '../../../../common/particles/randomfloats';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT, PARAM_TYPE_INT, PARAM_TYPE_VECTOR3 } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../source1particleoperators';
import { SourceEngineParticleSystem } from '../../source1particlesystem';
import { SourceEngineParticleOperator } from '../operator';

/*					'oscillation field' 'int' '0'
					'oscillation field' 'int' '16'
					'oscillation field' 'int' '3'
					'oscillation field' 'int' '4'
					'oscillation field' 'int' '7'*/

const tempVec3Freq = vec3.create();
const tempVec3Rate = vec3.create();

export class OscillateVector extends SourceEngineParticleOperator {
	static functionName = 'Oscillate Vector';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('oscillation field', PARAM_TYPE_INT, 0);
		this.addParam('oscillation rate min', PARAM_TYPE_VECTOR3, vec3.create());
		this.addParam('oscillation rate max', PARAM_TYPE_VECTOR3, vec3.create());
		this.addParam('oscillation frequency min', PARAM_TYPE_VECTOR3, vec3.fromValues(1.0, 1.0, 1.0));
		this.addParam('oscillation frequency max', PARAM_TYPE_VECTOR3, vec3.fromValues(1.0, 1.0, 1.0));
		this.addParam('proportional 0/1', PARAM_TYPE_BOOL, 1);
		this.addParam('start time min', PARAM_TYPE_FLOAT, 0);
		this.addParam('start time max', PARAM_TYPE_FLOAT, 0);
		this.addParam('end time min', PARAM_TYPE_FLOAT, 1);
		this.addParam('end time max', PARAM_TYPE_FLOAT, 1);
		this.addParam('start/end proportional', PARAM_TYPE_BOOL, 1);
		this.addParam('oscillation multiplier', PARAM_TYPE_FLOAT, 2.0);
		this.addParam('oscillation start phase', PARAM_TYPE_FLOAT, 0.5);
	}

	doOperate(particle: SourceEngineParticle, elapsedTime: number) {
		const m_nField = this.getParameter('oscillation field');
		const m_RateMin = this.getParameter('oscillation rate min');
		const m_RateMax = this.getParameter('oscillation rate max');
		const m_FrequencyMin = this.getParameter('oscillation frequency min');
		const m_FrequencyMax = this.getParameter('oscillation frequency max');
		const m_bProportional = this.getParameter('proportional 0/1');
		const m_flStartTime_min = this.getParameter('start time min');
		const m_flStartTime_max = this.getParameter('start time max');
		const m_flEndTime_min = this.getParameter('end time min');
		const m_flEndTime_max = this.getParameter('end time max');
		const m_bProportionalOp = this.getParameter('start/end proportional');
		const m_flOscMult = this.getParameter('oscillation multiplier');
		const m_flOscAdd = this.getParameter('oscillation start phase');

		const pCreationTime = particle.cTime;//CM128AttributeIterator pCreationTime(PARTICLE_ATTRIBUTE_CREATION_TIME, pParticles);
		const pLifeDuration = particle.timeToLive;//CM128AttributeIterator pLifeDuration(PARTICLE_ATTRIBUTE_LIFE_DURATION, pParticles);
		//C4IAttributeIterator pParticleId (PARTICLE_ATTRIBUTE_PARTICLE_ID, pParticles);
		//C4VAttributeWriteIterator pOscField (m_nField, pParticles) ;

		const fl4CurTime = particle.currentTime;

		//const nRandomOffset = particle->OperatorRandomSampleOffset();

		const fvOscVal = vec3.create();//todov3optimize

		const flStrength = 1;
		const fl4ScaleFactor = flStrength * elapsedTime;

		const fl4CosFactorMultiplier = m_flOscMult;
		const fl4CosFactorAdd = m_flOscAdd;

		const fl4CosFactor = fl4CosFactorMultiplier * fl4CurTime + fl4CosFactorAdd;
		const fl4CosFactorProp = fl4CosFactorMultiplier;

		const fl4StartTimeWidth = m_flStartTime_max - m_flStartTime_min;
		const fl4EndTimeWidth = m_flEndTime_max - m_flEndTime_min;

		const fvFrequencyMin = m_FrequencyMin;
		const fvFrequencyWidth = vec3.sub(vec3.create(), m_FrequencyMax, m_FrequencyMin);//todov3optimize
		const fvRateMin = m_RateMin;
		const fvRateWidth = vec3.sub(vec3.create(), m_RateMax, m_RateMin);//todov3optimize

		//int nCtr = pParticles->m_nPaddedActiveParticles;


		//do
		{
			const fl4LifeDuration = pLifeDuration;
			const fl4GoodMask = fl4LifeDuration > 0.0;
			let fl4LifeTime;
			if (m_bProportionalOp) {
				fl4LifeTime = particle.currentTime / particle.timeToLive;
			} else {
				fl4LifeTime = particle.currentTime;
			}

			//TODO: use random table
			//let fl4StartTime = Math.random();//pParticles->RandomFloat(*pParticleId, nRandomOffset + 11);
			let fl4StartTime = ParticleRandomFloat(particle.id, particle.system.operatorRandomSampleOffset + 11);
			fl4StartTime = m_flStartTime_min + fl4StartTimeWidth * fl4StartTime;
			//TODO: use random table
			//let fl4EndTime= Math.random();//pParticles->RandomFloat(*pParticleId, nRandomOffset + 12);
			let fl4EndTime = ParticleRandomFloat(particle.id, particle.system.operatorRandomSampleOffset + 12);
			fl4EndTime = m_flEndTime_min + fl4EndTimeWidth * fl4EndTime;

			if ((fl4LifeTime >= fl4StartTime) && (fl4LifeTime < fl4EndTime)) {
				//TODO: use random table
				//let fvFrequency = vec3.fromValues(Math.random(), Math.random(), Math.random());
				const fvFrequency = ParticleRandomVec3(tempVec3Freq, particle.id + particle.system.operatorRandomSampleOffset, 8, 12, 15);
				//fvFrequency[0] = pParticles->RandomFloat(*pParticleId, nRandomOffset + 8);
				//fvFrequency[1] = pParticles->RandomFloat(*pParticleId, nRandomOffset + 12);
				//fvFrequency[2] = pParticles->RandomFloat(*pParticleId, nRandomOffset + 15);
				vec3.mul(fvFrequency, fvFrequency, fvFrequencyWidth);
				vec3.add(fvFrequency, fvFrequency, fvFrequencyMin);

				//let fvRate = vec3.fromValues(Math.random(), Math.random(), Math.random());
				const fvRate = ParticleRandomVec3(tempVec3Rate, particle.id + particle.system.operatorRandomSampleOffset, 3, 7, 9);
				//fvRate[0] = pParticles->RandomFloat(*pParticleId, nRandomOffset + 3);
				//fvRate[1] = pParticles->RandomFloat(*pParticleId, nRandomOffset + 7);
				//fvRate[2] = pParticles->RandomFloat(*pParticleId, nRandomOffset + 9);

				//fvRate = AddSIMD(fvRateMin, MulSIMD(fvRateWidth, fvRate));
				vec3.mul(fvRate, fvRate, fvRateWidth);
				vec3.add(fvRate, fvRate, fvRateMin);

				const fvCos = vec3.create();//todov3optimize
				if (m_bProportional) {
					fl4LifeTime = particle.currentTime / particle.timeToLive;
					fvCos[0] = fl4CosFactorProp * fvFrequency[0] * fl4LifeTime + fl4CosFactorAdd;
					fvCos[1] = fl4CosFactorProp * fvFrequency[1] * fl4LifeTime + fl4CosFactorAdd;
					fvCos[2] = fl4CosFactorProp * fvFrequency[2] * fl4LifeTime + fl4CosFactorAdd;
				} else {
					vec3.scale(fvCos, fvFrequency, fl4CosFactor);
				}

				const fvOscMultiplier = vec3.create();//todov3optimize
				vec3.scale(fvOscMultiplier, fvRate, fl4ScaleFactor);
				const fvOutput = vec3.create();//TODO: perf//todov3optimize
				this.getInputValueAsVector(m_nField, particle, fvOutput);//*pOscField;

				fvOscVal[0] = AddSIMD(fvOutput[0], MulSIMD(fvOscMultiplier[0], SinEst01SIMD(fvCos[0])));
				fvOscVal[1] = AddSIMD(fvOutput[1], MulSIMD(fvOscMultiplier[1], SinEst01SIMD(fvCos[1])));
				fvOscVal[2] = AddSIMD(fvOutput[2], MulSIMD(fvOscMultiplier[2], SinEst01SIMD(fvCos[2])));

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
SourceEngineParticleOperators.registerOperator(OscillateVector);
