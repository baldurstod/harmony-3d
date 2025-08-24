import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';

export class LifespanDecay extends SourceEngineParticleOperator {
	static functionName = 'Lifespan Decay';

	doOperate(particle, elapsedTime) {
		if (particle.timeToLive < particle.currentTime) {
			particle.die();
		}
	}
}
SourceEngineParticleOperators.registerOperator(LifespanDecay);
