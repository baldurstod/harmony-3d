import { vec3 } from 'gl-matrix';
import { PARTICLE_FIELD_POSITION, PARTICLE_FIELD_POSITION_PREVIOUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const v = vec3.create();

const DEFAULT_LOCAL_SPACE = true;// TODO: check default value

export class SetRigidAttachment extends Operator {
	#localSpace = DEFAULT_LOCAL_SPACE;
	#fieldOutput = PARTICLE_FIELD_POSITION_PREVIOUS;
	#fieldInput = PARTICLE_FIELD_POSITION;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_bLocalSpace':
				this.#localSpace = param.getValueAsBool() ?? DEFAULT_LOCAL_SPACE;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle: Source2Particle): void {
		//TODO : use m_bLocalSpace
		if (!this.#localSpace) {
			throw new Error('code me');
		}
		vec3.sub(v, particle.getVectorField(v, this.#fieldInput), this.system.getControlPoint(this.controlPointNumber).currentWorldPosition);
		particle.setField(this.#fieldOutput, v);
	}
}
RegisterSource2ParticleOperator('C_INIT_SetRigidAttachment', SetRigidAttachment);
