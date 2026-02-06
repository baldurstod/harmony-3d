import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

//const DEFAULT_FORCE_AMOUNT = 100;// TODO: check default value

export class TwistAroundAxis extends Operator {

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {

			case 'm_fForceAmount':
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doForce(): void {
		//const forceAmount = this.getParamScalarValue('m_fForceAmount') ?? DEFAULT_FORCE_AMOUNT;
	}
}
RegisterSource2ParticleOperator('C_OP_TwistAroundAxis', TwistAroundAxis);
