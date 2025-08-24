import { vec3 } from 'gl-matrix';
import { PARAM_TYPE_FLOAT } from '../../constants';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

const tempVec3 = vec3.create();

export class MovementMaxVelocity extends SourceEngineParticleOperator {
	static functionName = 'Movement Max Velocity';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('Maximum Velocity', PARAM_TYPE_FLOAT, 0);
	}

	doOperate(particle, elapsedTime) {
		const maxVelocity = this.getParameter('Maximum Velocity');

		const velocity = vec3.sub(tempVec3, particle.position, particle.prevPosition);
		let speed = vec3.length(velocity);

		vec3.normalize(velocity, velocity);

		const maxVelocityNormalized = maxVelocity * elapsedTime;
		speed = Math.min(maxVelocityNormalized, speed);
		vec3.scaleAndAdd(particle.position, particle.prevPosition, velocity, speed);
	}
}
SourceEngineParticleOperators.registerOperator(MovementMaxVelocity);
