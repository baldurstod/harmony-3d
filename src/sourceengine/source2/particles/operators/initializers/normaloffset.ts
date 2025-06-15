import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { vec3RandomBox } from '../../../../../math/functions';

const v = vec3.create();

export class NormalOffset extends Operator {
	offsetMin = vec3.create();
	offsetMax = vec3.create();
	localCoords = false;
	normalize = false;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_OffsetMin':
				vec3.copy(this.offsetMin, value);
				break;
			case 'm_OffsetMax':
				vec3.copy(this.offsetMax, value);
				break;
			case 'm_bLocalCoords':
				this.localCoords = value;
				break;
			case 'm_bNormalize':
				this.normalize = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		vec3RandomBox(v, this.offsetMin, this.offsetMax);

		if (this.localCoords) {
			const cp = this.system.getControlPoint(this.controlPointNumber);
			vec3.transformQuat(v, v, cp.currentWorldQuaternion);
		}

		vec3.add(particle.normal, particle.normal, v);

		if (this.normalize) {
			vec3.normalize(particle.normal, particle.normal);
		}
	}

	initMultipleOverride() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_INIT_NormalOffset', NormalOffset);
