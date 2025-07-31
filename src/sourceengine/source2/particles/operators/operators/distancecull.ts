import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { DEFAULT_CONTROL_POINT_NUMBER, Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const vec = vec3.create();

const DEFAULT_DISTANCE = 0;// TODO: check default value
const DEFAULT_CULL_INSIDE = false;// TODO: check default value

export class DistanceCull extends Operator {
	#pointOffset = vec3.create();// TODO: check default value
	#distance = DEFAULT_DISTANCE;
	#cullInside = DEFAULT_CULL_INSIDE;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nControlPoint':// TODO: mutualize ?
				this.controlPointNumber = param.getValueAsNumber() ?? DEFAULT_CONTROL_POINT_NUMBER;
				break;
			case 'm_vecPointOffset':
				param.getValueAsVec3(this.#pointOffset);
				break;
			case 'm_flDistance':
				this.#distance = param.getValueAsNumber() ?? 0;
				break;
			case 'm_bCullInside':
				this.#cullInside = param.getValueAsBool() ?? DEFAULT_CULL_INSIDE;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const cp = this.system.getControlPoint(this.controlPointNumber);
		if (cp) {
			const origin = cp.getWorldPosition(vec);
			vec3.add(origin, origin, this.#pointOffset);

			if (this.#cullInside) {//TODO: improve this
				if (vec3.distance(particle.position, origin) < this.#distance) {
					particle.die();
				}
			} else {
				if (vec3.distance(particle.position, origin) > this.#distance) {
					particle.die();
				}
			}
		}
	}
}
RegisterSource2ParticleOperator('C_OP_DistanceCull', DistanceCull);
