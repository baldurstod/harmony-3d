import { vec3 } from 'gl-matrix';
import { RemapValClampedBias } from '../../../../../math/functions';
import { PARTICLE_FIELD_POSITION } from '../../../../common/particles/particlefields';
import { Source2ParticleSetMethod, stringToSetMethod } from '../../enums';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const v = vec3.create();
const tempVectorField = vec3.create();
const v1 = vec3.fromValues(1, 1, 1);

const DEFAULT_CP_INPUT = 0;// TODO: check default value
const DEFAULT_START_TIME = -1;// TODO: check default value
const DEFAULT_END_TIME = -1;// TODO: check default value
const DEFAULT_SET_METHOD = Source2ParticleSetMethod.ScaleInitial;// TODO: check default value
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

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nCPInput':
				this.#cpInput = param.getValueAsNumber() ?? DEFAULT_CP_INPUT;
				break;
			case 'm_vInputMin':
				param.getValueAsVec3(this.#inputMin);
				break;
			case 'm_vInputMax':
				param.getValueAsVec3(this.#inputMax);
				break;
			case 'm_vOutputMin':
				param.getValueAsVec3(this.#outputMin);
				break;
			case 'm_vOutputMax':
				param.getValueAsVec3(this.#outputMax);
				break;
			case 'm_flStartTime':
				console.error('do this param', paramName, param);
				this.#startTime = param.getValueAsNumber() ?? DEFAULT_START_TIME;
				break;
			case 'm_flEndTime':
				this.#endTime = param.getValueAsNumber() ?? DEFAULT_END_TIME;
				break;
			case 'm_nSetMethod':
				this.#setMethod = stringToSetMethod(param.getValueAsString()) ?? DEFAULT_SET_METHOD;
				break;
			case 'm_bOffset':
				this.#offset = param.getValueAsBool() ?? DEFAULT_OFFSET;
				break;
			case 'm_bAccelerate':
				this.#accelerate = param.getValueAsBool() ?? DEFAULT_ACCELERATE;
				break;
			case 'm_nLocalSpaceCP':
				console.error('do this param', paramName, param);
				this.#localSpaceCP = param.getValueAsNumber() ?? DEFAULT_LOCAL_SPACE_CP;
				break;
			case 'm_flRemapBias':
				this.#remapBias = param.getValueAsNumber() ?? DEFAULT_REMAP_BIAS;
				break;
			case 'm_bScaleInitialRange':
				this.#scaleInitialRange = param.getValueAsBool() ?? DEFAULT_SCALE_INITIAL_RANGE;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: use missing parameters
		const inputMin = this.#inputMin;
		const inputMax = this.#inputMax;
		const outputMin = this.#outputMin;
		const outputMax = this.#outputMax;

		const input = this.system.getControlPoint(this.#cpInput).currentWorldPosition;

		v[0] = RemapValClampedBias(input[0], inputMin[0], inputMax[0], outputMin[0], outputMax[0], this.#remapBias);
		v[1] = RemapValClampedBias(input[1], inputMin[1], inputMax[1], outputMin[1], outputMax[1], this.#remapBias);
		v[2] = RemapValClampedBias(input[2], inputMin[2], inputMax[2], outputMin[2], outputMax[2], this.#remapBias);

		const scaleInitial = this.#scaleInitialRange || this.#setMethod == Source2ParticleSetMethod.ScaleInitial;//TODO: optimize

		if (scaleInitial) {
			vec3.lerp(v, v1, v, strength);
		} else {
			vec3.lerp(v, particle.getVectorField(tempVectorField, this.#fieldOutput), v, strength);
		}

		particle.setField(this.#fieldOutput, v, scaleInitial);
	}
}
RegisterSource2ParticleOperator('C_INIT_RemapCPtoVector', RemapCPtoVector);
