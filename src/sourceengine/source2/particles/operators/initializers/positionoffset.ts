import { vec3 } from 'gl-matrix';
import { vec3RandomBox } from '../../../../../math/functions';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_OFFSET = vec3.create();

const offset = vec3.create();

export class PositionOffset extends Operator {
	localCoords = false;
	proportional = false;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_OffsetMin':
			case 'm_OffsetMax':
				break;
			case 'm_bLocalCoords':
				this.localCoords = param;
				break;
			case 'm_bProportional':
				this.proportional = param;
				break;
			default:
				super._paramChanged(paramName, param);
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
