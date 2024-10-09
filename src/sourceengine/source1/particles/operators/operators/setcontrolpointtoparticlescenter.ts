import { vec3 } from 'gl-matrix';

import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_INT, PARAM_TYPE_VECTOR3 } from '../../constants';

const tempVec3_min = vec3.create();
const tempVec3_max = vec3.create();

export class SetControlPointToParticlesCenter extends SourceEngineParticleOperator {
	static functionName = 'Set Control Point to Particles\' Center';
	constructor() {
		super();
		this.addParam('Control Point Number to Set', PARAM_TYPE_INT, 1);
		this.addParam('Center Offset', PARAM_TYPE_VECTOR3, vec3.fromValues(0, 0, 0));
	}

	doOperate(particle, elapsedTime) {
		const cpNumber = this.getParameter('Control Point Number to Set');
		const centerOffset = this.getParameter('Center Offset');

		//const v = vec3.add(tempVec3, particle.position, particle.cpPosition);
		this.particleSystem.getBounds(tempVec3_min, tempVec3_max);
		vec3.lerp(tempVec3_min, tempVec3_min, tempVec3_max, 0.5);
		vec3.add(tempVec3_min, tempVec3_min, centerOffset);


		this.particleSystem.setChildControlPointPosition(cpNumber, cpNumber, tempVec3_min);
	}
}
SourceEngineParticleOperators.registerOperator(SetControlPointToParticlesCenter);
