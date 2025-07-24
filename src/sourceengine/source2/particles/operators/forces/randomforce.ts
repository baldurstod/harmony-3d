import { vec3 } from 'gl-matrix';
import { vec3RandomBox } from '../../../../../math/functions';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class RandomForce extends Operator {
	#minForce = vec3.create();
	#maxForce = vec3.create();

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_MinForce':
				param.getValueAsVec3(this.#minForce);
				break;
			case 'm_MaxForce':
				param.getValueAsVec3(this.#maxForce);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doForce(particle: Source2Particle, elapsedTime: number, accumulatedForces: vec3, strength: number): void {
		vec3.add(accumulatedForces, accumulatedForces, vec3RandomBox(vec3.create(), this.#minForce, this.#maxForce));
	}
}
RegisterSource2ParticleOperator('C_OP_RandomForce', RandomForce);
