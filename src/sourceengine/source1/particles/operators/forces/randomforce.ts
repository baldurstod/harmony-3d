import { vec3 } from 'gl-matrix';
import { vec3RandomBox } from '../../../../../math/functions';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_VECTOR } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../source1particleoperators';
import { SourceEngineParticleSystem } from '../../source1particlesystem';
import { SourceEngineParticleOperator } from '../operator';

export class RandomForce extends SourceEngineParticleOperator {
	static functionName = 'random force';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('min force', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('max force', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('amount of force', PARAM_TYPE_FLOAT, 0);
	}

	doForce(particle: SourceEngineParticle, elapsedTime: number, accumulatedForces: vec3, strength = 1) {
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
