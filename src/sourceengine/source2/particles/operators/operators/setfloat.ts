import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class SetFloat extends Operator {
	normalizePerLiving = true;
	outputField = PARTICLE_FIELD_RADIUS;
	setMethod = 'PARTICLE_SET_VALUE';

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_InputValue':
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
		const value = this.getParamScalarValue('m_InputValue', particle);
		//TODO: use setMethod
		particle.setField(this.outputField, value, this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
		//particle.setField(this.outputField, value, this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
	}
}
RegisterSource2ParticleOperator('C_OP_SetFloat', SetFloat);
