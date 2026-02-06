import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2ParticleSetMethod, stringToSetMethod } from '../../enums';
import { Source2Particle } from '../../source2particle';
import { Source2ParticleSystem } from '../../source2particlesystem';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_SET_METHOD = Source2ParticleSetMethod.ScaleInitial;// TODO: check default value

export class InitFloat extends Operator {
	#setMethod = DEFAULT_SET_METHOD;

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.fieldOutput = PARTICLE_FIELD_RADIUS;
	}

	override _paramChanged(paramName: string, param: OperatorParam): void {
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
			case 'm_nSetMethod'://TODO: mutualize
				this.#setMethod = stringToSetMethod(param.getValueAsString()) ?? DEFAULT_SET_METHOD;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle: Source2Particle): void {
		const value = this.getParamScalarValue('m_InputValue', particle);
		//TODO: use setMethod
		particle.setField(this.fieldOutput, value, this.#setMethod == Source2ParticleSetMethod.ScaleInitial, true);

		//setField(field = 0, value, mulInitial = false, setInitial = false, additive = false) {
	}
}
RegisterSource2ParticleOperator('C_INIT_InitFloat', InitFloat);
