import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class SpinUpdate extends Operator {

	//This operator has no parameters

	override doOperate(particle: Source2Particle, elapsedTime: number): void {
		particle.rotationRoll += particle.rotationSpeedRoll * elapsedTime;
	}
}
RegisterSource2ParticleOperator('C_OP_SpinUpdate', SpinUpdate);
