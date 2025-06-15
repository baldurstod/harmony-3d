import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { vec3RandomBox, lerp, RandomVectorInUnitSphere, RandomFloatExp } from '../../../../../math/functions';

const DEFAULT_SPEED = vec3.create();
const DEFAULT_DISTANCE_BIAS = vec3.fromValues(1, 1, 1);

const vec = vec3.create();

export class CreateWithinSphere extends Operator {
	distanceBias = vec3.fromValues(1, 1, 1);
	distanceBiasAbs = vec3.create();
	speedRandExp = 1;
	localCoords = false;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_LocalCoordinateSystemSpeedMin':
			case 'm_LocalCoordinateSystemSpeedMax':
			case 'm_fRadiusMin':
			case 'm_fRadiusMax':
			case 'm_vecDistanceBias':
			case 'm_fSpeedMin':
			case 'm_fSpeedMax':
				break;
			case 'm_vecDistanceBiasAbs':
				vec3.copy(this.distanceBiasAbs, value);
				break;
			case 'm_fSpeedRandExp':
				this.speedRandExp = value;
				break;
			case 'm_bLocalCoords':
				this.localCoords = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		const localCoordinateSystemSpeedMin = this.getParamVectorValue('m_LocalCoordinateSystemSpeedMin') ?? DEFAULT_SPEED;
		const localCoordinateSystemSpeedMax = this.getParamVectorValue('m_LocalCoordinateSystemSpeedMax') ?? DEFAULT_SPEED;
		const m_vecDistanceBias = this.getParamVectorValue('m_vecDistanceBias') ?? DEFAULT_DISTANCE_BIAS;
		const radiusMin = this.getParamScalarValue('m_fRadiusMin') ?? 0;
		const radiusMax = this.getParamScalarValue('m_fRadiusMax') ?? 0;
		const speedMin = this.getParamScalarValue('m_fSpeedMin') ?? 0;
		const speedMax = this.getParamScalarValue('m_fSpeedMax') ?? 0;

		const m_vecDistanceBiasAbs = this.distanceBiasAbs;
		//const controlPointNumber = this.getParameter('control_point_number');

		const m_bDistanceBias = (m_vecDistanceBias[0] != 1.0) || (m_vecDistanceBias[1] != 1.0) || (m_vecDistanceBias[2] != 1.0);
		const m_bDistanceBiasAbs = (m_vecDistanceBiasAbs[0] != 0.0) || (m_vecDistanceBiasAbs[1] != 0.0) || (m_vecDistanceBiasAbs[2] != 0.0);

		const speed = RandomFloatExp(speedMin, speedMax, this.speedRandExp);//(speedMax - speedMin) * Math.random() + speedMin;

		const randpos = vec3.create();
		let cp;
		//for(int nTryCtr = 0 ; nTryCtr < 10; nTryCtr++)
		{
			const flLength = RandomVectorInUnitSphere(randpos);

			// Absolute value and biasing for creating hemispheres and ovoids.
			if (m_bDistanceBiasAbs	) {
				if (m_vecDistanceBiasAbs[0] != 0.0) {
					randpos[0] = Math.abs(randpos[0]);
				}
				if (m_vecDistanceBiasAbs[1] != 0.0) {
					randpos[1] = Math.abs(randpos[1]);
				}
				if (m_vecDistanceBiasAbs[2] != 0.0) {
					randpos[2] = Math.abs(randpos[2]);
				}
			}
			vec3.mul(randpos, randpos, m_vecDistanceBias);//randpos *= m_vecDistanceBias;
			vec3.normalize(randpos, randpos);//randpos.NormalizeInPlace();

			const randDir = vec3.clone(randpos);
			vec3.scale(randpos, randpos, lerp(radiusMin, radiusMax, flLength));

			if (!m_bDistanceBias || !this.localCoords) {
				/*Vector vecControlPoint;
				pParticles->GetControlPointAtTime(nCurrentControlPoint, *ct, &vecControlPoint);
				randpos += vecControlPoint;*/
				cp = particle.system.getControlPoint(this.controlPointNumber);
				if (cp) {
					vec3.add(randpos, randpos, cp.currentWorldPosition);
				}
			} else {
				/*matrix3x4_t mat;
				pParticles->GetControlPointTransformAtTime(nCurrentControlPoint, *ct, &mat);
				Vector vecTransformLocal = vec3_origin;
				VectorTransform(randpos, mat, vecTransformLocal);
				randpos = vecTransformLocal;*/

				cp = particle.system.getControlPoint(this.controlPointNumber);
				if (cp) {
					vec3.transformQuat(randpos, randpos, cp.currentWorldQuaternion);
					vec3.add(randpos, randpos, cp.currentWorldPosition);
				}
			}
		}



		//vec3.multiply(v, v, distance_bias);
		//vec3.add(particle.position, particle.position, v);
		//const cp = particle.system.getControlPoint(controlPointNumber);
		//vec3.add(particle.position, particle.position, cp.getWorldPosition(vec));
		if (cp) {
			//particle.cpOrientation = quat.clone(cp.getWorldQuaternion());
			//cp.getWorldTransformation(particle.cpPreviousTransform);
		}
		vec3.copy(particle.position, randpos);

		vec3RandomBox(particle.velocity, localCoordinateSystemSpeedMin, localCoordinateSystemSpeedMax);
		if (cp) {
			vec3.transformQuat(particle.velocity, particle.velocity, cp.currentWorldQuaternion);
		}
		if (speed) {
			const v = vec3.random(vec3.create(), speed);
			vec3.add(particle.velocity, particle.velocity, v);
			//vec3.add(randpos, randpos, v);
		}
		//quat.invert(particle.cpOrientationInvert, particle.cpOrientation);
		//vec3.transformQuat(particle.velocity, particle.velocity, particle.cpOrientation);
		const vGrav = vec3.clone(particle.velocity);
		particle.velocity[0] = vGrav[2];
		particle.velocity[1] = vGrav[1];
		particle.velocity[2] = -vGrav[0];
		particle.velocity[0] = vGrav[0];
		particle.velocity[1] = vGrav[1];
		particle.velocity[2] = vGrav[2];

		//particle.velocity[2] = -vGrav[2];

		//vec3.add(particle.prevPosition, particle.position, particle.velocity);//TODO: fix
		vec3.scaleAndAdd(randpos, randpos, particle.velocity, -elapsedTime);
		vec3.copy(particle.prevPosition, randpos);
	}
}
RegisterSource2ParticleOperator('C_INIT_CreateWithinSphere', CreateWithinSphere);
