import { vec3 } from 'gl-matrix';

import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_INT } from '../../constants';

export class SetChildControlPointsFromParticlePositions extends SourceEngineParticleOperator {
	static functionName = 'Set child control points from particle positions';
	constructor() {
		super();
		this.addParam('# of control points to set', PARAM_TYPE_INT, 1);
		this.addParam('First control point to set', PARAM_TYPE_INT, 0);
	}

	doOperate(particle, elapsedTime) {
		const number = this.getParameter('# of control points to set');
		const first = this.getParameter('First control point to set');
		//const v = vec3.clone(particle.position);
		//v.add(particle.offsetPosition);
		//const v = vec3.add(vec3.create(), particle.position, particle.cpPosition);//v.add(particle.cpPosition);
		//TODO
		const v = vec3.create();
		particle.getWorldPos(v);
		this.particleSystem.setChildControlPointPosition(first, first+number-1, v);
	}
}
SourceEngineParticleOperators.registerOperator(SetChildControlPointsFromParticlePositions);
