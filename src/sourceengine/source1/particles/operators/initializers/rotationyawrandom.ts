import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_FLOAT } from '../../constants';

export class RotationYawRandom extends SourceEngineParticleOperator {
	static functionName = 'Rotation Yaw Random';
	constructor() {
		super();
		this.addParam('Percentage', PARAM_TYPE_FLOAT, 0.5);
		this.addParam('yaw_offset_min', PARAM_TYPE_FLOAT, 0);
		this.addParam('yaw_offset_max', PARAM_TYPE_FLOAT, 360);
	}

	doInit(particle, elapsedTime) {
		const percent = this.getParameter('Percentage') ?? 0.5;//TODO
		const yaw_offset_min = this.getParameter('yaw_offset_min') ?? 0;
		const yaw_offset_max = this.getParameter('yaw_offset_max') ?? 360;
		const yaw_initial = this.getParameter('yaw_initial') ?? 0;

		particle.rotationYaw = yaw_initial + (yaw_offset_max - yaw_offset_min) * Math.random() + yaw_offset_min;
	}
}
SourceEngineParticleOperators.registerOperator(RotationYawRandom);
