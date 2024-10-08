import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_FLOAT } from '../../constants';
import { DEG_TO_RAD } from '../../../../../math/constants';

export class RotationRandom extends SourceEngineParticleOperator {
	static functionName = 'Rotation Random';
	constructor() {
		super();
		this.addParam('rotation_initial', PARAM_TYPE_FLOAT, 0.0);
		this.addParam('rotation_offset_min', PARAM_TYPE_FLOAT, 0.0);
		this.addParam('rotation_offset_max', PARAM_TYPE_FLOAT, 360.0);
	//	DMXELEMENT_UNPACK_FIELD('rotation_initial', '0', float, m_flDegrees)
	//	DMXELEMENT_UNPACK_FIELD('rotation_offset_min', '0', float, m_flDegreesMin)
	//	DMXELEMENT_UNPACK_FIELD('rotation_offset_max', '360', float, m_flDegreesMax)
	//	DMXELEMENT_UNPACK_FIELD('rotation_random_exponent', '1', float, m_flRotationRandExponent)
	}

	doInit(particle, elapsedTime) {
		const rotation_initial = this.getParameter('rotation_initial');
		const rotation_offset_min = this.getParameter('rotation_offset_min');
		const rotation_offset_max = this.getParameter('rotation_offset_max');
		//TODO :exponent

		const rotation = (rotation_initial + (rotation_offset_max - rotation_offset_min) * Math.random() + rotation_offset_min) * DEG_TO_RAD;
		particle.setInitialRoll(rotation);
	}

	initMultipleOverride() {
		return true;
	}
}
SourceEngineParticleOperators.registerOperator(RotationRandom);
