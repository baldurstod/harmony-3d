import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

/*
const DEFAULT_IGNORE_DELTA = false;// TODO: check default value
const DEFAULT_INPUT_MIN = 0;// TODO: check default value
const DEFAULT_INPUT_MAX = 1;// TODO: check default value
const DEFAULT_SET_METHOD = 'PARTICLE_SET_SCALE_CURRENT_VALUE';// TODO: check default value
*/
const DEFAULT_OUTPUT_MIN = 0;
const DEFAULT_OUTPUT_MAX = 1;

export class ClampScalar extends Operator {
	#outputMin = DEFAULT_OUTPUT_MIN;
	#outputMax = DEFAULT_OUTPUT_MAX;
	/*
	#ignoreDelta = DEFAULT_IGNORE_DELTA;
	#inputMin = DEFAULT_INPUT_MIN;
	#inputMax = DEFAULT_INPUT_MAX;
	#setMethod = DEFAULT_SET_METHOD;
	*/

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {

			case 'm_flOutputMin'://TODO: mutualize
				this.#outputMin = param.getValueAsNumber() ?? DEFAULT_OUTPUT_MIN;
				break;
			case 'm_flOutputMax'://TODO: mutualize
				this.#outputMax = param.getValueAsNumber() ?? DEFAULT_OUTPUT_MAX;
				break;
			/*
			case 'm_bIgnoreDelta':
				this.#ignoreDelta = param.getValueAsBool() ?? DEFAULT_IGNORE_DELTA;
				break;
			case 'm_flInputMin':
				this.#inputMin = param.getValueAsNumber() ?? DEFAULT_INPUT_MIN;
				break;
			case 'm_flInputMax':
				this.#inputMin = param.getValueAsNumber() ?? DEFAULT_INPUT_MAX;
				break;
			case 'm_nSetMethod':
				this.#setMethod = param.getValueAsString() ?? DEFAULT_SET_METHOD;
				break;
				*/
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(): void {
		//TODO
	}
}
RegisterSource2ParticleOperator('C_OP_ClampScalar', ClampScalar);
