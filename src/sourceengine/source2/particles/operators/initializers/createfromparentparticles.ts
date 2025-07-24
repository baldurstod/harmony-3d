import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_VELOCITY_SCALE = 0;// TODO: check default value
const DEFAULT_INCREMENT = 1;// TODO: check default value
const DEFAULT_RANDOM_DISTRIBUTION = false;// TODO: check default value
const DEFAULT_RANDOM_SEED = 0;// TODO: check default value
const DEFAULT_SUB_FRAME = true;// TODO: check default value

export class CreateFromParentParticles extends Operator {
	#velocityScale = DEFAULT_VELOCITY_SCALE;
	#increment = DEFAULT_INCREMENT;
	#randomDistribution = DEFAULT_RANDOM_DISTRIBUTION;
	#randomSeed = DEFAULT_RANDOM_SEED;
	#subFrame = DEFAULT_SUB_FRAME;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flVelocityScale':
				this.#velocityScale = param.getValueAsNumber() ?? DEFAULT_VELOCITY_SCALE;
				break;
			case 'm_flIncrement':
				this.#increment = param.getValueAsNumber() ?? DEFAULT_INCREMENT;
				break;
			case 'm_bRandomDistribution':
				this.#randomDistribution = param.getValueAsBool() ?? DEFAULT_RANDOM_DISTRIBUTION;
				break;
			case 'm_nRandomSeed':
				console.error('do this param', paramName, param);
				this.#randomSeed = Number(param);
				break;
			case 'm_bSubFrame':
				this.#subFrame = param.getValueAsBool() ?? DEFAULT_SUB_FRAME;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
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
