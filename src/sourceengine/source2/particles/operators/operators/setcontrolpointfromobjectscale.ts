import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class SetControlPointFromObjectScale extends Operator {
	cpInput = 0;
	cpOutput = 1;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nCPInput':
				this.cpInput  = Number(value);
				break;
			case 'm_nCPOutput':
				this.cpOutput  = Number(value);
				break;
			default:
				super._paramChanged(paramName, value);
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
