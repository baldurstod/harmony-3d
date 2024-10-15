import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class PinParticleToCP extends Operator {
	offsetLocal = true;
	particleSelection = null;//PARTICLE_SELECTION_LAST
	pinBreakType = null;//PARTICLE_PIN_DISTANCE_NEIGHBOR
	breakControlPointNumber = -1
	breakControlPointNumber2 = -1

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_vecOffset':
			case 'm_nParticleNumber':
			case 'm_flBreakDistance':
			case 'm_flBreakSpeed':
			case 'm_flAge':
				break;
			case 'm_bOffsetLocal':
				this.offsetLocal = value;
				break;
			case 'm_nParticleSelection':
				this.particleSelection = value;
				break;
			case 'm_nPinBreakType':
				this.pinBreakType = value;
				break;
			case 'm_nBreakControlPointNumber':
				this.breakControlPointNumber = Number(value);
				break;
			case 'm_nBreakControlPointNumber2':
				this.breakControlPointNumber2 = Number(value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		//m_nParticleNumber
		//TODO
	}
}
RegisterSource2ParticleOperator('C_OP_PinParticleToCP', PinParticleToCP);
