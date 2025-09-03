import { PARAM_TYPE_FLOAT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

export class LifetimeFromSequence extends Source1ParticleOperator {
	static functionName = 'Lifetime From Sequence';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('Frames Per Second', PARAM_TYPE_FLOAT, 30);
	}

	doInit(particle: Source1Particle, elapsedTime: number): void {
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
Source1ParticleOperators.registerOperator(LifetimeFromSequence);
