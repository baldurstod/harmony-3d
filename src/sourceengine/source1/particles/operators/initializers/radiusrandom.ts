import { PARAM_TYPE_FLOAT } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

export class RadiusRandom extends SourceEngineParticleOperator {
	static functionName = 'Radius Random';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('radius_min', PARAM_TYPE_FLOAT, 1);
		this.addParam('radius_max', PARAM_TYPE_FLOAT, 1);
	}

	doInit(particle: SourceEngineParticle, elapsedTime: number): void {
		const radius_min = this.getParameter('radius_min') ?? 1;
		const radius_max = this.getParameter('radius_max') ?? 1;
		const radius = (radius_max - radius_min) * Math.random() + radius_min;
		particle.setInitialRadius(radius);
	}
}
SourceEngineParticleOperators.registerOperator(RadiusRandom);
