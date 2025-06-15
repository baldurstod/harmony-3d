import { mat3, vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

//const mat = mat4.create();
const nmat = mat3.create();

export class NormalLock extends Operator {

	_paramChanged(paramName, value) {
		switch (paramName) {
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		const cp = this.system.getControlPoint(this.controlPointNumber);
		if (cp) {
			//mat4.invert(mat, particle.cpPreviousTransform);

			//let currentTransform = cp.getWorldTransformation(particle.cpPreviousTransform);//store the current tranform in the previous transform since we won't use it further
			//mat4.mul(mat, currentTransform, mat);
			mat3.normalFromMat4(nmat, cp.deltaWorldTransformation);
			vec3.transformMat3(particle.normal, particle.normal, nmat);
		}
	}
}
RegisterSource2ParticleOperator('C_OP_NormalLock', NormalLock);
