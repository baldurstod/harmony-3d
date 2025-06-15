import { vec3 } from 'gl-matrix';

import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_INT, PARAM_TYPE_VECTOR } from '../../constants';
import { vec3RandomBox } from '../../../../../math/functions';

const identityVec3 = vec3.create();
const tempVec3 = vec3.create();

export class VelocityRandom extends SourceEngineParticleOperator {
	static functionName = 'Velocity Random';
	constructor() {
		super();
		this.addParam('control_point_number', PARAM_TYPE_INT, 0);
		this.addParam('random_speed_min', PARAM_TYPE_FLOAT, 0);
		this.addParam('random_speed_max', PARAM_TYPE_FLOAT, 0);
		this.addParam('speed_in_local_coordinate_system_min', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('speed_in_local_coordinate_system_max', PARAM_TYPE_VECTOR, vec3.create());
	//	DMXELEMENT_UNPACK_FIELD('control_point_number', '0', int, m_nControlPointNumber)
	//	DMXELEMENT_UNPACK_FIELD('random_speed_min', '0', float, m_fSpeedMin)
	//	DMXELEMENT_UNPACK_FIELD('random_speed_max', '0', float, m_fSpeedMax)
	//	DMXELEMENT_UNPACK_FIELD('speed_in_local_coordinate_system_min', '0 0 0', Vector, m_LocalCoordinateSystemSpeedMin)
	//	DMXELEMENT_UNPACK_FIELD('speed_in_local_coordinate_system_max', '0 0 0', Vector, m_LocalCoordinateSystemSpeedMax)
	}

	doInit(particle, elapsedTime) {
		const speed_in_local_coordinate_system_min = this.getParameter('speed_in_local_coordinate_system_min');
		const speed_in_local_coordinate_system_max = this.getParameter('speed_in_local_coordinate_system_max');
		const random_speed_min = this.getParameter('random_speed_min');
		const random_speed_max = this.getParameter('random_speed_max');
		const m_nControlPointNumber = this.getParameter('control_point_number');

		const randomVector = vec3.create();
		const randomSpeed = (random_speed_max - random_speed_min) * Math.random() + random_speed_min;

		if (vec3.exactEquals(speed_in_local_coordinate_system_min, identityVec3) &&
			vec3.exactEquals(speed_in_local_coordinate_system_max, identityVec3)) {
			vec3.random(randomVector);//randomVector.randomizeUnit();
		} else {
			vec3RandomBox(randomVector, speed_in_local_coordinate_system_min, speed_in_local_coordinate_system_max);//randomVector.randomize(speed_in_local_coordinate_system_min, speed_in_local_coordinate_system_max);
		}

		if (randomSpeed != 0) {
			vec3.random(tempVec3, randomSpeed);
			vec3.add(randomVector, randomVector, tempVec3);
		}

		const cp = particle.system.getControlPoint(m_nControlPointNumber);
		if (cp) {
			vec3.transformQuat(randomVector, randomVector, cp.getWorldQuaternion());
		}
		//vec3.copy(particle.velocity, randomVector);
		//vec3.add(particle.velocity, particle.velocity, randomVector);
		vec3.scale(randomVector, randomVector, -elapsedTime);
		vec3.add(particle.prevPosition, particle.prevPosition, randomVector);
	}

	initMultipleOverride() {
		return true;
	}
}
SourceEngineParticleOperators.registerOperator(VelocityRandom);
