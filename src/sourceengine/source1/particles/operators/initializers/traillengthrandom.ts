import { RandomFloatExp } from '../../../../../math/functions';
import { PARAM_TYPE_FLOAT } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../source1particleoperators';
import { SourceEngineParticleSystem } from '../../source1particlesystem';
import { SourceEngineParticleOperator } from '../operator';

export class TrailLengthRandom extends SourceEngineParticleOperator {
	static functionName = 'Trail Length Random';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('length_min', PARAM_TYPE_FLOAT, 0.1);
		this.addParam('length_max', PARAM_TYPE_FLOAT, 0.1);
		this.addParam('length_random_exponent', PARAM_TYPE_FLOAT, 1);
		//	DMXELEMENT_UNPACK_FIELD('length_min', '0.1', float, m_flMinLength)
		//	DMXELEMENT_UNPACK_FIELD('length_max', '0.1', float, m_flMaxLength)
		//	DMXELEMENT_UNPACK_FIELD('length_random_exponent', '1', float, m_flLengthRandExponent)
	}

	doInit(particle: SourceEngineParticle, elapsedTime: number): void {
		const length_min = this.getParameter('length_min');
		const length_max = this.getParameter('length_max');
		const length_random_exponent = this.getParameter('length_random_exponent');

		particle.trailLength = RandomFloatExp(length_min, length_max, length_random_exponent);

	}
}
SourceEngineParticleOperators.registerOperator(TrailLengthRandom);
