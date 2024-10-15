import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

let v = vec3.create();

export class DampenToCP extends Operator {
	range = 100;
	scale = 1;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flRange':
				this.range = value;
				break;
			case 'm_flScale':
				this.scale = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		let cp = this.system.getControlPoint(this.controlPointNumber);

		let distance = vec3.distance(particle.position, cp.currentWorldPosition);
		if (distance > this.range) {
			return;
		} else {
			let dampenAmount = distance / this.range;
			vec3.sub(v, particle.position, particle.prevPosition);
			vec3.scale(v, v, dampenAmount);
			vec3.add(particle.position, particle.prevPosition, v);
			//TODO: operator strength
		}
	}
}
RegisterSource2ParticleOperator('C_OP_DampenToCP', DampenToCP);
