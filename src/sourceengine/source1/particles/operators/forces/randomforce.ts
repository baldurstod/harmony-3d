import { vec3 } from 'gl-matrix';

import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator.js';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_VECTOR } from '../../constants.js';
import { vec3RandomBox } from '../../../../../math/functions';

export class RandomForce extends SourceEngineParticleOperator {
	static functionName = 'random force';
	constructor() {
		super();
		this.addParam('min force', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('max force', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('amount of force', PARAM_TYPE_FLOAT, 0);
	}

	doForce(particle, elapsedTime, accumulatedForces) {
		const minForce = this.getParameter('min force') || vec3.create();
		const maxForce = this.getParameter('max force') || vec3.create();

		const f = vec3RandomBox(vec3.create(), minForce, maxForce);
		/*if (elapsedTime) {
			vec3.scale(f, f , 1 / elapsedTime);
		}*/
		vec3.add(accumulatedForces, accumulatedForces, f);
	}
}
SourceEngineParticleOperators.registerOperator(RandomForce);
