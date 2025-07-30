import { RemapValClampedBias } from '../../../../../math/functions';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_INPUT_MIN = 0;
const DEFAULT_INPUT_MAX = 10;
const DEFAULT_SCALE_CONTROL_POINT = -1;// TODO: check default value
const DEFAULT_SCALE_CONTROL_POINT_FIELD = -1;// TODO: check default value
const DEFAULT_OUTPUT_MIN = 0;// TODO: check default value
const DEFAULT_OUTPUT_MAX = 1;// TODO: check default value
const DEFAULT_ACTIVE_RANGE = false;// TODO: check default value
const DEFAULT_INVERT = false;// TODO: check default value
const DEFAULT_WRAP = false;// TODO: check default value
const DEFAULT_REMAP_BIAS = 0.5;// TODO: check default value

export class RemapParticleCountToScalar extends Operator {
	#inputMin = DEFAULT_INPUT_MIN;
	#inputMax = DEFAULT_INPUT_MAX;
	#scaleControlPoint = DEFAULT_SCALE_CONTROL_POINT;
	#scaleControlPointField = DEFAULT_SCALE_CONTROL_POINT_FIELD;
	#outputMin = DEFAULT_OUTPUT_MIN;
	#outputMax = DEFAULT_OUTPUT_MAX;
	#activeRange = DEFAULT_ACTIVE_RANGE;
	#invert = DEFAULT_INVERT;
	#wrap = DEFAULT_WRAP;
	remapBias = DEFAULT_REMAP_BIAS;
	//#fieldOutput = PARTICLE_FIELD_RADIUS;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nInputMin':
				this.#inputMin = param.getValueAsNumber() ?? DEFAULT_INPUT_MIN;
				break;
			case 'm_nInputMax':
				this.#inputMax = param.getValueAsNumber() ?? DEFAULT_INPUT_MAX;
				break;
			case 'm_nScaleControlPoint':
				this.#scaleControlPoint = param.getValueAsNumber() ?? DEFAULT_SCALE_CONTROL_POINT;
				break;
			case 'm_nScaleControlPointField':
				this.#scaleControlPointField = param.getValueAsNumber() ?? DEFAULT_SCALE_CONTROL_POINT_FIELD;
				break;
			case 'm_flOutputMin':
				this.#outputMin  = param.getValueAsNumber() ?? DEFAULT_OUTPUT_MIN;
				break;
			case 'm_flOutputMax':
				this.#outputMax = param.getValueAsNumber() ?? DEFAULT_OUTPUT_MAX;
				break;
				break;
			case 'm_bActiveRange':
				this.#activeRange = param.getValueAsBool() ?? DEFAULT_ACTIVE_RANGE;
				break;
			case 'm_bInvert':
				this.#invert  = param.getValueAsBool() ?? DEFAULT_INVERT;
				break;
			case 'm_bWrap':
				this.#wrap  = param.getValueAsBool() ?? DEFAULT_WRAP;
				break;
			case 'm_flRemapBias':
				this.remapBias  = param.getValueAsNumber() ?? DEFAULT_REMAP_BIAS;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: use bias, invert m_nScaleControlPointField parameters
		let value = particle.id;
		if (this.#wrap) {
			value = value % (this.#inputMax + 1);
		}

		if (this.#activeRange && (value < this.#inputMin || value > this.#inputMax)) {
			return;
		}

		value = RemapValClampedBias(value, this.#inputMin, this.#inputMax, this.#outputMin, this.#outputMax, this.remapBias);
		particle.setField(this.fieldOutput, value, this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
	}
}
RegisterSource2ParticleOperator('C_INIT_RemapParticleCountToScalar', RemapParticleCountToScalar);
