import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class LifespanDecay extends Operator {

	override doOperate(particle: Source2Particle): void {
		if (particle.timeToLive < particle.currentTime) {
			particle.die();
		}
	}
}
RegisterSource2ParticleOperator('C_OP_Decay', LifespanDecay);
