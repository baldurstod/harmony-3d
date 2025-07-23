import { vec3 } from 'gl-matrix';
import { PARTICLE_FIELD_POSITION } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_VECTOR = vec3.fromValues(1, 0, 0);
const v = vec3.create();

export class RemapControlPointDirectionToVector extends Operator {
	#fieldOutput = PARTICLE_FIELD_POSITION;
	scale = 1;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flScale':
				this.scale = param;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime) {
		const cp = this.system.getControlPoint(this.controlPointNumber);
		vec3.transformQuat(v, DEFAULT_VECTOR, cp.currentWorldQuaternion);
		vec3.scale(v, v, this.scale);
		particle.setField(this.#fieldOutput, v);
	}
}
RegisterSource2ParticleOperator('C_OP_RemapControlPointDirectionToVector', RemapControlPointDirectionToVector);
