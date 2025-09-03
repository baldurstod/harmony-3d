import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../source1particleoperators';
import { SourceEngineParticleOperator } from '../operator';

export class RotationBasic extends SourceEngineParticleOperator {
	static functionName = 'Rotation Basic';

	doOperate(particle: SourceEngineParticle, elapsedTime: number) {
		particle.rotationRoll += particle.rotationSpeedRoll * elapsedTime;
	}
}
SourceEngineParticleOperators.registerOperator(RotationBasic);
