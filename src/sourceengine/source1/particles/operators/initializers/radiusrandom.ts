import { PARAM_TYPE_FLOAT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

export class RadiusRandom extends Source1ParticleOperator {
	static functionName = 'Radius Random';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('radius_min', PARAM_TYPE_FLOAT, 1);
		this.addParam('radius_max', PARAM_TYPE_FLOAT, 1);
	}

	doInit(particle: Source1Particle, elapsedTime: number): void {
		const radius_min = this.getParameter('radius_min') ?? 1;
		const radius_max = this.getParameter('radius_max') ?? 1;
		const radius = (radius_max - radius_min) * Math.random() + radius_min;
		particle.setInitialRadius(radius);
	}
}
Source1ParticleOperators.registerOperator(RadiusRandom);
