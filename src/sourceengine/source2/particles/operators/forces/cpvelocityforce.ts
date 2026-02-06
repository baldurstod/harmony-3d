import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class CPVelocityForce extends Operator {

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flScale':
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doForce(): void {
		//const scale = this.getParamScalarValue('m_flScale') ?? 1;
		//TODO
	}
}
RegisterSource2ParticleOperator('C_OP_CPVelocityForce', CPVelocityForce);
