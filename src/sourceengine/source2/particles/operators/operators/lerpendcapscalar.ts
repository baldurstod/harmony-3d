import { RemapValClamped, lerp } from '../../../../../math/functions';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_OUTPUT = 0;// TODO: check default value
const DEFAULT_LERP_TIME = 0;// TODO: check default value

export class LerpEndCapScalar extends Operator {
	#output = DEFAULT_OUTPUT;
	#lerpTime = DEFAULT_OUTPUT;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flOutput':
				this.#output = param.getValueAsNumber() ?? DEFAULT_OUTPUT;
				break;
			case 'm_flLerpTime':
				this.#lerpTime = param.getValueAsNumber() ?? DEFAULT_LERP_TIME;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO
	}
}
RegisterSource2ParticleOperator('C_OP_LerpEndCapScalar', LerpEndCapScalar);
