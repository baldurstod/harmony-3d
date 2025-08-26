import { PARAM_TYPE_FLOAT } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

export class LifetimeFromSequence extends SourceEngineParticleOperator {
	static functionName = 'Lifetime From Sequence';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('Frames Per Second', PARAM_TYPE_FLOAT, 30);
	}

	doInit(particle: SourceEngineParticle, elapsedTime: number): void {
		const paramFramesPerSecond = this.getParameter('Frames Per Second');

		if (this.particleSystem.material) {
			const frameSpan = this.particleSystem.material.getFrameSpan(particle.sequence);
			if (frameSpan !== null) {
				const lifetime = frameSpan / paramFramesPerSecond;
				//particle.timeToLive = lifetime;
				particle.setInitialTTL(lifetime / 2.0);
			}
		}
	}

	initMultipleOverride() {
		return true;
	}
}
SourceEngineParticleOperators.registerOperator(LifetimeFromSequence);
