import { vec3 } from 'gl-matrix';

import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';

export class PositionFromParentParticles extends SourceEngineParticleOperator {
	static functionName = 'Position From Parent Particles';
	constructor() {
		super();
	}

	doInit(particle, elapsedTime) {
		const parent = this.particleSystem.parentSystem;
		if (parent == null) {
			return;
		}
		const base = parent.getParticle();
		if (base != null) {
			/*particle.timeToLive = 0;
			particle.die();
			return;*/
			base.getWorldPos(particle.position);
			base.getLocalPos(particle.position);
			vec3.copy(particle.prevPosition, particle.position);
		} else {
			particle.die();
		}

		particle.PositionFromParentParticles =true;
	}
}
SourceEngineParticleOperators.registerOperator(PositionFromParentParticles);
