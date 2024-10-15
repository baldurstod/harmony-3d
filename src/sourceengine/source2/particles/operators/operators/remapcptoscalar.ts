import { RegisterSource2ParticleOperator } from '../source2particleoperators.js';
import { Operator } from '../operator.js';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields.js';
import { RemapValClamped, lerp } from '../../../../../math/functions';

export class RemapCPtoScalar extends Operator {
	fieldOutput = PARTICLE_FIELD_RADIUS;
	cpInput = 0;
	field = -1;//disabled
	inputMin = 0;
	inputMax = 1;
	outputMin = 0;
	outputMax = 1;
	startTime = -1;
	endTime = -1;
	interpRate = 0;
	setMethod = null;
	scaleInitialRange;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nCPInput':
				this.cpInput = Number(value);
				break;
			case 'm_nField':
				this.field = Number(value);//TODO check -1 / 0 / 1 / 2
				break;
			case 'm_flInputMin':
				this.inputMin = value;
				break;
			case 'm_flInputMax':
				this.inputMax = value;
				break;
			case 'm_flOutputMin':
				this.outputMin = value;
				break;
			case 'm_flOutputMax':
				this.outputMax = value;
				break;
			case 'm_flStartTime':
				this.startTime = value;
				break;
			case 'm_flEndTime':
				this.endTime = value;
				break;
			case 'm_flInterpRate':
				this.interpRate = value;
				break;
			case 'm_nSetMethod':
				this.setMethod = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime, strength) {
		//TODO: use m_flInterpRate
		let cpInputPos = this.system.getControlPoint(this.cpInput).currentWorldPosition;
		let value = cpInputPos[this.field];

		value = RemapValClamped(value, this.inputMin, this.inputMax, this.outputMin, this.outputMax);

		let scaleInitial = this.scaleInitialRange || this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE';//TODO: optimize

		if (scaleInitial) {
			value = lerp(1, value, strength);
		} else {
			value = lerp(particle.getField(this.fieldOutput), value, strength);
		}

		particle.setField(this.fieldOutput, value, scaleInitial);
	}
}
RegisterSource2ParticleOperator('C_OP_RemapCPtoScalar', RemapCPtoScalar);
