import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Source2ParticleSystem } from '../../source2particlesystem';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const vec = vec3.create();

const DEFAULT_PLANE_OFFSET = 0;// TODO: check default value
const DEFAULT_LOCAL_SPACE = false;// TODO: check default value
const DEFAULT_PLANE_CONTROL_POINT = 0;// TODO: check default value

export class PlaneCull extends Operator {
	#planeControlPoint = DEFAULT_PLANE_CONTROL_POINT;
	#planeDirection = vec3.fromValues(0, 0, 1);// TODO: check default value
	#localSpace = DEFAULT_LOCAL_SPACE;
	#planeOffset = DEFAULT_PLANE_OFFSET;
	#planeDirectionOffset = vec3.create();//computed

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.#update();
	}

	#update() {
		vec3.scale(this.#planeDirectionOffset, this.#planeDirection, this.#planeOffset);
	}

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nPlaneControlPoint':
				this.#planeControlPoint = param.getValueAsNumber() ?? DEFAULT_PLANE_CONTROL_POINT;
				break;
			case 'm_vecPlaneDirection':
				console.error('do this param', paramName, param, this.constructor.name);
				vec3.normalize(this.#planeDirection, param);
				this.#update();
				break;
			case 'm_bLocalSpace':
				console.error('do this param', paramName, param, this.constructor.name);
				this.#localSpace = param;
				break;
			case 'm_flPlaneOffset':
				this.#planeOffset = param.getValueAsNumber() ?? DEFAULT_PLANE_OFFSET;
				this.#update();
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		// TODO: use m_bLocalSpace
		const cp = this.system.getControlPoint(this.#planeControlPoint);
		if (cp) {
			const origin = cp.getWorldPosition(vec);
			vec3.sub(origin, origin, this.#planeDirectionOffset);
			vec3.sub(origin, particle.position, origin);
			if (vec3.dot(this.#planeDirection, origin) < 0) {
				particle.die();
			}
		}
	}
}
RegisterSource2ParticleOperator('C_OP_PlaneCull', PlaneCull);
