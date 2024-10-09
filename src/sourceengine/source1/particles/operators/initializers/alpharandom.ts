import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_INT, PARAM_TYPE_VECTOR } from '../../constants';
import { RandomFloatExp } from '../../../../../math/functions';

export class AlphaRandom extends SourceEngineParticleOperator {
	static functionName ='Alpha Random';

	constructor() {
		super();
		this.addParam('alpha_min', PARAM_TYPE_INT, 0);
		this.addParam('alpha_max', PARAM_TYPE_INT, 255);
		this.addParam('alpha_random_exponent', PARAM_TYPE_FLOAT, 1.0);
	//	DMXELEMENT_UNPACK_FIELD('alpha_min', '255', int, m_nAlphaMin)
	//	DMXELEMENT_UNPACK_FIELD('alpha_max', '255', int, m_nAlphaMax)
	//	DMXELEMENT_UNPACK_FIELD('alpha_random_exponent', '1', float, m_flAlphaRandExponent)
	}

	doInit(particle, elapsedTime) {
		const alpha_min = this.getParameter('alpha_min') / 255.0;
		const alpha_max = this.getParameter('alpha_max') / 255.0;
		const alpha_random_exponent = this.getParameter('alpha_random_exponent');

		const alpha = RandomFloatExp(alpha_min, alpha_max, alpha_random_exponent);
		particle.alpha = alpha;
		particle.startAlpha = alpha;
	}
}
SourceEngineParticleOperators.registerOperator(AlphaRandom);
