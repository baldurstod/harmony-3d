import { vec3 } from 'gl-matrix';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_CP_INPUT = 0;// TODO: check default value
const DEFAULT_CP_OUTPUT = 1;// TODO: check default value

export class SetControlPointFromObjectScale extends Operator {
	#cpInput = 0;
	#cpOutput = 1;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nCPInput':
				this.#cpInput = param.getValueAsNumber() ?? DEFAULT_CP_INPUT;
				break;
			case 'm_nCPOutput':
				this.#cpOutput = param.getValueAsNumber() ?? DEFAULT_CP_OUTPUT;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(): void {
		//const cpInput = this.system.getControlPoint(this.#cpInput);
		const cpOutput = this.system.getControlPoint(this.#cpOutput);

		//TODO: use the actual scale
		cpOutput.setPosition(vec3.fromValues(1, 1, 1));
	}

	override isPreEmission(): boolean {
		return true;
	}
}
RegisterSource2ParticleOperator('C_OP_SetControlPointFromObjectScale', SetControlPointFromObjectScale);
