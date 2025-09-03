import { PARAM_TYPE_FLOAT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

export class RotationSpinYaw extends Source1ParticleOperator {
	static functionName = 'Rotation Spin Yaw';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('yaw_rate_degrees', PARAM_TYPE_FLOAT, 0);
	}

	doOperate(particle: Source1Particle, elapsedTime: number) {
		const yaw_rate_degrees = this.getParameter('yaw_rate_degrees');
		particle.rotationYaw += yaw_rate_degrees * elapsedTime;//TODO
	}
}
Source1ParticleOperators.registerOperator(RotationSpinYaw);
