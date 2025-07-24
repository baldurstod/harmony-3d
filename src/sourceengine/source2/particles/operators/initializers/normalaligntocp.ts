import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

//Notice this is not the default particle normal.
//This operator change the default normal from +Z to +X
const DEFAULT_NORMAL = vec3.fromValues(1, 0, 0);

export class NormalAlignToCP extends Operator {

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//This operator overrides the normal
		const cp = this.system.getControlPoint(this.controlPointNumber);
		if (cp) {
			//cp.getWorldTransformation(particle.cpPreviousTransform);
			vec3.transformQuat(particle.normal, DEFAULT_NORMAL, cp.currentWorldQuaternion);
		}
	}
}
RegisterSource2ParticleOperator('C_INIT_NormalAlignToCP', NormalAlignToCP);
