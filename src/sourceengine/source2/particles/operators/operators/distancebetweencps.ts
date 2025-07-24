import { vec3 } from 'gl-matrix';
import { RemapValClamped } from '../../../../../math/functions';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';


const DEFAULT_START_CP = 0;// TODO: check default value
const DEFAULT_END_CP = 1;// TODO: check default value
const DEFAULT_MAX_TRACE_LENGTH = -1;// TODO: check default value
const DEFAULT_LOS = false;// TODO: check default value
const DEFAULT_LOS_SCALE = 0;// TODO: check default value
const DEFAULT_COLLISION_GROUP_NAME = 'NONE';// TODO: check default value
const DEFAULT_SET_METHOD = 'PARTICLE_SET_SCALE_INITIAL_VALUE';// TODO: check default value//TODO: enum

export class DistanceBetweenCPs extends Operator {
	#startCP = DEFAULT_START_CP;
	#endCP = DEFAULT_END_CP;
	#maxTraceLength = DEFAULT_MAX_TRACE_LENGTH;
	#los = false;
	#losScale = DEFAULT_LOS_SCALE;
	#collisionGroupName = DEFAULT_COLLISION_GROUP_NAME;
	setMethod = DEFAULT_SET_METHOD;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nStartCP'://TODO: mutualize
				this.#startCP = param.getValueAsNumber() ?? DEFAULT_START_CP;
				break;
			case 'm_nEndCP'://TODO: mutualize
				this.#endCP = param.getValueAsNumber() ?? DEFAULT_END_CP;
				break;
			case 'm_flInputMin':
			case 'm_flInputMax':
			case 'm_flOutputMin':
			case 'm_flOutputMax':
				//used in doOperate
				break;
			case 'm_flMaxTraceLength':
				this.#maxTraceLength = param.getValueAsNumber() ?? DEFAULT_MAX_TRACE_LENGTH;
				break;
			case 'm_flLOSScale':
				this.#losScale = param.getValueAsNumber() ?? DEFAULT_LOS_SCALE;
				break;
			case 'm_CollisionGroupName':
				this.#collisionGroupName = param.getValueAsString() ?? DEFAULT_COLLISION_GROUP_NAME;
				break;
			case 'm_bLOS':
				this.#los = param.getValueAsBool() ?? DEFAULT_LOS;
				break;
			case 'm_nSetMethod':
				this.setMethod = param.getValueAsString() ?? DEFAULT_SET_METHOD;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const inputMin = this.getParamScalarValue('m_flInputMin') ?? 0;
		const inputMax = this.getParamScalarValue('m_flInputMax') ?? 128;
		const outputMin = this.getParamScalarValue('m_flOutputMin') ?? 0;
		const outputMax = this.getParamScalarValue('m_flOutputMax') ?? 1;

		//TODO: los and other parameters

		const startCpPos = this.system.getControlPoint(this.#startCP).currentWorldPosition;
		const endCPPos = this.system.getControlPoint(this.#endCP).currentWorldPosition;

		let value = vec3.distance(startCpPos, endCPPos);

		value = RemapValClamped(value, inputMin, inputMax, outputMin, outputMax);
		particle.setField(this.fieldOutput, value, this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
	}
}
RegisterSource2ParticleOperator('C_OP_DistanceBetweenCPs', DistanceBetweenCPs);
