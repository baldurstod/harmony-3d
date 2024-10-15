import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

let vec = vec3.create();

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

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nPlaneControlPoint':
				this.planeControlPoint = Number(value);
				break;
			case 'm_vecPlaneDirection':
				vec3.normalize(this.planeDirection, value);
				this._update();
				break;
			case 'm_bLocalSpace':
				this.localSpace  = value;
				break;
			case 'm_flPlaneOffset':
				this.planeOffset = Number(value);
				this._update();
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		let cp = this.system.getControlPoint(this.planeControlPoint);
		if (cp) {
			let origin = cp.getWorldPosition(vec);
			vec3.sub(origin, origin, this.planeDirectionOffset);
			vec3.sub(origin, particle.position, origin);
			if (vec3.dot(this.planeDirection, origin) < 0) {
				particle.die();
			}
		}
	}
}
RegisterSource2ParticleOperator('C_OP_PlaneCull', PlaneCull);
