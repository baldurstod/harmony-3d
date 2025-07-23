import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class PinParticleToCP extends Operator {
	offsetLocal = true;
	particleSelection = null;//PARTICLE_SELECTION_LAST
	pinBreakType = null;//PARTICLE_PIN_DISTANCE_NEIGHBOR
	breakControlPointNumber = -1
	breakControlPointNumber2 = -1

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_vecOffset':
			case 'm_nParticleNumber':
			case 'm_flBreakDistance':
			case 'm_flBreakSpeed':
			case 'm_flAge':
				break;
			case 'm_bOffsetLocal':
				this.offsetLocal = param;
				break;
			case 'm_nParticleSelection':
				this.particleSelection = param;
				break;
			case 'm_nPinBreakType':
				this.pinBreakType = param;
				break;
			case 'm_nBreakControlPointNumber':
				this.breakControlPointNumber = (param);
				break;
			case 'm_nBreakControlPointNumber2':
				this.breakControlPointNumber2 = (param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime) {
		//m_nParticleNumber
		//TODO
	}
}
RegisterSource2ParticleOperator('C_OP_PinParticleToCP', PinParticleToCP);
