import { DEG_TO_RAD } from '../../../../../math/constants';
import { RandomFloatExp } from '../../../../../math/functions';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT } from '../../constants';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

export class RotationSpeedRandom extends SourceEngineParticleOperator {
	static functionName = 'Rotation Speed Random';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('rotation_speed_constant', PARAM_TYPE_FLOAT, 0.0);
		this.addParam('rotation_speed_random_min', PARAM_TYPE_FLOAT, 0.0);
		this.addParam('rotation_speed_random_max', PARAM_TYPE_FLOAT, 360.0);
		this.addParam('rotation_speed_random_exponent', PARAM_TYPE_FLOAT, 1.0);
		this.addParam('randomly_flip_direction', PARAM_TYPE_BOOL, 1);
	//	DMXELEMENT_UNPACK_FIELD('rotation_speed_constant', '0', float, m_flDegrees)
	//	DMXELEMENT_UNPACK_FIELD('rotation_speed_random_min', '0', float, m_flDegreesMin)
	//	DMXELEMENT_UNPACK_FIELD('rotation_speed_random_max', '360', float, m_flDegreesMax)
	//	DMXELEMENT_UNPACK_FIELD('rotation_speed_random_exponent', '1', float, m_flRotationRandExponent)
	//	DMXELEMENT_UNPACK_FIELD('randomly_flip_direction', '1', bool, m_bRandomlyFlipDirection)
	}

	doInit(particle, elapsedTime) {
		const m_flDegrees = this.getParameter('rotation_speed_constant');
		const m_flDegreesMin = this.getParameter('rotation_speed_random_min');
		const m_flDegreesMax = this.getParameter('rotation_speed_random_max');
		const randomly_flip_direction = this.getParameter('randomly_flip_direction');
		const m_flRotationRandExponent = this.getParameter('rotation_speed_random_exponent');
		const m_flRadians = m_flDegrees * DEG_TO_RAD;
		const m_flRadiansMin = m_flDegreesMin * DEG_TO_RAD;
		const m_flRadiansMax = m_flDegreesMax * DEG_TO_RAD;

		let rotationSpeed = m_flRadians + RandomFloatExp(m_flRadiansMin, m_flRadiansMax, m_flRotationRandExponent);

		if (randomly_flip_direction == 1 && Math.random() > 0.5) {
			rotationSpeed = -rotationSpeed;
		}
		particle.rotationSpeedRoll = rotationSpeed;
	}
}
SourceEngineParticleOperators.registerOperator(RotationSpeedRandom);
