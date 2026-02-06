import { vec3 } from 'gl-matrix';
import { isVectorField, PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_SCALE = 1;// TODO: check default value
const DEFAULT_FIELD_OUTPUT = PARTICLE_FIELD_RADIUS;// TODO: check default value
const DEFAULT_INCREMENT = 1;// TODO: check default value
const DEFAULT_RANDOM_DISTRIBUTION = false;// TODO: check default value
const DEFAULT_RANDOM_SEED = 0;// TODO: check default value

const tempVectorField = vec3.create();

export class InheritFromParentParticles extends Operator {
	#scale = DEFAULT_SCALE;
	#fieldOutput = DEFAULT_FIELD_OUTPUT;
	#increment = DEFAULT_INCREMENT;
	#randomDistribution = false;
	#randomSeed = 0;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flScale':
				this.#scale = param.getValueAsNumber() ?? DEFAULT_SCALE;
				break;
			case 'm_nIncrement':
				this.#increment = param.getValueAsNumber() ?? DEFAULT_INCREMENT;
				break;
			case 'm_bRandomDistribution':
				this.#randomDistribution = param.getValueAsBool() ?? DEFAULT_RANDOM_DISTRIBUTION;
				break;
			case 'm_nRandomSeed':
				this.#randomSeed = param.getValueAsNumber() ?? DEFAULT_RANDOM_SEED;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle: Source2Particle): void {
		//TODO: use m_flScale m_nIncrement m_bRandomDistribution m_nRandomSeed
		const parentSystem = this.system.parentSystem;
		if (parentSystem) {
			const parentParticle = parentSystem.getParticle(particle.id - 1);
			if (parentParticle) {
				if (isVectorField(this.#fieldOutput)) {
					particle.setField(this.#fieldOutput, parentParticle.getVectorField(tempVectorField, this.#fieldOutput));
				} else {
					particle.setField(this.#fieldOutput, parentParticle.getScalarField(this.#fieldOutput));

				}
			}
		}
	}
}
RegisterSource2ParticleOperator('C_INIT_InheritFromParentParticles', InheritFromParentParticles);
