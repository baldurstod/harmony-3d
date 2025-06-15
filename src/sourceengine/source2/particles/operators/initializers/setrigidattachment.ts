import { vec3 } from 'gl-matrix';

import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_POSITION, PARTICLE_FIELD_POSITION_PREVIOUS } from '../../../../common/particles/particlefields';

const v = vec3.create();

export class SetRigidAttachment extends Operator {
	localSpace = true;
	fieldOutput = PARTICLE_FIELD_POSITION_PREVIOUS;
	fieldInput = PARTICLE_FIELD_POSITION;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_bLocalSpace':
				this.localSpace = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		//TODO : use m_bLocalSpace
		if (!this.localSpace) {
			throw 'code me';
		}
		vec3.sub(v, particle.getField(this.fieldInput), this.system.getControlPoint(this.controlPointNumber).currentWorldPosition);
		particle.setField(this.fieldOutput, v);
	}
}
RegisterSource2ParticleOperator('C_INIT_SetRigidAttachment', SetRigidAttachment);
