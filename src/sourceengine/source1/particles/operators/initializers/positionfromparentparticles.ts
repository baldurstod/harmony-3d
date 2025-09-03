import { vec3 } from 'gl-matrix';
import { CDmxAttributeValue } from '../../../export';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleOperator } from '../operator';

const positionFromParentParticlesTempVec3_0 = vec3.create();
const positionFromParentParticlesTempVec3_1 = vec3.create();

const DEFAULT_VELOCITY_SCALE = 0;/* TODO: check default value*/

export class PositionFromParentParticles extends Source1ParticleOperator {
	static functionName = 'Position From Parent Particles';
	#velocitySCale = DEFAULT_VELOCITY_SCALE;

	paramChanged(name: string, param: CDmxAttributeValue | CDmxAttributeValue[]) {
		switch (name) {
			case 'Inherited Velocity Scale':
				this.#velocitySCale = param as number;//TODO: convert to number
				break;
			default:
				super.paramChanged(name, param);
				break;
		}
	}

	doInit(particle: Source1Particle, elapsedTime: number): void {
		const parent = this.particleSystem.parentSystem;
		if (!parent) {
			vec3.zero(particle.position);
			vec3.zero(particle.prevPosition);
			return;
		}

		const particleCount = parent.getActiveParticlesCount();
		if (particleCount == 0) {
			particle.die();
		}

		const base = parent.getParticle();
		if (base != null) {
			/*particle.timeToLive = 0;
			particle.die();
			return;*/
			//TODO: do subframe
			//base.getWorldPos(particle.position);
			base.getLocalPos(particle.position);
			vec3.lerp(particle.prevPosition, base.position, base.prevPosition, this.#velocitySCale);
			//vec3.copy(particle.prevPosition, particle.position);
		} else {
			particle.die();
		}

		particle.PositionFromParentParticles = true;
	}
}
Source1ParticleOperators.registerOperator(PositionFromParentParticles);
