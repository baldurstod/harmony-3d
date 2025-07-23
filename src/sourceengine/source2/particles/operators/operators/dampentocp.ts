import { vec3 } from 'gl-matrix';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const v = vec3.create();

export class DampenToCP extends Operator {
	range = 100;
	scale = 1;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flRange':
				this.range = param;
				break;
			case 'm_flScale':
				this.scale = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime) {
		const cp = this.system.getControlPoint(this.controlPointNumber);

		const distance = vec3.distance(particle.position, cp.currentWorldPosition);
		if (distance > this.range) {
			return;
		} else {
			const dampenAmount = distance / this.range;
			vec3.sub(v, particle.position, particle.prevPosition);
			vec3.scale(v, v, dampenAmount);
			vec3.add(particle.position, particle.prevPosition, v);
			//TODO: operator strength
		}
	}
}
RegisterSource2ParticleOperator('C_OP_DampenToCP', DampenToCP);
