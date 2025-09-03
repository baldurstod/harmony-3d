import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../source1particleoperators';
import { SourceEngineParticleOperator } from '../operator';

export class LifespanDecay extends SourceEngineParticleOperator {
	static functionName = 'Lifespan Decay';

	doOperate(particle: SourceEngineParticle, elapsedTime: number) {
		if (particle.timeToLive < particle.currentTime) {
			particle.die();
		}
	}
}
SourceEngineParticleOperators.registerOperator(LifespanDecay);
