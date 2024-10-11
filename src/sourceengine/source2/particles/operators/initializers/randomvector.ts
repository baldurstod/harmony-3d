import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_POSITION } from '../../../../common/particles/particlefields';
import { vec3RandomBox } from '../../../../../math/functions';

let tempVec3 = vec3.create();

export class RandomVector extends Operator {
	vecMin = vec3.create();
	vecMax = vec3.create();
	fieldOutput = PARTICLE_FIELD_POSITION;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_vecMin':
				vec3.copy(this.vecMin, value);
				break;
			case 'm_vecMax':
				vec3.copy(this.vecMax, value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		vec3RandomBox(tempVec3, this.vecMin, this.vecMax);
		particle.setField(this.fieldOutput, tempVec3);
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomVector', RandomVector);
