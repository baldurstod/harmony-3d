import { PARAM_TYPE_FLOAT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

export class RotationYawRandom extends Source1ParticleOperator {
	static functionName = 'Rotation Yaw Random';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('Percentage', PARAM_TYPE_FLOAT, 0.5);
		this.addParam('yaw_offset_min', PARAM_TYPE_FLOAT, 0);
		this.addParam('yaw_offset_max', PARAM_TYPE_FLOAT, 360);
	}

	doInit(particle: Source1Particle, elapsedTime: number): void {
		const percent = this.getParameter('Percentage') ?? 0.5;//TODO
		const yaw_offset_min = this.getParameter('yaw_offset_min') ?? 0;
		const yaw_offset_max = this.getParameter('yaw_offset_max') ?? 360;
		const yaw_initial = this.getParameter('yaw_initial') ?? 0;

		particle.rotationYaw = yaw_initial + (yaw_offset_max - yaw_offset_min) * Math.random() + yaw_offset_min;
	}
}
Source1ParticleOperators.registerOperator(RotationYawRandom);
