import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class SpinUpdate extends Operator {

	//This operator has no parameters

	doOperate(particle, elapsedTime) {
		particle.rotationRoll += particle.rotationSpeedRoll * elapsedTime;
	}
}
RegisterSource2ParticleOperator('C_OP_SpinUpdate', SpinUpdate);
