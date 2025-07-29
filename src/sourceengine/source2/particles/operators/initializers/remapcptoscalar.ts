import { RemapValClampedBias, lerp } from '../../../../../math/functions';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_CP_INPUT = 0;// TODO: check default value
const DEFAULT_FIELD = 0;// TODO: check default value
const DEFAULT_INPUT_MIN = 0;// TODO: check default value
const DEFAULT_INPUT_MAX = 1;// TODO: check default value
const DEFAULT_OUTPUT_MIN = 0;// TODO: check default value
const DEFAULT_OUTPUT_MAX = 1;// TODO: check default value
const DEFAULT_START_TIME = -1;// TODO: check default value
const DEFAULT_END_TIME = -1;// TODO: check default value
const DEFAULT_SET_METHOD = 'PARTICLE_SET_SCALE_INITIAL_VALUE';// TODO: check default value//TODO: enum
const DEFAULT_REMAP_BIAS = 0.5;// TODO: check default value//TODO: enum
const DEFAULT_SCALAR_INITIAL_RANGE = false;// TODO: check default value//TODO: enum

export class RemapCPtoScalar extends Operator {
	#cpInput = DEFAULT_CP_INPUT;
	#field = DEFAULT_FIELD;//X
	#inputMin = DEFAULT_INPUT_MIN;
	#inputMax = DEFAULT_INPUT_MAX;
	outputMin = DEFAULT_OUTPUT_MIN;
	outputMax = DEFAULT_OUTPUT_MAX;
	startTime = DEFAULT_START_TIME;
	endTime = DEFAULT_END_TIME;
	setMethod = DEFAULT_SET_METHOD;
	remapBias = DEFAULT_REMAP_BIAS;
	scaleInitialRange = DEFAULT_SCALAR_INITIAL_RANGE;// TODO: search default value

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nCPInput':
				this.#cpInput = param.getValueAsNumber() ?? DEFAULT_CP_INPUT;
				break;
			case 'm_nField':
				this.#field = param.getValueAsNumber() ?? DEFAULT_FIELD;//TODO: check [0, 1, 2]
				break;
			case 'm_flInputMin':
				this.#inputMin = param.getValueAsNumber() ?? DEFAULT_INPUT_MIN;
				break;
			case 'm_flInputMax':
				this.#inputMax = param.getValueAsNumber() ?? DEFAULT_INPUT_MAX;
				break;
			case 'm_flOutputMin':
				this.outputMin = param.getValueAsNumber() ?? DEFAULT_OUTPUT_MIN;
				break;
			case 'm_flOutputMax':
				this.outputMax = param.getValueAsNumber() ?? DEFAULT_OUTPUT_MAX;
				break;
			case 'm_flStartTime':
				this.startTime = param.getValueAsNumber() ?? DEFAULT_START_TIME;
				break;
			case 'm_flEndTime':
				this.endTime = param.getValueAsNumber() ?? DEFAULT_END_TIME;
				break;
			case 'm_nSetMethod':
				this.setMethod = param.getValueAsString() ?? DEFAULT_SET_METHOD;
				break;
			case 'm_flRemapBias':
				this.remapBias = param.getValueAsNumber() ?? DEFAULT_REMAP_BIAS;
				break;
			case 'm_bScaleInitialRange':
				this.scaleInitialRange = param.getValueAsBool() ?? DEFAULT_SCALAR_INITIAL_RANGE;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const cpInputPos = this.system.getControlPoint(this.#cpInput).currentWorldPosition;
		let value = cpInputPos[this.#field] ?? 0;

		value = RemapValClampedBias(value, this.#inputMin, this.#inputMax, this.outputMin, this.outputMax, this.remapBias);

		const scaleInitial = this.scaleInitialRange || this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE';//TODO: optimize

		if (scaleInitial) {
			value = lerp(1, value, strength);
		} else {
			value = lerp(particle.getScalarField(this.fieldOutput), value, strength);
		}

		particle.setField(this.fieldOutput, value, scaleInitial);
	}
}
RegisterSource2ParticleOperator('C_INIT_RemapCPtoScalar', RemapCPtoScalar);
