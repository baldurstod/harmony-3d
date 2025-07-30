import { vec3 } from 'gl-matrix';
import { RemapValClamped } from '../../../../../math/functions';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const va = vec3.create();
const vb = vec3.create();

const DEFAULT_INPUT_MIN = 0;
const DEFAULT_INPUT_MAX = 1;
const DEFAULT_INPUT_BIAS = 0.5;
const DEFAULT_START_CP = 0;
const DEFAULT_END_CP = 1;
const DEFAULT_OFFSET_CP = 2;
const DEFAULT_OUTPUT_CP = 4;
const DEFAULT_INPUT_CP = 3;
const DEFAULT_RADIAL_CHECK = true;
const DEFAULT_SCALE_OFFSET = false;

export class CPOffsetToPercentageBetweenCPs extends Operator {
	#fieldOutput = PARTICLE_FIELD_RADIUS;
	#inputMin = 0;
	#inputMax = 1;
	#inputBias = DEFAULT_INPUT_BIAS;
	#startCP = DEFAULT_START_CP;
	#endCP = DEFAULT_END_CP;
	#offsetCP = DEFAULT_END_CP;
	#outputCP = DEFAULT_END_CP;
	#inputCP = DEFAULT_END_CP;
	#radialCheck = DEFAULT_RADIAL_CHECK;//treat distance between points as radius
	#scaleOffset = DEFAULT_SCALE_OFFSET;//treat offset as scale of total distance
	#vecOffset = vec3.create();

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flInputMin':
				this.#inputMin = param.getValueAsNumber() ?? DEFAULT_INPUT_MIN;
				break;
			case 'm_flInputMax':
				this.#inputMax = param.getValueAsNumber() ?? DEFAULT_INPUT_MAX;
				break;
			case 'm_flInputBias':
				this.#inputBias = param.getValueAsNumber() ?? DEFAULT_INPUT_BIAS;
				break;
			case 'm_nStartCP':
				this.#startCP = param.getValueAsNumber() ?? DEFAULT_START_CP;
				break;
			case 'm_nEndCP':
				this.#endCP = param.getValueAsNumber() ?? DEFAULT_END_CP;
				break;
			case 'm_nOffsetCP':
				this.#offsetCP = param.getValueAsNumber() ?? DEFAULT_OFFSET_CP;
				break;
			case 'm_nOuputCP':
				this.#outputCP = param.getValueAsNumber() ?? DEFAULT_OUTPUT_CP;
				break;
			case 'm_nInputCP':
				this.#inputCP = param.getValueAsNumber() ?? DEFAULT_INPUT_CP;
				break;
			case 'm_bRadialCheck':
				this.#radialCheck = param.getValueAsBool() ?? DEFAULT_RADIAL_CHECK;
				break;
			case 'm_bScaleOffset':
				this.#scaleOffset = param.getValueAsBool() ?? DEFAULT_SCALE_OFFSET;
				break;
			case 'm_vecOffset':
				param.getValueAsVec3(this.#vecOffset);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const startCpPos = this.system.getControlPoint(this.#startCP).currentWorldPosition;
		const endCPPos = this.system.getControlPoint(this.#endCP).currentWorldPosition;

		let percentage;
		const dist = vec3.distance(startCpPos, endCPPos);
		if (this.#radialCheck) {
			const dist2 = vec3.distance(startCpPos, particle.position);
			percentage = dist2 / dist;
		} else {
			vec3.sub(va, particle.position, startCpPos);
			vec3.sub(vb, endCPPos, startCpPos);
			//TODO: check dot product this is not right
			percentage = vec3.dot(va, vb) / (dist * dist);
		}


		if (percentage < this.#inputMin || percentage > this.#inputMax) {
			return;
		}

		console.error('code me')

		//const value = RemapValClamped(percentage, this.#inputMin, this.#inputMax, this.#outputMin, this.#outputMax);
		//particle.setField(this.#fieldOutput, value, this.scaleInitialRange || this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
	}
}
RegisterSource2ParticleOperator('C_OP_CPOffsetToPercentageBetweenCPs', CPOffsetToPercentageBetweenCPs);
