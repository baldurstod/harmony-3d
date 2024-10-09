import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_FLOAT } from '../../constants';
import { SourceEngineMaterial } from '../../../materials/sourceenginematerial';
export class LifetimeFromSequence extends SourceEngineParticleOperator {
	static functionName = 'Lifetime From Sequence';
	constructor() {
		super();
		this.addParam('Frames Per Second', PARAM_TYPE_FLOAT, 30);
	}

	doInit(particle, elapsedTime) {
		const paramFramesPerSecond = this.getParameter('Frames Per Second');

		if (this.particleSystem.material) {
			const frameSpan = (this.particleSystem.material as SourceEngineMaterial).getFrameSpan(particle.sequence);
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
