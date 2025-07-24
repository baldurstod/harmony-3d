import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_FORCE_AMOUNT = 100;// TODO: check default value

export class TwistAroundAxis extends Operator {

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {

			case 'm_fForceAmount':
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doForce(particle: Source2Particle, elapsedTime: number, accumulatedForces: vec3, strength: number): void {
		const forceAmount = this.getParamScalarValue('m_fForceAmount') ?? DEFAULT_FORCE_AMOUNT;
	}
}
RegisterSource2ParticleOperator('C_OP_TwistAroundAxis', TwistAroundAxis);
