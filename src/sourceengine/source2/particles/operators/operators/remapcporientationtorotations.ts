import { quat, vec3 } from 'gl-matrix';
import { DEG_TO_RAD } from '../../../../../math/constants';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2Particle } from '../../source2particle';

const tempQuat = quat.create();
const tempQuat2 = quat.create();

export class RemapCPOrientationToRotations extends Operator {
	#vecRotation = vec3.create();
	#controlPointNumber = 0;//m_TransformInput

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_vecRotation':
				param.getValueAsVec3(this.#vecRotation);// pitch yaw roll (Y Z X)
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
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
