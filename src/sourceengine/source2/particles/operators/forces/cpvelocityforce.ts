import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class CPVelocityForce extends Operator {

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flScale':
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doForce(particle: Source2Particle, elapsedTime: number, accumulatedForces: vec3, strength: number): void {
		const scale = this.getParamScalarValue('m_flScale') ?? 1;
		//TODO
	}
}
RegisterSource2ParticleOperator('C_OP_CPVelocityForce', CPVelocityForce);
