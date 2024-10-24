import { quat, vec3 } from 'gl-matrix';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT, PARAM_TYPE_VECTOR } from '../../constants';

const tempVec3 = vec3.create();
const tempVec3_2 = vec3.create();
const tempAxis = vec3.create();
const tempQuat = quat.create();

export class TwistAroundAxis extends SourceEngineParticleOperator {
	static functionName = 'twist around axis';
	constructor() {
		super();
		this.addParam('twist axis', PARAM_TYPE_VECTOR, vec3.fromValues(0, 0, 1));
		this.addParam('amount of force', PARAM_TYPE_FLOAT, 0);
		this.addParam('object local space axis 0/1', PARAM_TYPE_BOOL, 0);
	}

	doForce(particle, elapsedTime, accumulatedForces, strength = 1) {
		const axis = this.getParameter('twist axis');//TODO: set in world space
		const amountOfForce = this.getParameter('amount of force');
		const localSpace = this.getParameter('object local space axis 0/1');

		const cp = particle.system.getControlPoint(0);
		const offsetToAxis = vec3.sub(tempVec3, particle.position, cp.getWorldPosition(tempVec3));
/*
		if (!localSpace) {
			cp.getWorldQuaternion(tempQuat);
			axis = vec3.transformQuat(tempAxis, axis, tempQuat);
		}
			*/
		vec3.normalize(offsetToAxis, offsetToAxis);
		vec3.scale(tempVec3_2, offsetToAxis, vec3.dot(offsetToAxis, axis));
		vec3.sub(offsetToAxis, offsetToAxis, tempVec3_2);
		vec3.normalize(offsetToAxis, offsetToAxis);

		const f = vec3.cross(tempVec3_2, axis, offsetToAxis);
		vec3.scale(f, f, amountOfForce * strength);
		vec3.add(accumulatedForces, accumulatedForces, f);
	}
}
SourceEngineParticleOperators.registerOperator(TwistAroundAxis);
