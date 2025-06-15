import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { RemapValClampedBias, lerp } from '../../../../../math/functions';

export class RemapCPtoScalar extends Operator {
	cpInput = 0;
	field = 0;//X
	inputMin = 0;
	inputMax = 1;
	outputMin = 0;
	outputMax = 1;
	startTime = -1;
	endTime = -1;
	setMethod = null;
	remapBias = 0.5;
	scaleInitialRange;// TODO: search default value
	fieldOutput = PARTICLE_FIELD_RADIUS;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nCPInput':
				this.cpInput = Number(value);
				break;
			case 'm_nField':
				this.field = Number(value);//TODO: check [0, 1, 2]
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
			case 'm_nSetMethod':
				this.setMethod = value;
				break;
			case 'm_flRemapBias':
				this.remapBias = value;
				break;
			case 'm_bScaleInitialRange':
				this.scaleInitialRange = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime, strength) {
		const cpInputPos = this.system.getControlPoint(this.cpInput).currentWorldPosition;
		let value = cpInputPos[this.field];

		value = RemapValClampedBias(value, this.inputMin, this.inputMax, this.outputMin, this.outputMax, this.remapBias);

		const scaleInitial = this.scaleInitialRange || this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE';//TODO: optimize

		if (scaleInitial) {
			value = lerp(1, value, strength);
		} else {
			value = lerp(particle.getField(this.fieldOutput), value, strength);
		}

		particle.setField(this.fieldOutput, value, scaleInitial);
	}
}
RegisterSource2ParticleOperator('C_INIT_RemapCPtoScalar', RemapCPtoScalar);
