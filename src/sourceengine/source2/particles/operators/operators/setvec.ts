import { vec4 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_COLOR } from '../../../../common/particles/particlefields';

const DEFAULT_VECTOR_VALUE = vec4.create();
const vec = vec4.create();

export class SetVec extends Operator {
	outputField = PARTICLE_FIELD_COLOR;
	setMethod = 'PARTICLE_SET_VALUE';
	normalizePerLiving = true;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_InputValue':
			case 'm_Lerp':
				break;
			case 'm_nOutputField':
				this.outputField = Number(value);
				break;
			case 'm_nSetMethod':
				this.setMethod = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		//TODO: use lerp
		const inputValue = this.getParamVectorValue('m_InputValue', particle, vec) ?? DEFAULT_VECTOR_VALUE;
		const lerp = this.getParamScalarValue('m_Lerp', particle) ?? 1;

		particle.setField(this.outputField, inputValue, this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
	}
}
RegisterSource2ParticleOperator('C_OP_SetVec', SetVec);
