import { Operator } from '../operator';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class RadiusFromCPObject extends Operator {

	override doInit(): void {
		//TODO:  I don't really know what it is supposed to do
	}
}
RegisterSource2ParticleOperator('C_INIT_RadiusFromCPObject', RadiusFromCPObject);
