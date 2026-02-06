import { vec3 } from 'gl-matrix';
import { vec3RandomBox } from '../../../../../math/functions';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2Particle } from '../../source2particle';

const v = vec3.create();

const DEFAULT_LOCAL_COORDS = false;// TODO: check default value
const DEFAULT_NORMALIZE = false;// TODO: check default value

export class NormalOffset extends Operator {
	#offsetMin = vec3.create();// TODO: check default value
	#offsetMax = vec3.create();// TODO: check default value
	#localCoords = DEFAULT_LOCAL_COORDS;// TODO: check default value
	#normalize = DEFAULT_NORMALIZE;// TODO: check default value

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_OffsetMin':
				param.getValueAsVec3(this.#offsetMin);
				break;
			case 'm_OffsetMax':
				param.getValueAsVec3(this.#offsetMax);
				break;
			case 'm_bLocalCoords':
				this.#localCoords = param.getValueAsBool() ?? DEFAULT_LOCAL_COORDS;
				break;
			case 'm_bNormalize':
				this.#normalize = param.getValueAsBool() ?? DEFAULT_NORMALIZE;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle: Source2Particle): void {
		vec3RandomBox(v, this.#offsetMin, this.#offsetMax);

		if (this.#localCoords) {
			const cp = this.system.getControlPoint(this.controlPointNumber);
			vec3.transformQuat(v, v, cp.currentWorldQuaternion);
		}

		vec3.add(particle.normal, particle.normal, v);

		if (this.#normalize) {
			vec3.normalize(particle.normal, particle.normal);
		}
	}

	override initMultipleOverride():boolean {
		return true;
	}
}
RegisterSource2ParticleOperator('C_INIT_NormalOffset', NormalOffset);
