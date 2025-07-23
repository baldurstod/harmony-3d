import { vec3 } from 'gl-matrix';
import { vec3RandomBox } from '../../../../../math/functions';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_SPEED = vec3.create();
const randomVector = vec3.create();
const tempVec3 = vec3.create();

export class VelocityRandom extends Operator {
	ignoreDT = false;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_LocalCoordinateSystemSpeedMin':
			case 'm_LocalCoordinateSystemSpeedMax':
			case 'm_fSpeedMin':
			case 'm_fSpeedMax':
				break;
			case 'm_bIgnoreDT':
				this.ignoreDT = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime) {
		const localCoordinateSystemSpeedMin = this.getParamVectorValue('m_LocalCoordinateSystemSpeedMin') ?? DEFAULT_SPEED;
		const localCoordinateSystemSpeedMax = this.getParamVectorValue('m_LocalCoordinateSystemSpeedMax') ?? DEFAULT_SPEED;
		const speedMin = this.getParamScalarValue('m_fSpeedMin') ?? 0;
		const speedMax = this.getParamScalarValue('m_fSpeedMax') ?? 0;

		const randomSpeed = (speedMax - speedMin) * Math.random() + speedMin;

		if (vec3.exactEquals(localCoordinateSystemSpeedMin, DEFAULT_SPEED) &&
			vec3.exactEquals(localCoordinateSystemSpeedMax, DEFAULT_SPEED)) {
			vec3.random(randomVector);
		} else {
			vec3RandomBox(randomVector, localCoordinateSystemSpeedMin, localCoordinateSystemSpeedMax);
		}

		if (randomSpeed != 0) {
			vec3.random(tempVec3, randomSpeed);
			vec3.add(randomVector, randomVector, tempVec3);
		}

		const cp = particle.system.getControlPoint(this.controlPointNumber);
		if (cp) {
			vec3.transformQuat(randomVector, randomVector, cp.getWorldQuaternion());
		}
		if (!this.ignoreDT) {
			vec3.scale(randomVector, randomVector, -elapsedTime);
		}
		vec3.add(particle.prevPosition, particle.prevPosition, randomVector);
	}

	initMultipleOverride() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_INIT_VelocityRandom', VelocityRandom);
