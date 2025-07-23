import { RemapValClampedBias, lerp } from '../../../../../math/functions';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

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
	#fieldOutput = PARTICLE_FIELD_RADIUS;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nCPInput':
				this.cpInput = (param);
				break;
			case 'm_nField':
				this.field = (param);//TODO: check [0, 1, 2]
				break;
			case 'm_flInputMin':
				this.inputMin = param;
				break;
			case 'm_flInputMax':
				this.inputMax = param;
				break;
			case 'm_flOutputMin':
				this.outputMin = param;
				break;
			case 'm_flOutputMax':
				this.outputMax = param;
				break;
			case 'm_flStartTime':
				this.startTime = param;
				break;
			case 'm_flEndTime':
				this.endTime = param;
				break;
			case 'm_nSetMethod':
				this.setMethod = param;
				break;
			case 'm_flRemapBias':
				this.remapBias = param;
				break;
			case 'm_bScaleInitialRange':
				this.scaleInitialRange = param;
				break;
			default:
				super._paramChanged(paramName, param);
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
			value = lerp(particle.getField(this.#fieldOutput), value, strength);
		}

		particle.setField(this.#fieldOutput, value, scaleInitial);
	}
}
RegisterSource2ParticleOperator('C_INIT_RemapCPtoScalar', RemapCPtoScalar);
