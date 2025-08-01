import { vec3 } from 'gl-matrix';
import { Source2ParticleVectorField } from '../../enums';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const normalizeVectorVec3 = vec3.create();

export const DEFAULT_SCALE_FACTOR = 1;

export class NormalizeVector extends Operator {
	#fieldOutput = Source2ParticleVectorField.Position;
	#scale = DEFAULT_SCALE_FACTOR;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flScale':
				this.#scale = param.getValueAsNumber() ?? DEFAULT_SCALE_FACTOR;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		particle.getVectorField(normalizeVectorVec3, this.#fieldOutput);
		vec3.normalize(normalizeVectorVec3, normalizeVectorVec3);
		vec3.scale(normalizeVectorVec3, normalizeVectorVec3, this.#scale);
		particle.setField(this.#fieldOutput, normalizeVectorVec3);
	}
}
RegisterSource2ParticleOperator('C_OP_NormalizeVector', NormalizeVector);
