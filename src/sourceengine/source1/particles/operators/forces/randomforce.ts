import { vec3 } from 'gl-matrix';
import { vec3RandomBox } from '../../../../../math/functions';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_VECTOR } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

export class RandomForce extends Source1ParticleOperator {
	static functionName = 'random force';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('min force', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('max force', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('amount of force', PARAM_TYPE_FLOAT, 0);
	}

	doForce(particle: Source1Particle, elapsedTime: number, accumulatedForces: vec3, strength = 1) {
		const minForce = this.getParameter('min force') || vec3.create();
		const maxForce = this.getParameter('max force') || vec3.create();

		const f = vec3RandomBox(vec3.create(), minForce, maxForce);
		/*if (elapsedTime) {
			vec3.scale(f, f , 1 / elapsedTime);
		}*/
		vec3.add(accumulatedForces, accumulatedForces, f);
	}
}
Source1ParticleOperators.registerOperator(RandomForce);
