import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const vec = vec3.create();

const DEFAULT_MIN_DISTANCE = 0;
const DEFAULT_MAX_DISTANCE = 1000;
const DEFAULT_GLOBAL_CENTER = false;

export class ConstrainDistance extends Operator {
	#centerOffset = vec3.create();
	#globalCenter = DEFAULT_GLOBAL_CENTER;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_CenterOffset':
				param.getValueAsVec3(this.#centerOffset);
				break;
			case 'm_bGlobalCenter':
				this.#globalCenter = param.getValueAsBool() ?? DEFAULT_GLOBAL_CENTER;
				break;
			case 'm_fMinDistance':
			case 'm_fMaxDistance':
			// used in applyConstraint
			default:
				super._paramChanged(paramName, param);
		}
	}

	override applyConstraint(particle: Source2Particle): void {
		const minDistance: number = this.getParamScalarValue('m_fMinDistance') ?? DEFAULT_MIN_DISTANCE;
		const maxDistance: number = this.getParamScalarValue('m_fMaxDistance') ?? DEFAULT_MAX_DISTANCE;
		//const offsetOfCenter = this.getParameter('offset of center');
		//const cpNumber = this.getParameter('control point number');

		const cp = this.system.getControlPoint(this.controlPointNumber);
		const v = vec3.clone(particle.position);
		if (cp) {
			vec3.sub(v, v, cp.getWorldPosition(vec));
		}

		const distance = vec3.length(v);
		if (distance > 0) {
			vec3.scale(v, v, 1 / distance);
			if (distance < minDistance) {
				vec3.scale(v, v, minDistance);
				vec3.add(particle.position, cp.getWorldPosition(vec), v);
			} else {
				if (distance > maxDistance) {
					vec3.scale(v, v, maxDistance);
					vec3.add(particle.position, cp.getWorldPosition(vec), v);
				}
			}
		}
	}
}
RegisterSource2ParticleOperator('C_OP_ConstrainDistance', ConstrainDistance);
