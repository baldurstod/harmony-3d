import { vec3 } from 'gl-matrix';
import { ExponentialDecay } from '../../../../../math/functions';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_INT, PARAM_TYPE_VECTOR } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../source1particleoperators';
import { SourceEngineParticleSystem } from '../../source1particlesystem';
import { SourceEngineParticleOperator } from '../operator';

const gravity_const = 0.5;
const tempVec3 = vec3.create();
const tempVec3_2 = vec3.create();
const tempVec3_3 = vec3.create();

export class MovementBasic extends SourceEngineParticleOperator {
	static functionName = 'Movement Basic';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('drag', PARAM_TYPE_FLOAT, 0);
		this.addParam('gravity', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('max constraint passes', PARAM_TYPE_INT, 3);
	}

	doOperate(particle: SourceEngineParticle, elapsedTime: number) {
		const drag = this.getParameter('drag');
		const gravity = this.getParameter('gravity');
		const maxConstraintPasses = this.getParameter('max constraint passes');//TODO

		//ReplicateX4((pParticles->m_flDt / pParticles->m_flPreviousDt) * ExponentialDecay((1.0f-max(0.0,m_fDrag)), (1.0f/30.0f), pParticles->m_flDt));
		//fltx4 adj_dt = ReplicateX4((pParticles->m_flDt / pParticles->m_flPreviousDt) * ExponentialDecay((1.0f-max(0.0,m_fDrag)), (1.0f/30.0f), pParticles->m_flDt));
		const adj_dt = (elapsedTime / this.particleSystem.previousElapsedTime) * ExponentialDecay((1.0 - Math.max(0.0, drag)), (1.0 / 30.0), elapsedTime);
		/*if (particle.previousElapsedTime) {
			adj_dt *= (elapsedTime / particle.previousElapsedTime);
		}
		particle.previousElapsedTime = elapsedTime;*/

		const accumulatedForces = vec3.copy(tempVec3, gravity);
		//vec3.scale(accumulatedForces, accumulatedForces, 0.5);
		/*if (elapsedTime) {
			vec3.scale(accumulatedForces, accumulatedForces, 1/elapsedTime);
		}*/
		for (const force of this.particleSystem.forces.values()) {
			//const force = this.particleSystem.forces[j];
			force.forceParticle(particle, elapsedTime, accumulatedForces);
		}

		//elapsedTime *= 0.001;
		const accFactor = vec3.scale(tempVec3_2, accumulatedForces, elapsedTime * elapsedTime);

		const vecTemp = vec3.sub(tempVec3_3, particle.position, particle.prevPosition);
		vec3.scale(vecTemp, vecTemp, adj_dt);

		vec3.add(vecTemp, vecTemp, accFactor);
		vec3.copy(particle.prevPosition, particle.position);
		vec3.add(particle.position, particle.position, vecTemp);

		this.particleSystem.stepConstraints(particle);
	}
}
SourceEngineParticleOperators.registerOperator(MovementBasic);
SourceEngineParticleOperators.registerOperator('basic movement', MovementBasic);
