import { vec3 } from 'gl-matrix';

import { PARTICLE_FIELD_POSITION, PARTICLE_FIELD_POSITION_PREVIOUS } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const v = vec3.create();

export class SetRigidAttachment extends Operator {
	localSpace = true;
	#fieldOutput = PARTICLE_FIELD_POSITION_PREVIOUS;
	fieldInput = PARTICLE_FIELD_POSITION;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_bLocalSpace':
				this.localSpace = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime) {
		//TODO : use m_bLocalSpace
		if (!this.localSpace) {
			throw 'code me';
		}
		vec3.sub(v, particle.getField(this.fieldInput), this.system.getControlPoint(this.controlPointNumber).currentWorldPosition);
		particle.setField(this.#fieldOutput, v);
	}
}
RegisterSource2ParticleOperator('C_INIT_SetRigidAttachment', SetRigidAttachment);
