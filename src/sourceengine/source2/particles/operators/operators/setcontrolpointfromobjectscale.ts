import { vec3 } from 'gl-matrix';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class SetControlPointFromObjectScale extends Operator {
	cpInput = 0;
	cpOutput = 1;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nCPInput':
				this.cpInput  = (param);
				break;
			case 'm_nCPOutput':
				this.cpOutput  = (param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime) {
		const cpInput = this.system.getControlPoint(this.cpInput);
		const cpOutput = this.system.getControlPoint(this.cpOutput);

		//TODO: use the actual scale
		cpOutput.position = vec3.fromValues(1, 1, 1);
	}

	isPreEmission() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_OP_SetControlPointFromObjectScale', SetControlPointFromObjectScale);
