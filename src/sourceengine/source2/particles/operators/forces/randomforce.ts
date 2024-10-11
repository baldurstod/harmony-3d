import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { vec3RandomBox } from '../../../../../math/functions';

export class RandomForce extends Operator {
	minForce = vec3.create();
	maxForce = vec3.create();

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_MinForce':
				vec3.copy(this.minForce, value);
				break;
			case 'm_MaxForce':
				vec3.copy(this.maxForce, value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doForce(particle, elapsedTime, accumulatedForces) {
		vec3.add(accumulatedForces, accumulatedForces, vec3RandomBox(vec3.create(), this.minForce, this.maxForce));
	}
}
RegisterSource2ParticleOperator('C_OP_RandomForce', RandomForce);
