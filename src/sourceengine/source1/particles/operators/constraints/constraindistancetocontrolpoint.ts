import { vec3 } from 'gl-matrix';

import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT, PARAM_TYPE_INT, PARAM_TYPE_VECTOR } from '../../constants';

const cpPosition = vec3.create();
const tempVec3_2 = vec3.create();

export class ConstrainDistanceToControlPoint extends SourceEngineParticleOperator {
	static functionName = 'Constrain distance to control point';
	constructor() {
		super();
		//this.setNameId('Constrain distance to control point');
		this.addParam('minimum distance', PARAM_TYPE_FLOAT, 0.0);
		this.addParam('maximum distance', PARAM_TYPE_FLOAT, 100.0);
		this.addParam('control point number', PARAM_TYPE_INT, 0);
		this.addParam('offset of center', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('global center point', PARAM_TYPE_BOOL, 0);
	//	DMXELEMENT_UNPACK_FIELD('minimum distance', '0', float, m_fMinDistance)
	//	DMXELEMENT_UNPACK_FIELD('maximum distance', '100', float, m_fMaxDistance)
	//	DMXELEMENT_UNPACK_FIELD('control point number', '0', int, m_nControlPointNumber)
	//	DMXELEMENT_UNPACK_FIELD('offset of center', '0 0 0', Vector, m_CenterOffset)
	//	DMXELEMENT_UNPACK_FIELD('global center point', '0', bool, m_bGlobalCenter)
	}

	applyConstraint(particle) {
		const minDistance = this.getParameter('minimum distance');
		const maxDistance = this.getParameter('maximum distance');
		const offsetOfCenter = this.getParameter('offset of center');
		const cpNumber = this.getParameter('control point number');

		const cp = this.particleSystem.getControlPoint(cpNumber);
		const v = vec3.copy(tempVec3_2, particle.position);
		if (cp) {
			vec3.sub(v, v, cp.getWorldPosition(cpPosition));
		}

		const distance = vec3.length(v);
		if (distance > 0) {
			vec3.scale(v, v, 1 / distance);
			if (distance < minDistance) {
				vec3.scale(v, v, minDistance);
				vec3.add(particle.position, cpPosition, v);
			} else {
				if (distance > maxDistance) {
					vec3.scale(v, v, maxDistance);
					vec3.add(particle.position, cpPosition, v);
				}
			}
		}
	}
}
SourceEngineParticleOperators.registerOperator(ConstrainDistanceToControlPoint);
