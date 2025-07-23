import { quat, vec3 } from 'gl-matrix';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const UNIT_VEC3_X = vec3.fromValues(1, 0, 0);
const UNIT_VEC3_Z = vec3.fromValues(0, 0, 1);
const q = quat.create();

export class SetCPOrientationToGroundNormal extends Operator {
	m_flInterpRate = 0;
	maxTraceLength = 128;
	tolerance = 32;
	traceOffset = 64;
	collisionGroupName = 'NONE';
	inputCP = 0;
	outputCP = 1;
	includeWater = false;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flInterpRate':
				this.m_flInterpRate = param;
				break;
			case 'm_flMaxTraceLength':
				this.maxTraceLength = param;
				break;
			case 'm_flTolerance':
				this.tolerance = param;
				break;
			case 'm_flTraceOffset':
				this.traceOffset = param;
				break;
			case 'm_CollisionGroupName':
				this.collisionGroupName = param;
				break;
			case 'm_nInputCP':
				this.inputCP = (param);
				break;
			case 'm_nOutputCP':
				this.outputCP = (param);
				break;
			case 'm_bIncludeWater':
				this.includeWater = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime) {
		//TODO: do it properly
		const outputCP = this.system.getControlPoint(this.outputCP);
		if (outputCP) {
			quat.rotationTo(q, UNIT_VEC3_X, UNIT_VEC3_Z);
			outputCP.quaternion = q;
		}
	}
}
RegisterSource2ParticleOperator('C_OP_SetCPOrientationToGroundNormal', SetCPOrientationToGroundNormal);
