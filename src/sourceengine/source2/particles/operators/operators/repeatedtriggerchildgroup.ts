import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

//const DEFAULT_CLUSTER_COOLDOWN = 0;// TODO: check default value

export class RepeatedTriggerChildGroup extends Operator {

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {

			case 'm_flClusterCooldown':
				// used in doOperate
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(): void {
		//const clusterCooldown = this.getParamScalarValue('m_flClusterCooldown');
		//TODO: i have no idea of what it does
	}
}
RegisterSource2ParticleOperator('C_OP_RepeatedTriggerChildGroup', RepeatedTriggerChildGroup);
