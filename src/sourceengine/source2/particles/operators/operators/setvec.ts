import { vec4 } from 'gl-matrix';
import { PARTICLE_FIELD_COLOR } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_VECTOR_VALUE = vec4.create();
const setVecTempVec4 = vec4.create();

const DEFAULT_OUTPUT_FIELD = PARTICLE_FIELD_COLOR;// TODO: check default value
const DEFAULT_SET_METHOD = 'PARTICLE_SET_VALUE';// TODO: check default value

export class SetVec extends Operator {
	#outputField = DEFAULT_OUTPUT_FIELD;
	#setMethod = DEFAULT_SET_METHOD;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_InputValue':
			case 'm_Lerp':
				// used in doOperate
				break;
			case 'm_nOutputField':
				console.error('do this param', paramName, param, this.constructor.name);
				this.#outputField = (param);
				break;
			case 'm_nSetMethod':
				this.#setMethod = param.getValueAsString() ?? DEFAULT_SET_METHOD;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: use lerp
		const inputValue = this.getParamVectorValue(setVecTempVec4, 'm_InputValue', particle) ?? DEFAULT_VECTOR_VALUE;
		const lerp = this.getParamScalarValue('m_Lerp', particle) ?? 1;

		particle.setField(this.#outputField, inputValue, this.#setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
	}
}
RegisterSource2ParticleOperator('C_OP_SetVec', SetVec);
