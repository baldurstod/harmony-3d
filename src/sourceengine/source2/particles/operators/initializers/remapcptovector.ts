import { vec3 } from 'gl-matrix';
import { RemapValClampedBias } from '../../../../../math/functions';
import { PARTICLE_FIELD_POSITION } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2Particle } from '../../source2particle';

const v = vec3.create();
const v1 = vec3.fromValues(1, 1, 1);

const DEFAULT_CP_INPUT = 0;// TODO: check default value
const DEFAULT_START_TIME = -1;// TODO: check default value
const DEFAULT_END_TIME = -1;// TODO: check default value
const DEFAULT_SET_METHOD = 'PARTICLE_SET_SCALE_INITIAL_VALUE';// TODO: check default value
const DEFAULT_OFFSET = false;// TODO: check default value
const DEFAULT_ACCELERATE = false;// TODO: check default value
const DEFAULT_LOCAL_SPACE_CP = -1;// TODO: check default value
const DEFAULT_REMAP_BIAS = 0.5;// TODO: check default value
const DEFAULT_SCALE_INITIAL_RANGE = false;// TODO: check default value
const DEFAULT_FIELD_OUTPUT = PARTICLE_FIELD_POSITION;// TODO: check default value

export class RemapCPtoVector extends Operator {
	#cpInput = DEFAULT_CP_INPUT;
	#inputMin = vec3.create();// TODO: check default value
	#inputMax = vec3.create();// TODO: check default value
	#outputMin = vec3.create();// TODO: check default value
	#outputMax = vec3.create();// TODO: check default value
	#startTime = DEFAULT_START_TIME;
	#endTime = DEFAULT_END_TIME;
	#setMethod = DEFAULT_SET_METHOD;
	#offset = DEFAULT_OFFSET;
	#accelerate = DEFAULT_ACCELERATE;
	#localSpaceCP = DEFAULT_LOCAL_SPACE_CP;
	#remapBias = DEFAULT_REMAP_BIAS;
	#scaleInitialRange = DEFAULT_SCALE_INITIAL_RANGE;// TODO: search default value
	#fieldOutput = DEFAULT_FIELD_OUTPUT;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nCPInput':
				this.#cpInput = param.getValueAsNumber() ?? DEFAULT_CP_INPUT;
				break;
			case 'm_vInputMin':
				console.error('do this param', paramName, param);
				vec3.copy(this.#inputMin, param);
				break;
			case 'm_vInputMax':
				param.getValueAsVec3(this.#inputMax);
				break;
			case 'm_vOutputMin':
				console.error('do this param', paramName, param);
				vec3.copy(this.#outputMin, param);
				break;
			case 'm_vOutputMax':
				param.getValueAsVec3(this.#outputMax);
				break;
			case 'm_flStartTime':
				console.error('do this param', paramName, param);
				this.#startTime = param;
				break;
			case 'm_flEndTime':
				console.error('do this param', paramName, param);
				this.#endTime = param;
				break;
			case 'm_nSetMethod':
				this.#setMethod = param.getValueAsString() ?? DEFAULT_SET_METHOD;
				break;
			case 'm_bOffset':
				console.error('do this param', paramName, param);
				this.#offset = param;
				break;
			case 'm_bAccelerate':
				console.error('do this param', paramName, param);
				this.#accelerate = param;
				break;
			case 'm_nLocalSpaceCP':
				console.error('do this param', paramName, param);
				this.#localSpaceCP = (param);
				break;
			case 'm_flRemapBias':
				console.error('do this param', paramName, param);
				this.#remapBias = param;
				break;
			case 'm_bScaleInitialRange':
				console.error('do this param', paramName, param);
				this.#scaleInitialRange = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: use missing parameters
		const inputMin = this.#inputMin;
		const inputMax = this.#inputMax;
		const outputMin = this.#outputMin;
		const outputMax = this.#outputMax;

		const input = this.system.getControlPoint(this.#cpInput).currentWorldPosition;

		v[0] = RemapValClampedBias(input[0], inputMin[0], inputMax[0], outputMin[0], outputMax[0], this.#remapBias);
		v[1] = RemapValClampedBias(input[1], inputMin[1], inputMax[1], outputMin[1], outputMax[1], this.#remapBias);
		v[2] = RemapValClampedBias(input[2], inputMin[2], inputMax[2], outputMin[2], outputMax[2], this.#remapBias);

		const scaleInitial = this.#scaleInitialRange || this.#setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE';//TODO: optimize

		if (scaleInitial) {
			vec3.lerp(v, v1, v, strength);
		} else {
			vec3.lerp(v, particle.getField(this.#fieldOutput) as vec3, v, strength);
		}

		particle.setField(this.#fieldOutput, v, scaleInitial);
	}
}
RegisterSource2ParticleOperator('C_INIT_RemapCPtoVector', RemapCPtoVector);
