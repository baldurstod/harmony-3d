import { vec3 } from 'gl-matrix';
import { vec3RandomBox } from '../../../../../math/functions';
import { PARTICLE_FIELD_POSITION } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const tempVec3 = vec3.create();

/*
DISABLED: replaced by C_INIT_InitVec
//Create an InitVec that mimics the old 'Random Vector' operator
export class RandomVector extends Operator {
	vecMin = vec3.create();
	vecMax = vec3.create();
	#fieldOutput = PARTICLE_FIELD_POSITION;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_vecMin':
				vec3.copy(this.vecMin, param);
				break;
			case 'm_vecMax':
				vec3.copy(this.vecMax, param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime) {
		vec3RandomBox(tempVec3, this.vecMin, this.vecMax);
		particle.setField(this.#fieldOutput, tempVec3);
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomVector', RandomVector);
*/
