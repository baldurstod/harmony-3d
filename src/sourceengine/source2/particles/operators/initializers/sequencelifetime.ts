import { Operator } from '../operator';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class SequenceLifeTime extends Operator {

	override doInit(): void {
		//TODO: I don't know what to do
	}
}
RegisterSource2ParticleOperator('C_INIT_SequenceLifeTime', SequenceLifeTime);
