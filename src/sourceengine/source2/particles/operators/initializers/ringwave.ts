import { vec3 } from 'gl-matrix';
import { DEG_TO_RAD, TWO_PI } from '../../../../../math/constants';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const va = vec3.create();
const o = vec3.create();

const DEFAULT_EVEN_DISTRIBUTION = false;// TODO: check default value
const DEFAULT_XY_VELOCITY_ONLY = true;// TODO: check default value

export class RingWave extends Operator {
	#evenDistribution = DEFAULT_EVEN_DISTRIBUTION;
	#xyVelocityOnly = DEFAULT_XY_VELOCITY_ONLY;
	t = 0;

	override _paramChanged(paramName: string, param: OperatorParam): void {
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
				this.#evenDistribution = param.getValueAsBool() ?? DEFAULT_EVEN_DISTRIBUTION;
				break;
			case 'm_bXYVelocityOnly':
				this.#xyVelocityOnly = param.getValueAsBool() ?? DEFAULT_XY_VELOCITY_ONLY;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle: Source2Particle): void {
		//TODO: use all parameters
		const particlesPerOrbit = this.getParamScalarValue('m_flParticlesPerOrbit') ?? -1;//even distribution count
		const initialRadius = this.getParamScalarValue('m_flInitialRadius') ?? 0;
		//const thickness = this.getParamScalarValue('m_flThickness') ?? 0;
		//const initialSpeedMin = this.getParamScalarValue('m_flInitialSpeedMin') ?? 0;
		//const initialSpeedMax = this.getParamScalarValue('m_flInitialSpeedMax') ?? 0;
		const roll = this.getParamScalarValue('m_flRoll') ?? 0;
		const pitch = this.getParamScalarValue('m_flPitch') ?? 0;
		const yaw = this.getParamScalarValue('m_flYaw') ?? 0;

		let theta;
		if (this.#evenDistribution) {
			const step = particlesPerOrbit == -1 ? TWO_PI / this.system.livingParticles.length : TWO_PI / particlesPerOrbit;
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

		const controlPoint = this.system.getControlPoint(this.controlPointNumber);
		if (controlPoint) {
			vec3.transformMat4(va, va, controlPoint.currentWorldTransformation);
		}

		vec3.copy(particle.position, va);
		vec3.copy(particle.prevPosition, va);
	}
}
RegisterSource2ParticleOperator('C_INIT_RingWave', RingWave);
