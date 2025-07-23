import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class RadiusFromCPObject extends Operator {
	#controlPoint = 0;
	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nControlPoint':
				this.#controlPoint = (param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime) {
		// I don't really know what it is supposed to do
	}
}
RegisterSource2ParticleOperator('C_INIT_RadiusFromCPObject', RadiusFromCPObject);
