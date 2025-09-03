import { PARAM_TYPE_FLOAT } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../source1particleoperators';
import { SourceEngineParticleSystem } from '../../source1particlesystem';
import { SourceEngineParticleOperator } from '../operator';

export class RotationYawFlipRandom extends SourceEngineParticleOperator {
	static functionName = 'Rotation Yaw Flip Random';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('Flip Percentage', PARAM_TYPE_FLOAT, 0.5);
		//DMXELEMENT_UNPACK_FIELD('Flip Percentage', '.5', float, m_flPercent)
	}

	doInit(particle: SourceEngineParticle, elapsedTime: number): void {
		const flip_percent = this.getParameter('Flip Percentage') || 0.5;
		particle.rotationYaw += (Math.random() < flip_percent) ? 180 : 0;
	}

	initMultipleOverride() {
		return true;
	}
}
SourceEngineParticleOperators.registerOperator(RotationYawFlipRandom);
