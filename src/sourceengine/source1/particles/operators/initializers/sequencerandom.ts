import { PARAM_TYPE_FLOAT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

export class SequenceRandom extends Source1ParticleOperator {
	static functionName = 'Sequence Random';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('sequence_min', PARAM_TYPE_FLOAT, 0);
		this.addParam('sequence_max', PARAM_TYPE_FLOAT, 0);
	}

	doInit(particle: Source1Particle, elapsedTime: number): void {
		const sequence_min = this.getParameter('sequence_min');
		const sequence_max = this.getParameter('sequence_max');

		const sequence = Math.round((sequence_max - sequence_min) * Math.random()) + sequence_min;
		particle.setInitialSequence(sequence);
	}
}
Source1ParticleOperators.registerOperator(SequenceRandom);
