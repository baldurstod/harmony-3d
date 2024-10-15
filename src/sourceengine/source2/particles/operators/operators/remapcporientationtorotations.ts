import { quat, vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { DEG_TO_RAD } from '../../../../../math/constants';

const tempQuat = quat.create();
const tempQuat2 = quat.create();

export class RemapCPOrientationToRotations extends Operator {
	#vecRotation = vec3.create();
	#controlPointNumber = 0;//m_TransformInput

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_vecRotation':
				vec3.set(this.#vecRotation, Number(value[0]), Number(value[1]), Number(value[2]));// pitch yaw roll (Y Z X)
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime, strength) {
		const cp = this.system.getControlPoint(this.#controlPointNumber);
		if (cp) {
			cp.getWorldQuaternion(tempQuat);
			quat.rotateY(tempQuat, tempQuat, this.#vecRotation[0] * DEG_TO_RAD);
			quat.rotateZ(tempQuat, tempQuat, this.#vecRotation[1] * DEG_TO_RAD);
			quat.rotateX(tempQuat, tempQuat, this.#vecRotation[2] * DEG_TO_RAD);
			quat.copy(particle.quaternion, tempQuat);
		}
	}
}
RegisterSource2ParticleOperator('C_OP_RemapCPOrientationToRotations', RemapCPOrientationToRotations);
