import { vec3 } from 'gl-matrix';

import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { TWO_PI, DEG_TO_RAD } from '../../../../../math/constants';

let va = vec3.create();
let o = vec3.create();

export class RingWave extends Operator {
	evenDistribution = false;
	xyVelocityOnly = true;
	t = 0;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flParticlesPerOrbit':
			case 'm_flInitialRadius':
			case 'm_flThickness':
			case 'm_flInitialSpeedMin':
			case 'm_flInitialSpeedMax':
			case 'm_flRoll':
			case 'm_flPitch':
			case 'm_flYaw':
				break;
			case 'm_bEvenDistribution':
				this.evenDistribution = value;
				break;
			case 'm_bXYVelocityOnly':
				this.xyVelocityOnly = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		//TODO: use all parameters
		let particlesPerOrbit = this.getParamScalarValue('m_flParticlesPerOrbit') ?? -1;//even distribution count
		let initialRadius = this.getParamScalarValue('m_flInitialRadius') ?? 0;
		let thickness = this.getParamScalarValue('m_flThickness') ?? 0;
		let initialSpeedMin = this.getParamScalarValue('m_flInitialSpeedMin') ?? 0;
		let initialSpeedMax = this.getParamScalarValue('m_flInitialSpeedMax') ?? 0;
		let roll = this.getParamScalarValue('m_flRoll') ?? 0;
		let pitch = this.getParamScalarValue('m_flPitch') ?? 0;
		let yaw = this.getParamScalarValue('m_flYaw') ?? 0;

		let theta;
		if (this.evenDistribution) {
			let step = particlesPerOrbit == -1 ? TWO_PI / this.system.livingParticles.length : TWO_PI / particlesPerOrbit;
			this.t += step;
			theta = this.t;
		} else {
			theta = Math.random() * TWO_PI;
		}
		vec3.set(va, initialRadius * Math.cos(theta), initialRadius * Math.sin(theta), 0);

		if (roll) {
			vec3.rotateX(va, va, o, roll * DEG_TO_RAD);
		}
		if (pitch) {
			vec3.rotateY(va, va, o, pitch * DEG_TO_RAD);
		}
		if (yaw) {
			vec3.rotateZ(va, va, o, yaw * DEG_TO_RAD);
		}

		let controlPoint = this.system.getControlPoint(this.controlPointNumber);
		if (controlPoint) {
			vec3.transformMat4(va, va, controlPoint.currentWorldTransformation);
		}

		vec3.copy(particle.position, va);
		vec3.copy(particle.prevPosition, va);
	}
}
RegisterSource2ParticleOperator('C_INIT_RingWave', RingWave);
