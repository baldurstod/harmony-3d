import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleOperator } from '../operator';

export class LifespanDecay extends Source1ParticleOperator {
	static functionName = 'Lifespan Decay';

	doOperate(particle: Source1Particle, elapsedTime: number) {
		if (particle.timeToLive < particle.currentTime) {
			particle.die();
		}
	}
}
Source1ParticleOperators.registerOperator(LifespanDecay);
