import { RemapValClampedBias, lerp } from '../../../../../math/functions';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_CP_INPUT = 0;// TODO: check default value

export class RemapCPtoScalar extends Operator {
	#cpInput = DEFAULT_CP_INPUT;
	field = 0;//X
	inputMin = 0;
	inputMax = 1;
	outputMin = 0;
	outputMax = 1;
	startTime = -1;
	endTime = -1;
	setMethod = null;
	remapBias = 0.5;
	scaleInitialRange;// TODO: search default value
	#fieldOutput = PARTICLE_FIELD_RADIUS;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nCPInput':
				this.#cpInput = param.getValueAsNumber() ?? DEFAULT_CP_INPUT;
				break;
			case 'm_nField':
				console.error('do this param', paramName, param, this.constructor.name);
				this.field = (param);//TODO: check [0, 1, 2]
				break;
			case 'm_flInputMin':
				console.error('do this param', paramName, param, this.constructor.name);
				this.inputMin = param;
				break;
			case 'm_flInputMax':
				console.error('do this param', paramName, param, this.constructor.name);
				this.inputMax = param;
				break;
			case 'm_flOutputMin':
				console.error('do this param', paramName, param, this.constructor.name);
				this.outputMin = param;
				break;
			case 'm_flOutputMax':
				console.error('do this param', paramName, param, this.constructor.name);
				this.outputMax = param;
				break;
			case 'm_flStartTime':
				console.error('do this param', paramName, param, this.constructor.name);
				this.startTime = param;
				break;
			case 'm_flEndTime':
				console.error('do this param', paramName, param, this.constructor.name);
				this.endTime = param;
				break;
			case 'm_nSetMethod':
				console.error('do this param', paramName, param, this.constructor.name);
				this.setMethod = param;
				break;
			case 'm_flRemapBias':
				console.error('do this param', paramName, param, this.constructor.name);
				this.remapBias = param;
				break;
			case 'm_bScaleInitialRange':
				console.error('do this param', paramName, param, this.constructor.name);
				this.scaleInitialRange = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const cpInputPos = this.system.getControlPoint(this.#cpInput).currentWorldPosition;
		let value = cpInputPos[this.field] ?? 0;

		value = RemapValClampedBias(value, this.inputMin, this.inputMax, this.outputMin, this.outputMax, this.remapBias);

		const scaleInitial = this.scaleInitialRange || this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE';//TODO: optimize

		if (scaleInitial) {
			value = lerp(1, value, strength);
		} else {
			value = lerp(particle.getField(this.#fieldOutput), value, strength);
		}

		particle.setField(this.#fieldOutput, value, scaleInitial);
	}
}
RegisterSource2ParticleOperator('C_INIT_RemapCPtoScalar', RemapCPtoScalar);
