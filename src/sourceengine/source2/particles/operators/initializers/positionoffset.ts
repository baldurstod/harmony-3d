import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { vec3RandomBox } from '../../../../../math/functions';

const DEFAULT_OFFSET = vec3.create();

const offset = vec3.create();

export class PositionOffset extends Operator {
	localCoords = false;
	proportional = false;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_OffsetMin':
			case 'm_OffsetMax':
				break;
			case 'm_bLocalCoords':
				this.localCoords = value;
				break;
			case 'm_bProportional':
				this.proportional = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		const offsetMin = this.getParamVectorValue('m_OffsetMin') ?? DEFAULT_OFFSET;
		const offsetMax = this.getParamVectorValue('m_OffsetMax') ?? DEFAULT_OFFSET;

		vec3RandomBox(offset, offsetMin, offsetMax);

		if (this.localCoords) {

			const cp = particle.system.getControlPoint(this.controlPointNumber);
			if (cp) {
				vec3.transformQuat(offset, offset, cp.getWorldQuaternion());
			}
		}
		vec3.add(particle.position, particle.position, offset);
		vec3.add(particle.prevPosition, particle.prevPosition, offset);
	}

	initMultipleOverride() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_INIT_PositionOffset', PositionOffset);
