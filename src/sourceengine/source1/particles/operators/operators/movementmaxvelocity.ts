import { vec3 } from 'gl-matrix';
import { PARAM_TYPE_FLOAT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

const tempVec3 = vec3.create();

export class MovementMaxVelocity extends Source1ParticleOperator {
	static functionName = 'Movement Max Velocity';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('Maximum Velocity', PARAM_TYPE_FLOAT, 0);
	}

	doOperate(particle: Source1Particle, elapsedTime: number) {
		const maxVelocity = this.getParameter('Maximum Velocity');

		const velocity = vec3.sub(tempVec3, particle.position, particle.prevPosition);
		let speed = vec3.length(velocity);

		vec3.normalize(velocity, velocity);

		const maxVelocityNormalized = maxVelocity * elapsedTime;
		speed = Math.min(maxVelocityNormalized, speed);
		vec3.scaleAndAdd(particle.position, particle.prevPosition, velocity, speed);
	}
}
Source1ParticleOperators.registerOperator(MovementMaxVelocity);
