import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_INPUT_MIN = 0;// TODO: check default value
const DEFAULT_INPUT_MAX = 1;// TODO: check default value
const DEFAULT_OUTPUT_MIN = 0;// TODO: check default value
const DEFAULT_OUTPUT_MAX = 1;// TODO: check default value
const DEFAULT_OUT_CONTROL_POINT_NUMBER = 1;// TODO: check default value

export class RemapSpeedtoCP extends Operator {
	#inputMin = DEFAULT_INPUT_MIN;
	#inputMax = DEFAULT_INPUT_MAX;
	#outputMin = DEFAULT_OUTPUT_MIN;
	#outputMax = DEFAULT_OUTPUT_MAX;
	#outControlPointNumber = DEFAULT_OUT_CONTROL_POINT_NUMBER;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flInputMin':
				this.#inputMin = param.getValueAsNumber() ?? DEFAULT_INPUT_MIN;
				break;
			case 'm_flInputMax':
				this.#inputMin = param.getValueAsNumber() ?? DEFAULT_INPUT_MAX;
				break;
			case 'm_flOutputMin':
				this.#outputMin = param.getValueAsNumber() ?? DEFAULT_OUTPUT_MIN;
				break;
			case 'm_flOutputMax':
				this.#outputMax = param.getValueAsNumber() ?? DEFAULT_OUTPUT_MAX;
				break;
			case 'm_nOutControlPointNumber':
				this.#outputMax = param.getValueAsNumber() ?? DEFAULT_OUT_CONTROL_POINT_NUMBER;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO
	}
}
RegisterSource2ParticleOperator('C_OP_RemapSpeedtoCP', RemapSpeedtoCP);
