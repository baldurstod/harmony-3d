import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';

export class SetFloat extends Operator {
	normalizePerLiving = true;
	outputField = PARTICLE_FIELD_RADIUS;
	setMethod = 'PARTICLE_SET_VALUE';

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_InputValue':
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
		const value = this.getParamScalarValue('m_InputValue', particle);
		//TODO: use setMethod
		particle.setField(this.outputField, value, this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
		//particle.setField(this.outputField, value, this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
	}
}
RegisterSource2ParticleOperator('C_OP_SetFloat', SetFloat);
