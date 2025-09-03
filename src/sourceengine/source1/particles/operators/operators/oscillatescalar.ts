import { clamp } from '../../../../../math/functions';
import { ParticleRandomFloat } from '../../../../common/particles/randomfloats';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT, PARAM_TYPE_INT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

export class OscillateScalar extends Source1ParticleOperator {
	static functionName = 'Oscillate Scalar';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.setNameId('Oscillate Scalar');
		this.addParam('oscillation field', PARAM_TYPE_INT, 7);//Alpha
		this.addParam('oscillation rate min', PARAM_TYPE_FLOAT, 0);
		this.addParam('oscillation rate max', PARAM_TYPE_FLOAT, 0);
		this.addParam('oscillation frequency min', PARAM_TYPE_FLOAT, 1);
		this.addParam('oscillation frequency max', PARAM_TYPE_FLOAT, 1);
		this.addParam('proportional 0/1', PARAM_TYPE_BOOL, true);
		this.addParam('start time min', PARAM_TYPE_FLOAT, 0);
		this.addParam('start time max', PARAM_TYPE_FLOAT, 0);
		this.addParam('end time min', PARAM_TYPE_FLOAT, 0);
		this.addParam('end time max', PARAM_TYPE_FLOAT, 0);
		this.addParam('start/end proportional', PARAM_TYPE_BOOL, true);
		this.addParam('oscillation multiplier', PARAM_TYPE_FLOAT, 2);
		this.addParam('oscillation start phase', PARAM_TYPE_FLOAT, 0.5);
		//	DMXELEMENT_UNPACK_FIELD_USERDATA('oscillation field', '7', int, m_nField, 'intchoice particlefield_scalar')
		//	DMXELEMENT_UNPACK_FIELD('oscillation rate min', '0', float, m_RateMin)
		//	DMXELEMENT_UNPACK_FIELD('oscillation rate max', '0', float, m_RateMax)
		//	DMXELEMENT_UNPACK_FIELD('oscillation frequency min', '1', float, m_FrequencyMin)
		//	DMXELEMENT_UNPACK_FIELD('oscillation frequency max', '1', float, m_FrequencyMax)
		//	DMXELEMENT_UNPACK_FIELD('proportional 0/1', '1', bool, m_bProportional)
		//	DMXELEMENT_UNPACK_FIELD('start time min', '0', float, m_flStartTime_min)
		//	DMXELEMENT_UNPACK_FIELD('start time max', '0', float, m_flStartTime_max)
		//	DMXELEMENT_UNPACK_FIELD('end time min', '1', float, m_flEndTime_min)
		//	DMXELEMENT_UNPACK_FIELD('end time max', '1', float, m_flEndTime_max)
		//	DMXELEMENT_UNPACK_FIELD('start/end proportional', '1', bool, m_bProportionalOp)
		//	DMXELEMENT_UNPACK_FIELD('oscillation multiplier', '2', float, m_flOscMult)
		//	DMXELEMENT_UNPACK_FIELD('oscillation start phase', '.5', float, m_flOscAdd)
	}

	doOperate(particle: Source1Particle, elapsedTime: number) {
		const m_bProportional = this.getParameter('proportional 0/1');
		const m_bProportionalOp = this.getParameter('start/end proportional');
		const oscillationField = this.getParameter('oscillation field');

		const m_RateMin = this.getParameter('oscillation rate min');
		const m_RateMax = this.getParameter('oscillation rate max');

		const m_FrequencyMin = this.getParameter('oscillation frequency min');
		const m_FrequencyMax = this.getParameter('oscillation frequency max');

		const multiplier = this.getParameter('oscillation multiplier');

		const m_flStartTime_min = this.getParameter('start time min');
		const m_flStartTime_max = this.getParameter('start time max');
		const m_flEndTime_min = this.getParameter('end time min');
		const m_flEndTime_max = this.getParameter('end time max');

		const m_flOscMult = this.getParameter('oscillation multiplier');
		const m_flOscAdd = this.getParameter('oscillation start phase');

		const fl4StartTimeWidth = m_flStartTime_max - m_flStartTime_min;
		const fl4EndTimeWidth = m_flEndTime_max - m_flEndTime_min;

		const fl4FrequencyWidth = m_FrequencyMax - m_FrequencyMin;
		const fl4RateWidth = m_RateMax - m_RateMin;

		const fl4ScaleFactor = /*flStrength * */elapsedTime;

		const fl4CosFactor = m_flOscMult * particle.currentTime + m_flOscAdd;

		if (particle.timeToLive) {
			let fl4LifeTime;
			if (m_bProportionalOp) {
				fl4LifeTime = particle.currentTime / particle.timeToLive;
			} else {
				fl4LifeTime = particle.currentTime;
			}

			let fl4StartTime = ParticleRandomFloat(particle.id, particle.system.operatorRandomSampleOffset + 11);
			fl4StartTime = m_flStartTime_min + fl4StartTimeWidth * fl4StartTime;

			let fl4EndTime = ParticleRandomFloat(particle.id, particle.system.operatorRandomSampleOffset + 12);
			fl4EndTime = m_flEndTime_min + fl4EndTimeWidth * fl4EndTime;

			if ((fl4LifeTime >= fl4StartTime) && (fl4LifeTime < fl4EndTime)) {
				let fl4Frequency = ParticleRandomFloat(particle.id, particle.system.operatorRandomSampleOffset);
				fl4Frequency = m_FrequencyMin + fl4FrequencyWidth * fl4Frequency;

				let fl4Rate = ParticleRandomFloat(particle.id, particle.system.operatorRandomSampleOffset + 1);
				fl4Rate = m_RateMin + fl4RateWidth * fl4Rate;

				let fl4Cos;
				if (m_bProportional) {
					fl4LifeTime = (particle.currentTime - particle.cTime) / particle.timeToLive;
					fl4Cos = ((m_flOscMult * (fl4LifeTime * fl4Frequency)) + m_flOscAdd);
				} else {
					fl4Cos = fl4CosFactor * fl4Frequency;
				}
				const fl4OscMultiplier = fl4Rate * fl4ScaleFactor;
				let fl4OscVal = particle.getField(oscillationField) + fl4OscMultiplier * Math.sin(fl4Cos * Math.PI);
				if (oscillationField == 7) { //alpha
					fl4OscVal = clamp(fl4OscVal, 0.0, 1.0);
				}
				particle.setField(oscillationField, fl4OscVal);
				//console.error(fl4OscVal);
			}
		}
	}
}
Source1ParticleOperators.registerOperator(OscillateScalar);
