import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class SetFloat extends Operator {
	#normalizePerLiving = true;
	outputField = PARTICLE_FIELD_RADIUS;//TODO: not sure about the default field

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_InputValue':
				// used in dooperate
				break;
			case 'm_nOutputField':// TODO: mutualize param ?
				this.outputField = param.getValueAsNumber() ?? PARTICLE_FIELD_RADIUS;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: use lerp
		const value = this.getParamScalarValue('m_InputValue', particle);
		//TODO: use setMethod
		particle.setField(this.outputField, value, this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
		//particle.setField(this.outputField, value, this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
	}
}
RegisterSource2ParticleOperator('C_OP_SetFloat', SetFloat);
