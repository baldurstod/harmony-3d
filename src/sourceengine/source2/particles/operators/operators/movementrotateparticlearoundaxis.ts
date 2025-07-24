import { mat4, quat, vec3, vec4 } from 'gl-matrix';
import { DEG_TO_RAD } from '../../../../../math/constants';
import { Source2Particle } from '../../source2particle';
import { DEFAULT_CONTROL_POINT_NUMBER, Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const m4 = mat4.create();
const q = quat.create();
const v = vec3.create();
const movementRotateParticleAroundAxisTempVec4 = vec4.create();

const DEFAULT_AXIS = vec3.fromValues(0, 0, 1);
const DEFAULT_LOCAL_SPACE = false;// TODO: check default value

export class MovementRotateParticleAroundAxis extends Operator {
	#localSpace = DEFAULT_LOCAL_SPACE;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_vecRotAxis':
			case 'm_flRotRate':
				// used in doOperate
				break;
			case 'm_nCP':
				this.controlPointNumber = param.getValueAsNumber() ?? DEFAULT_CONTROL_POINT_NUMBER;
				break;
			case 'm_bLocalSpace'://TODO: mutualize
				this.#localSpace = param.getValueAsBool() ?? DEFAULT_LOCAL_SPACE;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const axis = vec3.normalize(movementRotateParticleAroundAxisTempVec4 as vec3, this.getParamVectorValue(movementRotateParticleAroundAxisTempVec4, 'm_vecRotAxis', particle) as vec3 ?? DEFAULT_AXIS);
		const rotationRate = this.getParamScalarValue('m_flRotRate') ?? 180;

		const cp = this.system.getControlPoint(this.controlPointNumber);

		if (this.#localSpace) {
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
