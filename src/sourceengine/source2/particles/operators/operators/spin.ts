import { DEG_TO_RAD, TWO_PI } from '../../../../../math/constants';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_SPIN_RATE = 0;// TODO: check default value
const DEFAULT_SPIN_RATE_MIN = 0;// TODO: check default value
const DEFAULT_SPIN_RATE_STOP_TIME = 0;// TODO: check default value

export class Spin extends Operator {
	#spinRateDegrees = DEFAULT_SPIN_RATE;
	#spinRateMinDegrees = DEFAULT_SPIN_RATE_MIN;
	#spinRateStopTime = DEFAULT_SPIN_RATE_STOP_TIME;

	override   _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nSpinRateDegrees':
				this.#spinRateDegrees = param.getValueAsNumber() ?? DEFAULT_SPIN_RATE;
				break;
			case 'm_nSpinRateMinDegrees':
				this.#spinRateMinDegrees = param.getValueAsNumber() ?? DEFAULT_SPIN_RATE_MIN;
				break;
			case 'm_fSpinRateStopTime':
				this.#spinRateStopTime = param.getValueAsNumber() ?? DEFAULT_SPIN_RATE_STOP_TIME;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(particle: Source2Particle, elapsedTime: number): void {
		//particle.rotationRoll += particle.rotationSpeedRoll * elapsedTime;
		const m_fSpinRateStopTime = this.#spinRateStopTime;
		const m_fSpinRateRadians = (this.#spinRateDegrees) * DEG_TO_RAD;//TODO: optimize
		const m_fSpinRateMinRadians = (this.#spinRateMinDegrees) * DEG_TO_RAD;//TODO: optimize
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

		const now = this.system.currentTime;
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
	}
}
RegisterSource2ParticleOperator('C_OP_Spin', Spin);
