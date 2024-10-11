import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_RADIUS, ATTRIBUTES_WHICH_ARE_ANGLES } from '../../../../common/particles/particlefields';

export class InitFloat extends Operator {
	setMethod = null;
	constructor(system) {
		super(system);
		this.fieldOutput = PARTICLE_FIELD_RADIUS;
	}

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
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		let value = this.getParamScalarValue('m_InputValue', particle);
		//TODO: use setMethod
		particle.setField(this.fieldOutput, value, this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE', true);

	//setField(field = 0, value, mulInitial = false, setInitial = false, additive = false) {
	}
}
RegisterSource2ParticleOperator('C_INIT_InitFloat', InitFloat);
