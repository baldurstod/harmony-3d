import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class CreateFromParentParticles extends Operator {
	velocityScale = 0;
	increment = 1;
	randomDistribution = false;
	randomSeed = 0;
	subFrame = true;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flVelocityScale':
				this.velocityScale = value;
				break;
			case 'm_flIncrement':
				this.increment = value;
				break;
			case 'm_bRandomDistribution':
				this.randomDistribution = value;
				break;
			case 'm_nRandomSeed':
				this.randomSeed = Number(value);
				break;
			case 'm_bSubFrame':
				this.subFrame = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		const parent = this.system.parentSystem;
		if (parent == null) {
			return;
		}
		const base = parent.getParticle(0/*TODO: particle index*/);
		if (base == null) {
			particle.die();
			return;
		}

		base.getWorldPos(particle.position);
		base.getLocalPos(particle.position);
		vec3.copy(particle.prevPosition, particle.position);

		particle.PositionFromParentParticles = true;
		//TODO: fix this operator
	}
}
RegisterSource2ParticleOperator('C_INIT_CreateFromParentParticles', CreateFromParentParticles);
