import { RemapValClamped, lerp } from '../../../../../math/functions';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_CP_INPUT = 0;// TODO: check default value
const DEFAULT_FIELD = -1;// TODO: check default value
const DEFAULT_INPUT_MIN = 0;// TODO: check default value
const DEFAULT_INPUT_MAX = 1;// TODO: check default value
const DEFAULT_OUTPUT_MIN = 0;// TODO: check default value
const DEFAULT_OUTPUT_MAX = 1;// TODO: check default value
const DEFAULT_START_TIME = -1;// TODO: check default value
const DEFAULT_END_TIME = -1;// TODO: check default value
const DEFAULT_INTERP_RATE = 0;// TODO: check default value
const DEFAULT_SET_METHOD = 'PARTICLE_SET_SCALE_INITIAL_VALUE';// TODO: check default value//TODO: enum

export class RemapCPtoScalar extends Operator {
	//#fieldOutput = PARTICLE_FIELD_RADIUS;
	#cpInput = DEFAULT_CP_INPUT;
	#field = DEFAULT_FIELD;
	#inputMin = DEFAULT_INPUT_MIN;
	#inputMax = DEFAULT_INPUT_MAX;
	#outputMin = DEFAULT_OUTPUT_MIN;
	#outputMax = DEFAULT_OUTPUT_MAX;
	#startTime = DEFAULT_START_TIME;
	#endTime = DEFAULT_END_TIME;
	#interpRate = DEFAULT_INTERP_RATE;
	#setMethod = DEFAULT_SET_METHOD;
	//scaleInitialRange;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nCPInput':
				this.#cpInput = param.getValueAsNumber() ?? DEFAULT_CP_INPUT;
				break;
			case 'm_nField':
				console.error('do this param', paramName, param);
				this.#field = (param);//TODO check -1 / 0 / 1 / 2
				break;
			case 'm_flInputMin':// TODO: mutualize
				this.#inputMin = param.getValueAsNumber() ?? DEFAULT_INPUT_MIN;
				break;
			case 'm_flInputMax':// TODO: mutualize
				this.#inputMax = param.getValueAsNumber() ?? DEFAULT_INPUT_MAX;
				break;
			case 'm_flOutputMin':// TODO: mutualize
				this.#outputMin = param.getValueAsNumber() ?? DEFAULT_OUTPUT_MIN;
				break;
			case 'm_flOutputMax':// TODO: mutualize
				this.#outputMax = param.getValueAsNumber() ?? DEFAULT_OUTPUT_MAX;
				break;
			case 'm_flStartTime':
				console.error('do this param', paramName, param);
				this.#startTime = param;
				break;
			case 'm_flEndTime':
				console.error('do this param', paramName, param);
				this.#endTime = param;
				break;
			case 'm_flInterpRate':
				this.#interpRate = param.getValueAsNumber() ?? DEFAULT_INTERP_RATE;
				break;
			case 'm_nSetMethod':
				this.#setMethod = param.getValueAsString() ?? DEFAULT_SET_METHOD;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: use m_flInterpRate
		const cpInputPos = this.system.getControlPoint(this.#cpInput).currentWorldPosition;
		let value = cpInputPos[this.#field] ?? 0;

		value = RemapValClamped(value, this.#inputMin, this.#inputMax, this.#outputMin, this.#outputMax);

		const scaleInitial = /*this.scaleInitialRange || */this.#setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE';//TODO: optimize

		if (scaleInitial) {
			value = lerp(1, value, strength);
		} else {
			value = lerp(particle.getField(this.fieldOutput) as number, value, strength);
		}

		particle.setField(this.fieldOutput, value, scaleInitial);
	}
}
RegisterSource2ParticleOperator('C_OP_RemapCPtoScalar', RemapCPtoScalar);
