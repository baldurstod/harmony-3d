import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_POSITION, PARTICLE_FIELD_COLOR } from '../../../../common/particles/particlefields';
import { vec3RandomBox } from '../../../../../math/functions';
import { ONE_EPS } from '../../../../../math/constants';

let v = vec3.create();

export class OffsetVectorToVector extends Operator {
	outputMin = vec3.create();
	outputMax = vec3.fromValues(1, 1, 1);
	fieldOutput = PARTICLE_FIELD_POSITION;
	fieldInput = PARTICLE_FIELD_POSITION;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_vecOutputMin':
				vec3.copy(this.outputMin, value);
				break;
			case 'm_vecOutputMax':
				vec3.copy(this.outputMax, value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		vec3RandomBox(v, this.outputMin, this.outputMax);
		vec3.add(v, v, particle.getField(this.fieldInput));
		if (this.fieldOutput == PARTICLE_FIELD_COLOR) {
			v[0] = ((v[0] % ONE_EPS) + ONE_EPS) % ONE_EPS;
			v[1] = ((v[1] % ONE_EPS) + ONE_EPS) % ONE_EPS;
			v[2] = ((v[2] % ONE_EPS) + ONE_EPS) % ONE_EPS;
		}
		particle.setField(this.fieldOutput, v);
	}
}
RegisterSource2ParticleOperator('C_INIT_OffsetVectorToVector', OffsetVectorToVector);
