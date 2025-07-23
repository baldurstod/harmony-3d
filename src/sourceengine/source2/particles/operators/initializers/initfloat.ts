import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Source2ParticleSystem } from '../../source2particlesystem';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class InitFloat extends Operator {
	setMethod = null;

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.fieldOutput = PARTICLE_FIELD_RADIUS;
	}

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_InputValue':
				// Used in doInit
				break;
			/*
			case 'm_nOutputField':
				console.error('do this param', paramName, param);
				this.#fieldOutput = param.getValueAsNumber() ?? PARTICLE_FIELD_RADIUS;
				break;
			*/
			case 'm_nSetMethod':
				console.error('do this param', paramName, param);
				this.setMethod = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const value = this.getParamScalarValue('m_InputValue', particle);
		//TODO: use setMethod
		particle.setField(this.fieldOutput, value, this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE', true);

		//setField(field = 0, value, mulInitial = false, setInitial = false, additive = false) {
	}
}
RegisterSource2ParticleOperator('C_INIT_InitFloat', InitFloat);
