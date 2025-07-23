import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class InheritFromParentParticles extends Operator {
	scale = 1;
	#fieldOutput = PARTICLE_FIELD_RADIUS;
	increment = 1;
	randomDistribution = false;
	randomSeed = 0;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flScale':
				this.scale = param;
				break;
			case 'm_nIncrement':
				this.increment = (param);
				break;
			case 'm_bRandomDistribution':
				this.randomDistribution = param;
				break;
			case 'm_nRandomSeed':
				this.randomSeed = (param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime) {
		//TODO: use m_flScale m_nIncrement m_bRandomDistribution m_nRandomSeed
		const parentSystem = this.system.parentSystem;
		if (parentSystem) {
			const parentParticle = parentSystem.getParticle(particle.id - 1);
			if (parentParticle) {
				particle.setField(this.#fieldOutput, parentParticle.getField(this.#fieldOutput));
			}
		}
	}
}
RegisterSource2ParticleOperator('C_INIT_InheritFromParentParticles', InheritFromParentParticles);
