import { quat, vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

const tempQuat = quat.create();
const tempVec3 = vec3.create();
const tempVec3_2 = vec3.create();

export class SetToCP extends Operator {
	offset = vec3.create();
	offsetLocal = false;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_vecOffset':
				vec3.copy(this.offset, value);
				break;
			case 'm_bOffsetLocal':
				this.offsetLocal = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		const cp = this.system.getControlPoint(this.controlPointNumber);
		if (cp) {
			cp.getWorldPosition(tempVec3_2);
			if (this.offsetLocal) {
				vec3.transformQuat(tempVec3, this.offset, cp.getWorldQuaternion(tempQuat));
				vec3.add(tempVec3, tempVec3, tempVec3_2);
			} else {
				vec3.add(tempVec3, this.offset, tempVec3_2);
			}
			vec3.copy(particle.position, tempVec3);
			vec3.copy(particle.prevPosition, tempVec3);
		}
	}
}
RegisterSource2ParticleOperator('C_OP_SetToCP', SetToCP);
