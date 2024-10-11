import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class CPVelocityForce extends Operator {

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flScale':
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doForce(particle, elapsedTime, accumulatedForces, strength = 1) {
		let scale = this.getParamScalarValue('m_flScale') ?? 1;
		//TODO
	}
}
RegisterSource2ParticleOperator('C_OP_CPVelocityForce', CPVelocityForce);
