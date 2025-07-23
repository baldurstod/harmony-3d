import { vec3 } from 'gl-matrix';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const vec = vec3.create();

export class PlaneCull extends Operator {
	planeControlPoint = 0;
	planeDirection = vec3.fromValues(0, 0, 1);
	localSpace = false;
	planeOffset = 0;
	planeDirectionOffset = vec3.create();
	constructor(system) {
		super(system);
		this._update();
	}

	_update() {
		vec3.scale(this.planeDirectionOffset, this.planeDirection, this.planeOffset);
	}

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nPlaneControlPoint':
				this.planeControlPoint = (param);
				break;
			case 'm_vecPlaneDirection':
				vec3.normalize(this.planeDirection, param);
				this._update();
				break;
			case 'm_bLocalSpace':
				this.localSpace = param;
				break;
			case 'm_flPlaneOffset':
				this.planeOffset = (param);
				this._update();
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime) {
		const cp = this.system.getControlPoint(this.planeControlPoint);
		if (cp) {
			const origin = cp.getWorldPosition(vec);
			vec3.sub(origin, origin, this.planeDirectionOffset);
			vec3.sub(origin, particle.position, origin);
			if (vec3.dot(this.planeDirection, origin) < 0) {
				particle.die();
			}
		}
	}
}
RegisterSource2ParticleOperator('C_OP_PlaneCull', PlaneCull);
