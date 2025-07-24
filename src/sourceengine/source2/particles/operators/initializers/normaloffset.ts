import { vec3 } from 'gl-matrix';
import { vec3RandomBox } from '../../../../../math/functions';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2Particle } from '../../source2particle';

const v = vec3.create();

export class NormalOffset extends Operator {
	#offsetMin = vec3.create();// TODO: check default value
	#offsetMax = vec3.create();// TODO: check default value
	#localCoords = false;// TODO: check default value
	#normalize = false;// TODO: check default value

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_OffsetMin':
				param.getValueAsVec3(this.#offsetMin);
				break;
			case 'm_OffsetMax':
				param.getValueAsVec3(this.#offsetMax);
				break;
			case 'm_bLocalCoords':
				console.error('do this param', paramName, param);
				this.#localCoords = param;
				break;
			case 'm_bNormalize':
				console.error('do this param', paramName, param);
				this.#normalize = param.getValueAsBool() ?? false;// TODO: check default value
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
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

	initMultipleOverride() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_INIT_NormalOffset', NormalOffset);
