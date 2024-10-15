import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class LifespanDecay extends Operator {

	_paramChanged(paramName, value) {
		switch (paramName) {
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		if (particle.timeToLive < particle.currentTime) {
			particle.die();
		}
	}
}
RegisterSource2ParticleOperator('C_OP_Decay', LifespanDecay);
