import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2ParticleSetMethod } from '../../enums';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class SetFloat extends Operator {
	#normalizePerLiving = true;
	outputField = PARTICLE_FIELD_RADIUS;//TODO: not sure about the default field

	override _paramChanged(paramName: string, param: OperatorParam): void {
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

	override doOperate(particle: Source2Particle): void {
		//TODO: use lerp
		const value = this.getParamScalarValue('m_InputValue', particle);
		//TODO: use setMethod
		particle.setField(this.outputField, value, this.setMethod == Source2ParticleSetMethod.ScaleInitial);
		//particle.setField(this.outputField, value, this.setMethod == Source2ParticleSetMethod.ScaleInitial);
	}
}
RegisterSource2ParticleOperator('C_OP_SetFloat', SetFloat);
