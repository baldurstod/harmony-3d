import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_POSITION } from '../../../../common/particles/particlefields';
import { OperatorParam } from '../operatorparam';

const v = vec3.create();

export class NormalizeVector extends Operator {
	#fieldOutput = PARTICLE_FIELD_POSITION;
	scale = 1;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flScale':
				this.scale = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime) {
		vec3.copy(v, particle.getField(this.#fieldOutput));
		vec3.normalize(v, v);
		vec3.scale(v, v, this.scale);
		particle.setField(this.#fieldOutput, v);
	}
}
RegisterSource2ParticleOperator('C_OP_NormalizeVector', NormalizeVector);
