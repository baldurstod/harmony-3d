import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const v = vec3.create();

const DEFAULT_RANGE = 100;// TODO: check default value
const DEFAULT_SCALE = 100;// TODO: check default value

export class DampenToCP extends Operator {
	#range = DEFAULT_RANGE;
	#scale = DEFAULT_SCALE;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flRange':
				this.#range = param.getValueAsNumber() ?? DEFAULT_RANGE;
				break;
			case 'm_flScale':
				this.#scale = param.getValueAsNumber() ?? DEFAULT_SCALE;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(particle: Source2Particle): void {
		// TODO: use m_flScale
		const cp = this.system.getControlPoint(this.controlPointNumber);

		const distance = vec3.distance(particle.position, cp.currentWorldPosition);
		if (distance > this.#range) {
			return;
		} else {
			const dampenAmount = distance / this.#range;
			vec3.sub(v, particle.position, particle.prevPosition);
			vec3.scale(v, v, dampenAmount);
			vec3.add(particle.position, particle.prevPosition, v);
			//TODO: operator strength
		}
	}
}
RegisterSource2ParticleOperator('C_OP_DampenToCP', DampenToCP);
