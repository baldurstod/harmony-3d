import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class LifespanDecay extends Operator {

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		if (particle.timeToLive < particle.currentTime) {
			particle.die();
		}
	}
}
RegisterSource2ParticleOperator('C_OP_Decay', LifespanDecay);
