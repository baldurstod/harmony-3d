import { vec3 } from 'gl-matrix';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const center = vec3.create();

const DEFAULT_CP_1 = 1;// TODO: check default value

export class SetControlPointToCenter extends Operator {
	#cp1 = DEFAULT_CP_1;
	#cp1Pos = vec3.create();

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nCP1':// TODO: mutualize this parameter ?
				this.#cp1 = param.getValueAsNumber() ?? DEFAULT_CP_1;
				break;
			case 'm_vecCP1Pos':
				param.getValueAsVec3(this.#cp1Pos);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(): void {
		this.system.getBoundsCenter(center);
		vec3.add(center, center, this.#cp1Pos);
		this.system.getOwnControlPoint(this.#cp1).setPosition(center);
	}

	override isPreEmission(): boolean {
		return true;
	}
}
RegisterSource2ParticleOperator('C_OP_SetControlPointToCenter', SetControlPointToCenter);
