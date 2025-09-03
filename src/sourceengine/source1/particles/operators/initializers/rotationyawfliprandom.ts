import { PARAM_TYPE_FLOAT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

export class RotationYawFlipRandom extends Source1ParticleOperator {
	static functionName = 'Rotation Yaw Flip Random';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('Flip Percentage', PARAM_TYPE_FLOAT, 0.5);
		//DMXELEMENT_UNPACK_FIELD('Flip Percentage', '.5', float, m_flPercent)
	}

	doInit(particle: Source1Particle, elapsedTime: number): void {
		const flip_percent = this.getParameter('Flip Percentage') || 0.5;
		particle.rotationYaw += (Math.random() < flip_percent) ? 180 : 0;
	}

	initMultipleOverride() {
		return true;
	}
}
Source1ParticleOperators.registerOperator(RotationYawFlipRandom);
