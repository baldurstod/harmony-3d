import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { DEG_TO_RAD, TWO_PI } from '../../../../../math/constants';

export class Spin extends Operator {
	spinRateDegrees = 0;
	spinRateMinDegrees = 0;
	spinRateStopTime = 0;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nSpinRateDegrees':
				this.spinRateDegrees = Number(value);
				break;
			case 'm_nSpinRateMinDegrees':
				this.spinRateMinDegrees = Number(value);
				break;
			case 'm_fSpinRateStopTime':
				this.spinRateStopTime = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		//particle.rotationRoll += particle.rotationSpeedRoll * elapsedTime;
		let m_fSpinRateStopTime = this.spinRateStopTime;
		let m_fSpinRateRadians = (this.spinRateDegrees) * DEG_TO_RAD;
		let m_fSpinRateMinRadians = (this.spinRateMinDegrees) * DEG_TO_RAD;
		let fCurSpinRate = m_fSpinRateRadians /* * flStrength*/;//TODO

		if (fCurSpinRate == 0.0) {
			return;
		}

		let dt = elapsedTime;
		let drot = dt * Math.abs(fCurSpinRate * TWO_PI);
		if (m_fSpinRateStopTime == 0.0) {
			drot = drot % TWO_PI;//fmod(drot, (float)(2.0f * M_PI));
		}
		if (fCurSpinRate < 0.0) {
			drot = -drot;
		}
		//fltx4 Rot_Add = ReplicateX4(drot);
		let Rot_Add = drot;
		//fltx4 Pi_2 = ReplicateX4(2.0*M_PI);
		//fltx4 nPi_2 = ReplicateX4(-2.0*M_PI);

		// FIXME: This is wrong
		let minSpeedRadians = dt * Math.abs(m_fSpinRateMinRadians * TWO_PI);//fltx4 minSpeedRadians = ReplicateX4(dt * fabs(m_fSpinRateMinRadians * 2.0f * M_PI));

		let now = this.system.currentTime;
		let SpinRateStopTime = m_fSpinRateStopTime;

		//CM128AttributeIterator pCreationTimeStamp(PARTICLE_ATTRIBUTE_CREATION_TIME, pParticles);

		//CM128AttributeIterator pLifeDuration(PARTICLE_ATTRIBUTE_LIFE_DURATION, pParticles);

		//CM128AttributeWriteIterator pRot(GetAttributeToSpin(), pParticles);


		// HACK: Rather than redo this, I'm simply remapping the stop time into the percentage of lifetime, rather than seconds
		let LifeSpan = particle.timeToLive;
		let SpinFadePerc = 0;
		let OOSpinFadeRate = 0;
		if (m_fSpinRateStopTime) {
			SpinFadePerc = LifeSpan * SpinRateStopTime;
			OOSpinFadeRate = 1.0 / SpinFadePerc;
		}

		let Age = now - particle.cTime;
		let RScale = Math.max(0, 1.0 - (Age * OOSpinFadeRate));

		// Cap the rotation at a minimum speed
		let deltaRot = Rot_Add * RScale;
		//fltx4 Tooslow = CmpLeSIMD(deltaRot, minSpeedRadians);
		//deltaRot = OrSIMD(AndSIMD(Tooslow, minSpeedRadians), AndNotSIMD(Tooslow, deltaRot));
		deltaRot = Math.max(minSpeedRadians, deltaRot);

		let NewRot = particle.rotationRoll + deltaRot;

		// now, cap at +/- 2*pi
		/*fltx4 Toobig =CmpGeSIMD(NewRot, Pi_2);
		fltx4 Toosmall = CmpLeSIMD(NewRot, nPi_2);

		NewRot = OrSIMD(AndSIMD(Toobig, SubSIMD(NewRot, Pi_2)),
		AndNotSIMD(Toobig, NewRot));

		NewRot = OrSIMD(AndSIMD(Toosmall, AddSIMD(NewRot, Pi_2)),
		AndNotSIMD(Toosmall, NewRot));*/

				//NewRot = Math.min(Math.max(-Math.TWO_PI, NewRot), Math.TWO_PI);

		particle.rotationRoll = NewRot;
	}
}
RegisterSource2ParticleOperator('C_OP_Spin', Spin);
