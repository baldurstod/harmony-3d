import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

//Notice this is not the default particle normal.
//This operator change the default normal from +Z to +X
const DEFAULT_NORMAL = vec3.fromValues(1, 0, 0);

export class NormalAlignToCP extends Operator {

	_paramChanged(paramName, value) {
		switch (paramName) {
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		//This operator overrides the normal
		const cp = this.system.getControlPoint(this.controlPointNumber);
		if (cp) {
			//cp.getWorldTransformation(particle.cpPreviousTransform);
			vec3.transformQuat(particle.normal, DEFAULT_NORMAL, cp.currentWorldQuaternion);
		}
	}
}
RegisterSource2ParticleOperator('C_INIT_NormalAlignToCP', NormalAlignToCP);
