import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleOperator } from '../operator';

export class RotationBasic extends Source1ParticleOperator {
	static functionName = 'Rotation Basic';

	doOperate(particle: Source1Particle, elapsedTime: number) {
		particle.rotationRoll += particle.rotationSpeedRoll * elapsedTime;
	}
}
Source1ParticleOperators.registerOperator(RotationBasic);
