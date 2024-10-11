import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_RADIUS, ATTRIBUTES_WHICH_ARE_ANGLES } from '../../../../common/particles/particlefields';

export class InheritFromParentParticles extends Operator {
	scale = 1;
	fieldOutput = PARTICLE_FIELD_RADIUS;
	increment = 1;
	randomDistribution = false;
	randomSeed = 0;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flScale':
				this.scale = value;
				break;
			case 'm_nIncrement':
				this.increment = Number(value);
				break;
			case 'm_bRandomDistribution':
				this.randomDistribution = value;
				break;
			case 'm_nRandomSeed':
				this.randomSeed = Number(value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		//TODO: use m_flScale m_nIncrement m_bRandomDistribution m_nRandomSeed
		let parentSystem = this.system.parentSystem;
		if (parentSystem) {
			let parentParticle = parentSystem.getParticle(particle.id - 1);
			if (parentParticle) {
				particle.setField(this.fieldOutput, parentParticle.getField(this.fieldOutput));
			}
		}
	}
}
RegisterSource2ParticleOperator('C_INIT_InheritFromParentParticles', InheritFromParentParticles);
