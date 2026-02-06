import { vec3 } from 'gl-matrix';
import { ExponentialDecay } from '../../../../../math/functions';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2Particle } from '../../source2particle';

const DEFAULT_MAX_CONSTRAINTS_PASSES = 3;

//const basicMovementGravity = vec3.create();

export class BasicMovement extends Operator {
	#gravity = vec3.create();
	#drag = 0;
	#maxConstraintPasses = DEFAULT_MAX_CONSTRAINTS_PASSES;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_Gravity':
				param.getValueAsVec3(this.#gravity);//TODO: default gravity ?
				break;
			case 'm_fDrag':
				this.#drag = param.getValueAsNumber() ?? 0;
				break;
			case 'm_nMaxConstraintPasses':
				this.#maxConstraintPasses = param.getValueAsNumber() ?? DEFAULT_MAX_CONSTRAINTS_PASSES;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(particle: Source2Particle, elapsedTime: number): void {
		/*if (particle.id == 5) {
			console.error(particle.prevPosition, particle.position);
		}*/
		const adj_dt = (elapsedTime / this.system.previousElapsedTime) * ExponentialDecay((1.0 - Math.max(0.0, this.#drag)), (1.0 / 30.0), elapsedTime);

		const accumulatedForces = vec3.clone(this.#gravity);
		for (const force of this.system.forces.values()) {
			force.forceParticle(particle, elapsedTime, accumulatedForces);
		}

		const accFactor = vec3.scale(vec3.create(), accumulatedForces, elapsedTime * elapsedTime);

		const vecTemp = vec3.sub(vec3.create(), particle.position, particle.prevPosition);
		vec3.scale(vecTemp, vecTemp, adj_dt);

		vec3.add(vecTemp, vecTemp, accFactor);
		vec3.copy(particle.prevPosition, particle.position);
		vec3.add(particle.position, particle.position, vecTemp);

		this.system.stepConstraints(particle);
	}
}
RegisterSource2ParticleOperator('C_OP_BasicMovement', BasicMovement);
