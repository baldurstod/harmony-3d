import { vec3, vec4 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_COLOR } from '../../../../common/particles/particlefields';

const DEFAULT_INPUT_VALUE = vec3.create();
const v = vec4.create();

export class InitVec extends Operator {
	setMethod = null;
	scaleInitialRange = false;
	fieldOutput = PARTICLE_FIELD_COLOR;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_InputValue':
				break;
			case 'm_nOutputField':
				this.fieldOutput = Number(value);
				break;
			case 'm_nSetMethod':
				this.setMethod = value;
				break;
			case 'm_bScaleInitialRange':
				this.scaleInitialRange = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		const inputValue = this.getParamVectorValue('m_InputValue', particle, v) ?? DEFAULT_INPUT_VALUE;

		particle.setField(this.fieldOutput, inputValue, this.scaleInitialRange || this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
	}
}
RegisterSource2ParticleOperator('C_INIT_InitVec', InitVec);
