import { vec3, vec4 } from 'gl-matrix';
import { PARTICLE_FIELD_COLOR } from '../../../../common/particles/particlefields';
import { Source2ParticleSetMethod, stringToSetMethod } from '../../enums';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_INPUT_VALUE = vec3.create();
const initVecTempVec4 = vec4.create();

const DEFAULT_FIELD_OUTPUT = PARTICLE_FIELD_COLOR;// TODO: check default value
const DEFAULT_SET_METHOD = Source2ParticleSetMethod.ScaleInitial;// TODO: check default value
const DEFAULT_SCALE_INITIAL_RANGE = false;// TODO: check default value

export class InitVec extends Operator {
	#setMethod = DEFAULT_SET_METHOD;
	#scaleInitialRange = DEFAULT_SCALE_INITIAL_RANGE;
	#fieldOutput = DEFAULT_FIELD_OUTPUT;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_InputValue':
				// used in doInit
				break;
			case 'm_nOutputField':// TODO: mutualize
				this.#fieldOutput = param.getValueAsNumber() ?? DEFAULT_FIELD_OUTPUT;
				break;
			case 'm_nSetMethod':// TODO: mutualize
				this.#setMethod = stringToSetMethod(param.getValueAsString()) ?? DEFAULT_SET_METHOD;;
				break;
			case 'm_bScaleInitialRange':
				this.#scaleInitialRange = param.getValueAsBool() ?? DEFAULT_SCALE_INITIAL_RANGE;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle: Source2Particle): void {
		const inputValue = this.getParamVectorValue(initVecTempVec4, 'm_InputValue', particle) ?? DEFAULT_INPUT_VALUE;

		particle.setField(this.#fieldOutput, inputValue, this.#scaleInitialRange || this.#setMethod == Source2ParticleSetMethod.ScaleInitial);
	}
}
RegisterSource2ParticleOperator('C_INIT_InitVec', InitVec);
