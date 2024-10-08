import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';

export class RotationBasic extends SourceEngineParticleOperator {
	static functionName = 'Rotation Basic';
	constructor() {
		super();
	}

	doOperate(particle, elapsedTime) {
		particle.rotationRoll += particle.rotationSpeedRoll * elapsedTime;
	}
}
SourceEngineParticleOperators.registerOperator(RotationBasic);
