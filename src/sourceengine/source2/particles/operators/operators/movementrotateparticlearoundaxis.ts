import { mat4, quat, vec3, vec4 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { DEG_TO_RAD } from '../../../../../math/constants';

let m4 = mat4.create();
let q = quat.create();
let v = vec3.create();
let a = vec4.create();

const DEFAULT_AXIS = vec3.fromValues(0, 0, 1);

export class MovementRotateParticleAroundAxis extends Operator {
	localSpace = false;


	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_vecRotAxis':
			case 'm_flRotRate':
				break;
			case 'm_nCP':
				this.controlPointNumber = Number(value);
				break;
			case 'm_bLocalSpace':
				this.localSpace = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		let axis = vec3.normalize(a as vec3, this.getParamVectorValue('m_vecRotAxis', particle, a) ?? DEFAULT_AXIS);
		let rotationRate = this.getParamScalarValue('m_flRotRate') ?? 180;

		let cp = this.system.getControlPoint(this.controlPointNumber);

		if (this.localSpace) {
			quat.copy(q, cp.currentWorldQuaternion);
		} else {
			quat.identity(q);
		}

		vec3.transformQuat(axis, axis, q);
		mat4.identity(m4);
		mat4.rotate(m4, m4, DEG_TO_RAD * rotationRate * elapsedTime * elapsedTime, axis);

		vec3.sub(v, particle.position, cp.currentWorldPosition);
		//TODO: should we do previous position too ?
		vec3.transformMat4(v, v, m4);
		vec3.add(particle.position, v, cp.currentWorldPosition);
	}
}
RegisterSource2ParticleOperator('C_OP_MovementRotateParticleAroundAxis', MovementRotateParticleAroundAxis);
