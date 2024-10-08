import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_FLOAT } from '../../constants';
export class RotationYawFlipRandom extends SourceEngineParticleOperator {
	static functionName = 'Rotation Yaw Flip Random';
	constructor() {
		super();
		this.addParam('Flip Percentage', PARAM_TYPE_FLOAT, 0.5);
	//DMXELEMENT_UNPACK_FIELD('Flip Percentage', '.5', float, m_flPercent)
	}

	doInit(particle, elapsedTime) {
		const flip_percent = this.getParameter('Flip Percentage') || 0.5;
		particle.rotationYaw += (Math.random() < flip_percent) ? 180 : 0;
	}

	initMultipleOverride() {
		return true;
	}
}
SourceEngineParticleOperators.registerOperator(RotationYawFlipRandom);
