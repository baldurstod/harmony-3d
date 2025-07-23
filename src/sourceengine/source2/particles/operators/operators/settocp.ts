import { quat, vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const tempQuat = quat.create();
const tempVec3 = vec3.create();
const tempVec3_2 = vec3.create();

export class SetToCP extends Operator {
	offset = vec3.create();
	offsetLocal = false;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_vecOffset':
				console.error('do this param', paramName, param);
				vec3.copy(this.offset, param);
				break;
			case 'm_bOffsetLocal':
				console.error('do this param', paramName, param);
				this.offsetLocal = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
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
