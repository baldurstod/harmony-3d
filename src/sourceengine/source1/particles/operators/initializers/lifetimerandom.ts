import { RandomFloatExp } from '../../../../../math/functions';
import { PARAM_TYPE_FLOAT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

export class LifetimeRandom extends Source1ParticleOperator {
	static functionName = 'Lifetime Random';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('lifetime_min', PARAM_TYPE_FLOAT, 0);
		this.addParam('lifetime_max', PARAM_TYPE_FLOAT, 0);
		this.addParam('lifetime_random_exponent', PARAM_TYPE_FLOAT, 1);
	}

	doInit(particle: Source1Particle, elapsedTime: number): void {
		const lifetime_min = this.getParameter('lifetime_min');
		const lifetime_max = this.getParameter('lifetime_max');
		const lifetime_random_exponent = this.getParameter('lifetime_random_exponent');

		//const lifetime = (lifetime_max - lifetime_min) * Math.random() + lifetime_min;
		particle.setInitialTTL(RandomFloatExp(lifetime_min, lifetime_max, lifetime_random_exponent));
	}
}
Source1ParticleOperators.registerOperator(LifetimeRandom);
