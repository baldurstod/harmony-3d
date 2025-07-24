import { vec3 } from 'gl-matrix';
import { PARTICLE_FIELD_POSITION } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_VECTOR = vec3.fromValues(1, 0, 0);
const v = vec3.create();

const DEFAULT_FIELD_OUTPUT = PARTICLE_FIELD_POSITION;// TODO: check default value
const DEFAULT_SCALE = 1;// TODO: check default value

export class RemapControlPointDirectionToVector extends Operator {
	#fieldOutput = DEFAULT_FIELD_OUTPUT;
	#scale = DEFAULT_SCALE;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flScale':
				this.#scale = param.getValueAsNumber() ?? DEFAULT_SCALE;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const cp = this.system.getControlPoint(this.controlPointNumber);
		vec3.transformQuat(v, DEFAULT_VECTOR, cp.currentWorldQuaternion);
		vec3.scale(v, v, this.#scale);
		particle.setField(this.#fieldOutput, v);
	}
}
RegisterSource2ParticleOperator('C_OP_RemapControlPointDirectionToVector', RemapControlPointDirectionToVector);
