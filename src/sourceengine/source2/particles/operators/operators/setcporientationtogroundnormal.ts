import { quat, vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const UNIT_VEC3_X = vec3.fromValues(1, 0, 0);
const UNIT_VEC3_Z = vec3.fromValues(0, 0, 1);
const q = quat.create();

const DEFAULT_INTERP_RATE = 0;// TODO: check default value
const DEFAULT_MAX_TRACE_LENGTH = 128;// TODO: check default value
const DEFAULT_TOLERANCE = 32;// TODO: check default value
const DEFAULT_TRACE_OFFSET = 64;// TODO: check default value
const DEFAULT_COLLISION_GROUP_NAME = 'NONE';// TODO: check default value
const DEFAULT_INPUT_CP = 0;// TODO: check default value
const DEFAULT_OUTPUT_CP = 1;// TODO: check default value
const DEFAULT_INCLUDE_WATER = false;// TODO: check default value

export class SetCPOrientationToGroundNormal extends Operator {
	#interpRate = DEFAULT_INTERP_RATE;
	#maxTraceLength = DEFAULT_MAX_TRACE_LENGTH;
	#tolerance = DEFAULT_TOLERANCE;
	#traceOffset = DEFAULT_TRACE_OFFSET;
	#collisionGroupName = DEFAULT_COLLISION_GROUP_NAME;
	#inputCP = DEFAULT_INPUT_CP;
	#outputCP = DEFAULT_OUTPUT_CP;
	#includeWater = DEFAULT_INCLUDE_WATER;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flInterpRate':
				this.#interpRate = param.getValueAsNumber() ?? DEFAULT_INTERP_RATE;
				break;
			case 'm_flMaxTraceLength':
				this.#maxTraceLength = param.getValueAsNumber() ?? DEFAULT_MAX_TRACE_LENGTH;
				break;
			case 'm_flTolerance':
				this.#tolerance = param.getValueAsNumber() ?? DEFAULT_TOLERANCE;
				break;
			case 'm_flTraceOffset':
				this.#traceOffset = param.getValueAsNumber() ?? DEFAULT_TRACE_OFFSET;
				break;
			case 'm_CollisionGroupName'://TODO: mutualize
				this.#collisionGroupName = param.getValueAsString() ?? DEFAULT_COLLISION_GROUP_NAME;
				break;
			case 'm_nInputCP'://TODO: mutualize
				this.#inputCP = param.getValueAsNumber() ?? DEFAULT_INPUT_CP;
				break;
			case 'm_nOutputCP'://TODO mutualize
				this.#outputCP = param.getValueAsNumber() ?? DEFAULT_OUTPUT_CP;
				break;
			case 'm_bIncludeWater':
				this.#includeWater = param.getValueAsBool() ?? DEFAULT_INCLUDE_WATER;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: do it properly
		const outputCP = this.system.getControlPoint(this.#outputCP);
		if (outputCP) {
			quat.rotationTo(q, UNIT_VEC3_X, UNIT_VEC3_Z);
			outputCP.quaternion = q;
		}
	}
}
RegisterSource2ParticleOperator('C_OP_SetCPOrientationToGroundNormal', SetCPOrientationToGroundNormal);
