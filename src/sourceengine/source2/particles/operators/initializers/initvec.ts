import { vec3, vec4 } from 'gl-matrix';
import { PARTICLE_FIELD_COLOR } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_INPUT_VALUE = vec3.create();
const v = vec4.create();

export class InitVec extends Operator {
	setMethod = null;
	scaleInitialRange = false;
	#fieldOutput = PARTICLE_FIELD_COLOR;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_InputValue':
				break;
			case 'm_nOutputField':
				this.#fieldOutput = (param);
				break;
			case 'm_nSetMethod':
				this.setMethod = param;
				break;
			case 'm_bScaleInitialRange':
				this.scaleInitialRange = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime) {
		const inputValue = this.getParamVectorValue('m_InputValue', particle, v) ?? DEFAULT_INPUT_VALUE;

		particle.setField(this.#fieldOutput, inputValue, this.scaleInitialRange || this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
	}
}
RegisterSource2ParticleOperator('C_INIT_InitVec', InitVec);
