import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class RadiusFromCPObject extends Operator {

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO:  I don't really know what it is supposed to do
	}
}
RegisterSource2ParticleOperator('C_INIT_RadiusFromCPObject', RadiusFromCPObject);
