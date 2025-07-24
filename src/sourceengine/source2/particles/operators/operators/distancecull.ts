import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const vec = vec3.create();

export class DistanceCull extends Operator {
	pointOffset = vec3.create();
	distance = 0;
	cullInside = false;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nControlPoint':
				console.error('do this param', paramName, param);
				this.controlPointNumber = (param);
				break;
			case 'm_vecPointOffset':
				console.error('do this param', paramName, param);
				vec3.copy(this.pointOffset, param);
				break;
			case 'm_flDistance':
				this.distance = param.getValueAsNumber() ?? 0;
				break;
			case 'm_bCullInside':
				console.error('do this param', paramName, param);
				this.cullInside = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const cp = this.system.getControlPoint(this.controlPointNumber);
		if (cp) {
			const origin = cp.getWorldPosition(vec);
			vec3.add(origin, origin, this.pointOffset);

			if (this.cullInside) {//TODO: improve this
				if (vec3.distance(particle.position, origin) < this.distance) {
					particle.die();
				}
			} else {
				if (vec3.distance(particle.position, origin) > this.distance) {
					particle.die();
				}
			}
		}
	}
}
RegisterSource2ParticleOperator('C_OP_DistanceCull', DistanceCull);
