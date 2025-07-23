import { RemapValClamped, lerp } from '../../../../../math/functions';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class RemapCPtoScalar extends Operator {
	#fieldOutput = PARTICLE_FIELD_RADIUS;
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

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nCPInput':
				console.error('do this param', paramName, param);
				this.cpInput = (param);
				break;
			case 'm_nField':
				console.error('do this param', paramName, param);
				this.field = (param);//TODO check -1 / 0 / 1 / 2
				break;
			case 'm_flInputMin':
				console.error('do this param', paramName, param);
				this.inputMin = param;
				break;
			case 'm_flInputMax':
				console.error('do this param', paramName, param);
				this.inputMax = param;
				break;
			case 'm_flOutputMin':
				console.error('do this param', paramName, param);
				this.outputMin = param;
				break;
			case 'm_flOutputMax':
				console.error('do this param', paramName, param);
				this.outputMax = param;
				break;
			case 'm_flStartTime':
				console.error('do this param', paramName, param);
				this.startTime = param;
				break;
			case 'm_flEndTime':
				console.error('do this param', paramName, param);
				this.endTime = param;
				break;
			case 'm_flInterpRate':
				console.error('do this param', paramName, param);
				this.interpRate = param;
				break;
			case 'm_nSetMethod':
				console.error('do this param', paramName, param);
				this.setMethod = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime, strength) {
		//TODO: use m_flInterpRate
		const cpInputPos = this.system.getControlPoint(this.cpInput).currentWorldPosition;
		let value = cpInputPos[this.field];

		value = RemapValClamped(value, this.inputMin, this.inputMax, this.outputMin, this.outputMax);

		const scaleInitial = this.scaleInitialRange || this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE';//TODO: optimize

		if (scaleInitial) {
			value = lerp(1, value, strength);
		} else {
			value = lerp(particle.getField(this.#fieldOutput), value, strength);
		}

		particle.setField(this.#fieldOutput, value, scaleInitial);
	}
}
RegisterSource2ParticleOperator('C_OP_RemapCPtoScalar', RemapCPtoScalar);
