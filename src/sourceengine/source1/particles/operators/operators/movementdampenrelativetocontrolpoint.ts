import { vec3 } from 'gl-matrix';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_INT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

const vecControlPoint = vec3.create();
const ofs = vec3.create();
const vParticleDelta = vec3.create();
const vParticleDampened = vec3.create();
const vecParticlePosition = vec3.create();

export class Source1DampenToCP extends Source1ParticleOperator {
	static functionName = 'Movement Dampen Relative to Control Point';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('control_point_number', PARAM_TYPE_INT, 0);
		this.addParam('falloff range', PARAM_TYPE_FLOAT, 100);
		this.addParam('dampen scale', PARAM_TYPE_FLOAT, 1);
	}

	doOperate(particle: Source1Particle, elapsedTime: number): void {
		const controlPointNumber = this.getParameter('control_point_number');
		const range = this.getParameter('falloff range');
		const scale = this.getParameter('dampen scale');

		if (range <= 0) {
			return;
		}

		const controlPoint = particle.system.getControlPoint(controlPointNumber);
		if (!controlPoint) {
			return;
		}

		controlPoint.getWorldPosition(vecControlPoint);
		const offset = vec3.sub(ofs, particle.position, vecControlPoint);

		let flDampenAmount;
		let distance = vec3.len(offset);
		if (distance > range) {
			return;
		} else {
			flDampenAmount = distance / range;
			flDampenAmount = Math.pow(flDampenAmount, scale);
		}

		vec3.sub(vParticleDelta, particle.position, particle.prevPosition);
		vec3.scale(vParticleDampened, vParticleDelta, flDampenAmount);
		vec3.add(vecParticlePosition, particle.prevPosition, vParticleDampened);
		vec3.lerp(vecParticlePosition, particle.position, vecParticlePosition, this.getOperatorStrength());
		vec3.copy(particle.position, vecParticlePosition);
	}
}
Source1ParticleOperators.registerOperator(Source1DampenToCP);
