import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class RadiusFromCPObject extends Operator {
	#controlPoint = 0;
	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nControlPoint':
				this.#controlPoint = Number(value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		// I don't really know what it is supposed to do
	}
}
RegisterSource2ParticleOperator('C_INIT_RadiusFromCPObject', RadiusFromCPObject);
