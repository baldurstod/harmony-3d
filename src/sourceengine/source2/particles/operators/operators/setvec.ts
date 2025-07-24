import { vec4 } from 'gl-matrix';
import { PARTICLE_FIELD_COLOR } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_VECTOR_VALUE = vec4.create();
const setVecTempVec4 = vec4.create();

export class SetVec extends Operator {
	outputField = PARTICLE_FIELD_COLOR;
	setMethod = 'PARTICLE_SET_VALUE';
	normalizePerLiving = true;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_InputValue':
			case 'm_Lerp':
				break;
			case 'm_nOutputField':
				this.outputField = (param);
				break;
			case 'm_nSetMethod':
				this.setMethod = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime) {
		//TODO: use lerp
		const inputValue = this.getParamVectorValue(setVecTempVec4, 'm_InputValue', particle) ?? DEFAULT_VECTOR_VALUE;
		const lerp = this.getParamScalarValue('m_Lerp', particle) ?? 1;

		particle.setField(this.outputField, inputValue, this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
	}
}
RegisterSource2ParticleOperator('C_OP_SetVec', SetVec);
