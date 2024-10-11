import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class SequenceLifeTime extends Operator {

	doInit(particles, elapsedTime) {
		//TODOv3
	}
}
RegisterSource2ParticleOperator('C_INIT_SequenceLifeTime', SequenceLifeTime);
