import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_SCALE = 1;// TODO: check default value
const DEFAULT_FIELD_OUTPUT = PARTICLE_FIELD_RADIUS;// TODO: check default value
const DEFAULT_INCREMENT = 1;// TODO: check default value
const DEFAULT_RANDOM_DISTRIBUTION = false;// TODO: check default value
const DEFAULT_RANDOM_SEED = 0;// TODO: check default value

export class InheritFromParentParticles extends Operator {
	#scale = DEFAULT_SCALE;
	#fieldOutput = DEFAULT_FIELD_OUTPUT;
	#increment = DEFAULT_INCREMENT;
	#randomDistribution = false;
	#randomSeed = 0;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flScale':
				this.#scale = param.getValueAsNumber() ?? DEFAULT_SCALE;
				break;
			case 'm_nIncrement':
				console.error('do this param', paramName, param);
				this.#increment = (param);
				break;
			case 'm_bRandomDistribution':
				console.error('do this param', paramName, param);
				this.#randomDistribution = param;
				break;
			case 'm_nRandomSeed':
				console.error('do this param', paramName, param);
				this.#randomSeed = (param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
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
