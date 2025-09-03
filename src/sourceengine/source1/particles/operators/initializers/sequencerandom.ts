import { PARAM_TYPE_FLOAT } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../source1particleoperators';
import { SourceEngineParticleSystem } from '../../source1particlesystem';
import { SourceEngineParticleOperator } from '../operator';

export class SequenceRandom extends SourceEngineParticleOperator {
	static functionName = 'Sequence Random';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('sequence_min', PARAM_TYPE_FLOAT, 0);
		this.addParam('sequence_max', PARAM_TYPE_FLOAT, 0);
	}

	doInit(particle: SourceEngineParticle, elapsedTime: number): void {
		const sequence_min = this.getParameter('sequence_min');
		const sequence_max = this.getParameter('sequence_max');

		const sequence = Math.round((sequence_max - sequence_min) * Math.random()) + sequence_min;
		particle.setInitialSequence(sequence);
	}
}
SourceEngineParticleOperators.registerOperator(SequenceRandom);
