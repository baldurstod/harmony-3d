import { PARAM_TYPE_FLOAT } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../source1particleoperators';
import { SourceEngineParticleSystem } from '../../source1particlesystem';
import { SourceEngineParticleOperator } from '../operator';

export class RotationSpinYaw extends SourceEngineParticleOperator {
	static functionName = 'Rotation Spin Yaw';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('yaw_rate_degrees', PARAM_TYPE_FLOAT, 0);
	}

	doOperate(particle: SourceEngineParticle, elapsedTime: number) {
		const yaw_rate_degrees = this.getParameter('yaw_rate_degrees');
		particle.rotationYaw += yaw_rate_degrees * elapsedTime;//TODO
	}
}
SourceEngineParticleOperators.registerOperator(RotationSpinYaw);
