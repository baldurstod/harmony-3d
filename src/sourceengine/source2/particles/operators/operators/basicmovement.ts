import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { ExponentialDecay } from '../../../../../math/functions';

export class BasicMovement extends Operator {
	gravity = vec3.create();
	drag = 0;
	maxConstraintPasses = 3;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_Gravity':
				vec3.copy(this.gravity, value);
				break;
			case 'm_fDrag':
				this.drag = value;
				break;
			case 'm_nMaxConstraintPasses':
				this.maxConstraintPasses = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		/*if (particle.id == 5) {
			console.error(particle.prevPosition, particle.position);
		}*/
		let adj_dt = (elapsedTime / this.system.previousElapsedTime) * ExponentialDecay((1.0 - Math.max(0.0, this.drag)), (1.0 / 30.0), elapsedTime);

		const accumulatedForces = vec3.clone(this.gravity);
		for (let force of this.system.forces.values()) {
			force.forceParticle(particle, elapsedTime, accumulatedForces);
		}

		const accFactor = vec3.scale(vec3.create(), accumulatedForces, elapsedTime * elapsedTime);

		let vecTemp = vec3.sub(vec3.create(), particle.position, particle.prevPosition);
		vec3.scale(vecTemp, vecTemp, adj_dt);

		vec3.add(vecTemp, vecTemp, accFactor);
		vec3.copy(particle.prevPosition, particle.position);
		vec3.add(particle.position, particle.position, vecTemp);

		this.system.stepConstraints(particle);
	}
}
RegisterSource2ParticleOperator('C_OP_BasicMovement', BasicMovement);
