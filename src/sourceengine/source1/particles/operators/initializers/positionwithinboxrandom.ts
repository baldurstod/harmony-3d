import { vec3 } from 'gl-matrix';

import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_INT, PARAM_TYPE_VECTOR } from '../../constants';
import { vec3RandomBox } from '../../../../../math/functions';

const tempVec3 = vec3.create();

export class PositionWithinBoxRandom extends SourceEngineParticleOperator {
	static functionName = 'Position Within Box Random';
	constructor() {
		super();

		this.addParam('min', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('max', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('control point number', PARAM_TYPE_INT, 0);
	//	DMXELEMENT_UNPACK_FIELD('min', '0 0 0', Vector, m_vecMin)
	//	DMXELEMENT_UNPACK_FIELD('max', '0 0 0', Vector, m_vecMax)
	//	DMXELEMENT_UNPACK_FIELD('control point number', '0', int, m_nControlPointNumber)
	}

	doInit(particle, elapsedTime) {
		const min = this.getParameter('min');
		const max = this.getParameter('max');
		const controlPointNumber = this.getParameter('control point number');

		vec3RandomBox(particle.position, min, max);
		vec3.copy(particle.prevPosition, particle.position);

		const controlPoint = particle.system.getControlPoint(controlPointNumber);
		if (controlPoint) {
			controlPoint.getWorldPosition(tempVec3);
			vec3.add(particle.position, particle.position, tempVec3);
			vec3.add(particle.prevPosition, particle.prevPosition, tempVec3);
		}
	}
}
SourceEngineParticleOperators.registerOperator(PositionWithinBoxRandom);
