import { vec3 } from 'gl-matrix';

import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

const vec = vec3.create();

export class ConstrainDistance extends Operator {
	minDistance = 0;
	maxDistance = 100;
	scaleCP = -1;
	centerOffset = vec3.create();
	globalCenter = false;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_fMinDistance':
				this.minDistance = Number(value);
				break;
			case 'm_fMaxDistance':
				this.maxDistance = Number(value);
				break;
			case 'm_nScaleCP':
				this.scaleCP = Number(value);
				break;
			case 'm_CenterOffset':
				vec3.copy(this.centerOffset, value);
				break;
			case 'm_bGlobalCenter':
				this.globalCenter = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	applyConstraint(particle) {
		const minDistance = this.getParameter('minimum distance');
		const maxDistance = this.getParameter('maximum distance');
		const offsetOfCenter = this.getParameter('offset of center');
		const cpNumber = this.getParameter('control point number');

		const cp = this.system.getControlPoint(this.controlPointNumber);
		const v = vec3.clone(particle.position);
		if (cp) {
			vec3.sub(v, v, cp.getWorldPosition(vec));
		}

		const distance = vec3.length(v);
		if (distance > 0) {
			vec3.scale(v, v, 1 / distance);
			if (distance < this.minDistance) {
				vec3.scale(v, v, this.minDistance);
				vec3.add(particle.position, cp.getWorldPosition(vec), v);
			} else {
				if (distance > this.maxDistance) {
					vec3.scale(v, v, this.maxDistance);
					vec3.add(particle.position, cp.getWorldPosition(vec), v);
				}
			}
		}
	}
}
RegisterSource2ParticleOperator('C_OP_ConstrainDistance', ConstrainDistance);
