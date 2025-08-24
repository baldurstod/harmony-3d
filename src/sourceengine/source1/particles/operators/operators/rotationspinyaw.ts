import { PARAM_TYPE_FLOAT } from '../../constants';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

export class RotationSpinYaw extends SourceEngineParticleOperator {
	static functionName = 'Rotation Spin Yaw';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('yaw_rate_degrees', PARAM_TYPE_FLOAT, 0);
	}

	doOperate(particle, elapsedTime) {
		const yaw_rate_degrees = this.getParameter('yaw_rate_degrees');
		particle.rotationYaw += yaw_rate_degrees * elapsedTime;//TODO
	}
}
SourceEngineParticleOperators.registerOperator(RotationSpinYaw);
