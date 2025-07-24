import { vec3, vec4 } from 'gl-matrix';
import { vec3RandomBox } from '../../../../../math/functions';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2Particle } from '../../source2particle';

const DEFAULT_SPEED = vec3.create();
const randomVector = vec3.create();
const tempVec3 = vec3.create();

const velocityRandomTempVec4_0 = vec4.create();
const velocityRandomTempVec4_1 = vec4.create();

const DEFAULT_IGNORE_DT = false;// TODO: check default value

export class VelocityRandom extends Operator {
	#ignoreDT = DEFAULT_IGNORE_DT;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_LocalCoordinateSystemSpeedMin':
			case 'm_LocalCoordinateSystemSpeedMax':
			case 'm_fSpeedMin':
			case 'm_fSpeedMax':
				// used in doInit
				break;
			case 'm_bIgnoreDT':
				console.error('do this param', paramName, param, this.constructor.name);
				this.#ignoreDT = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const localCoordinateSystemSpeedMin = this.getParamVectorValue(velocityRandomTempVec4_0, 'm_LocalCoordinateSystemSpeedMin', particle) ?? DEFAULT_SPEED;
		const localCoordinateSystemSpeedMax = this.getParamVectorValue(velocityRandomTempVec4_1, 'm_LocalCoordinateSystemSpeedMax', particle) ?? DEFAULT_SPEED;
		const speedMin = this.getParamScalarValue('m_fSpeedMin') ?? 0;
		const speedMax = this.getParamScalarValue('m_fSpeedMax') ?? 0;

		const randomSpeed = (speedMax - speedMin) * Math.random() + speedMin;

		if (vec3.exactEquals(localCoordinateSystemSpeedMin as vec3, DEFAULT_SPEED) &&
			vec3.exactEquals(localCoordinateSystemSpeedMax as vec3, DEFAULT_SPEED)) {
			vec3.random(randomVector);
		} else {
			vec3RandomBox(randomVector, localCoordinateSystemSpeedMin as vec3, localCoordinateSystemSpeedMax as vec3);
		}

		if (randomSpeed != 0) {
			vec3.random(tempVec3, randomSpeed);
			vec3.add(randomVector, randomVector, tempVec3);
		}

		const cp = particle.system.getControlPoint(this.controlPointNumber);
		if (cp) {
			vec3.transformQuat(randomVector, randomVector, cp.getWorldQuaternion());
		}
		if (!this.#ignoreDT) {
			vec3.scale(randomVector, randomVector, -elapsedTime);
		}
		vec3.add(particle.prevPosition, particle.prevPosition, randomVector);
	}

	initMultipleOverride() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_INIT_VelocityRandom', VelocityRandom);
