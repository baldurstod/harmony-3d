import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { Source2Particle } from '../../source2particle';

export class SequenceLifeTime extends Operator {

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: I don't know what to do
	}
}
RegisterSource2ParticleOperator('C_INIT_SequenceLifeTime', SequenceLifeTime);
