import { vec3 } from 'gl-matrix';
import { RemapValClampedBias } from '../../../../../math/functions';
import { PARTICLE_FIELD_POSITION } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const v = vec3.create();
const v1 = vec3.fromValues(1, 1, 1);

export class RemapCPtoVector extends Operator {
	cpInput = 0;
	inputMin = vec3.create();
	inputMax = vec3.create();
	outputMin = vec3.create();
	outputMax = vec3.create();
	startTime = -1;
	endTime = -1;
	setMethod = null;
	offset = false;
	accelerate = false;
	localSpaceCP = -1;
	remapBias = 0.5;
	scaleInitialRange;// TODO: search default value
	#fieldOutput = PARTICLE_FIELD_POSITION;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nCPInput':
				this.cpInput = (param);
				break;
			case 'm_vInputMin':
				vec3.copy(this.inputMin, param);
				break;
			case 'm_vInputMax':
				vec3.copy(this.inputMax, param);
				break;
			case 'm_vOutputMin':
				vec3.copy(this.outputMin, param);
				break;
			case 'm_vOutputMax':
				vec3.copy(this.outputMax, param);
				break;
			case 'm_flStartTime':
				this.startTime = param;
				break;
			case 'm_flEndTime':
				this.endTime = param;
				break;
			case 'm_nSetMethod':
				this.setMethod = param;
				break;
			case 'm_bOffset':
				this.offset = param;
				break;
			case 'm_bAccelerate':
				this.accelerate = param;
				break;
			case 'm_nLocalSpaceCP':
				this.localSpaceCP = (param);
				break;
			case 'm_flRemapBias':
				this.remapBias = param;
				break;
			case 'm_bScaleInitialRange':
				this.scaleInitialRange = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime, strength) {
		const inputMin = this.inputMin;
		const inputMax = this.inputMax;
		const outputMin = this.outputMin;
		const outputMax = this.outputMax;

		const input = this.system.getControlPoint(this.cpInput).currentWorldPosition;

		v[0] = RemapValClampedBias(input[0], inputMin[0], inputMax[0], outputMin[0], outputMax[0], this.remapBias);
		v[1] = RemapValClampedBias(input[1], inputMin[1], inputMax[1], outputMin[1], outputMax[1], this.remapBias);
		v[2] = RemapValClampedBias(input[2], inputMin[2], inputMax[2], outputMin[2], outputMax[2], this.remapBias);

		const scaleInitial = this.scaleInitialRange || this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE';//TODO: optimize

		if (scaleInitial) {
			vec3.lerp(v, v1, v, strength);
		} else {
			vec3.lerp(v, particle.getField(this.#fieldOutput), v, strength);
		}

		particle.setField(this.#fieldOutput, v, scaleInitial);
	}
}
RegisterSource2ParticleOperator('C_INIT_RemapCPtoVector', RemapCPtoVector);
