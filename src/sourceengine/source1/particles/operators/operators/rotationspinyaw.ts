import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_INT, PARAM_TYPE_FLOAT } from '../../constants';

export class RotationSpinYaw extends SourceEngineParticleOperator {
	static functionName = 'Rotation Spin Yaw';
	constructor() {
		super();
		this.addParam('yaw_rate_degrees', PARAM_TYPE_FLOAT, 0);
	}

	doOperate(particle, elapsedTime) {
		const yaw_rate_degrees = this.getParameter('yaw_rate_degrees');
		particle.rotationYaw += yaw_rate_degrees * elapsedTime;//TODO
	}
}
SourceEngineParticleOperators.registerOperator(RotationSpinYaw);
