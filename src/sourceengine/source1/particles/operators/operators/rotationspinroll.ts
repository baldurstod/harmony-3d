import { DEG_TO_RAD, TWO_PI } from '../../../../../math/constants';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_INT } from '../../constants';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

/**
 * TODO
 */
export class RotationSpinRoll extends SourceEngineParticleOperator {
	static functionName = 'Rotation Spin Roll';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('spin_rate_degrees', PARAM_TYPE_INT, 0);
		this.addParam('spin_stop_time', PARAM_TYPE_FLOAT, 0);
		this.addParam('spin_rate_min', PARAM_TYPE_INT, 0);
		//DMXELEMENT_UNPACK_FIELD('spin_rate_degrees', '0', int, m_nSpinRateDegrees)
		//DMXELEMENT_UNPACK_FIELD('spin_stop_time', '0', float, m_fSpinRateStopTime)
		//DMXELEMENT_UNPACK_FIELD('spin_rate_min', '0', int, m_nSpinRateMinDegrees)
	}

	doOperate(particle, elapsedTime) {
		const m_nSpinRateDegrees = this.getParameter('spin_rate_degrees');
		const m_fSpinRateStopTime = this.getParameter('spin_stop_time');
		const m_nSpinRateMinDegrees = this.getParameter('spin_rate_min');

		const m_fSpinRateRadians = (m_nSpinRateDegrees) * DEG_TO_RAD;
		const m_fSpinRateMinRadians = (m_nSpinRateMinDegrees) * DEG_TO_RAD;
		const fCurSpinRate = m_fSpinRateRadians /* * flStrength*/;//TODO

		if (fCurSpinRate == 0.0) {
			return;
		}

		const dt = elapsedTime;
		let drot = dt * Math.abs(fCurSpinRate * TWO_PI);
		if (m_fSpinRateStopTime == 0.0) {
			drot = drot % TWO_PI;//fmod(drot, (float)(2.0f * M_PI));
		}
		if (fCurSpinRate < 0.0) {
			drot = -drot;
		}
		//fltx4 Rot_Add = ReplicateX4(drot);
		const Rot_Add = drot;
		//fltx4 Pi_2 = ReplicateX4(2.0*M_PI);
		//fltx4 nPi_2 = ReplicateX4(-2.0*M_PI);

		// FIXME: This is wrong
		const minSpeedRadians = dt * Math.abs(m_fSpinRateMinRadians * TWO_PI);//fltx4 minSpeedRadians = ReplicateX4(dt * fabs(m_fSpinRateMinRadians * 2.0f * M_PI));

		const now = this.particleSystem.currentTime;
		const SpinRateStopTime = m_fSpinRateStopTime;

		//CM128AttributeIterator pCreationTimeStamp(PARTICLE_ATTRIBUTE_CREATION_TIME, pParticles);

		//CM128AttributeIterator pLifeDuration(PARTICLE_ATTRIBUTE_LIFE_DURATION, pParticles);

		//CM128AttributeWriteIterator pRot(GetAttributeToSpin(), pParticles);


		// HACK: Rather than redo this, I'm simply remapping the stop time into the percentage of lifetime, rather than seconds
		const LifeSpan = particle.timeToLive;
		let SpinFadePerc = 0;
		let OOSpinFadeRate = 0;
		if (m_fSpinRateStopTime) {
			SpinFadePerc = LifeSpan * SpinRateStopTime;
			OOSpinFadeRate = 1.0 / SpinFadePerc;
		}

		const Age = now - particle.cTime;
		const RScale = Math.max(0, 1.0 - (Age * OOSpinFadeRate));

		// Cap the rotation at a minimum speed
		let deltaRot = Rot_Add * RScale;
		//fltx4 Tooslow = CmpLeSIMD(deltaRot, minSpeedRadians);
		//deltaRot = OrSIMD(AndSIMD(Tooslow, minSpeedRadians), AndNotSIMD(Tooslow, deltaRot));
		deltaRot = Math.max(minSpeedRadians, deltaRot);

		const NewRot = particle.rotationRoll + deltaRot;

		// now, cap at +/- 2*pi
		/*fltx4 Toobig =CmpGeSIMD(NewRot, Pi_2);
		fltx4 Toosmall = CmpLeSIMD(NewRot, nPi_2);

		NewRot = OrSIMD(AndSIMD(Toobig, SubSIMD(NewRot, Pi_2)),
		AndNotSIMD(Toobig, NewRot));

		NewRot = OrSIMD(AndSIMD(Toosmall, AddSIMD(NewRot, Pi_2)),
		AndNotSIMD(Toosmall, NewRot));*/

		//NewRot = Math.min(Math.max(-Math.TWO_PI, NewRot), Math.TWO_PI);

		particle.rotationRoll = NewRot;



		// Note: this should be PI / 180, but for some reason there is a bug in source engine
		//		particle.rotationRoll += spin_rate_degrees*elapsedTime * Math.PI * Math.PI / 90.0;
	}
}
SourceEngineParticleOperators.registerOperator(RotationSpinRoll);
SourceEngineParticleOperators.registerOperator('Rotation Spin', RotationSpinRoll);
