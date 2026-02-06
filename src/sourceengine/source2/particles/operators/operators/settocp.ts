import { quat, vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const tempQuat = quat.create();
const tempVec3 = vec3.create();
const tempVec3_2 = vec3.create();

const DEFAULT_OFFSET_LOCAL = false;// TODO: check default value

export class SetToCP extends Operator {
	#offset = vec3.create();
	#offsetLocal = DEFAULT_OFFSET_LOCAL;

	override   _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_vecOffset':
				param.getValueAsVec3(this.#offset);
				break;
			case 'm_bOffsetLocal'://TODO: mutualize
				this.#offsetLocal = param.getValueAsBool() ?? DEFAULT_OFFSET_LOCAL;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(particle: Source2Particle): void {
		const cp = this.system.getControlPoint(this.controlPointNumber);
		if (cp) {
			cp.getWorldPosition(tempVec3_2);
			if (this.#offsetLocal) {
				vec3.transformQuat(tempVec3, this.#offset, cp.getWorldQuaternion(tempQuat));
				vec3.add(tempVec3, tempVec3, tempVec3_2);
			} else {
				vec3.add(tempVec3, this.#offset, tempVec3_2);
			}
			vec3.copy(particle.position, tempVec3);
			vec3.copy(particle.prevPosition, tempVec3);
		}
	}
}
RegisterSource2ParticleOperator('C_OP_SetToCP', SetToCP);
