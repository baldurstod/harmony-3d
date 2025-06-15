import { quat, vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

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

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flInterpRate':
				this.m_flInterpRate = value;
				break;
			case 'm_flMaxTraceLength':
				this.maxTraceLength = value;
				break;
			case 'm_flTolerance':
				this.tolerance = value;
				break;
			case 'm_flTraceOffset':
				this.traceOffset = value;
				break;
			case 'm_CollisionGroupName':
				this.collisionGroupName = value;
				break;
			case 'm_nInputCP':
				this.inputCP = Number(value);
				break;
			case 'm_nOutputCP':
				this.outputCP = Number(value);
				break;
			case 'm_bIncludeWater':
				this.includeWater = value;
				break;
			default:
				super._paramChanged(paramName, value);
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
