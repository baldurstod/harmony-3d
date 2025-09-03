import { quat, vec3 } from 'gl-matrix';
import { lerp, RandomVectorInUnitSphere, vec3RandomBox } from '../../../../../math/functions';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_INT, PARAM_TYPE_VECTOR } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

const tempVec3 = vec3.create();

export class PositionWithinSphereRandom extends Source1ParticleOperator {
	static functionName = 'Position Within Sphere Random';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('distance_min', PARAM_TYPE_FLOAT, 0);
		this.addParam('distance_max', PARAM_TYPE_FLOAT, 0);
		this.addParam('distance_bias', PARAM_TYPE_VECTOR, vec3.fromValues(1, 1, 1));
		this.addParam('distance_bias_absolute_value', PARAM_TYPE_VECTOR, vec3.fromValues(0, 0, 0));
		this.addParam('speed_in_local_coordinate_system_min', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('speed_in_local_coordinate_system_max', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('speed_min', PARAM_TYPE_FLOAT, 0);
		this.addParam('speed_max', PARAM_TYPE_FLOAT, 0);
		this.addParam('control_point_number', PARAM_TYPE_INT, 0);
		//	DMXELEMENT_UNPACK_FIELD('distance_min', '0', float, m_fRadiusMin)
		//	DMXELEMENT_UNPACK_FIELD('distance_max', '0', float, m_fRadiusMax)
		//	DMXELEMENT_UNPACK_FIELD('distance_bias', '1 1 1', Vector, m_vecDistanceBias)
		//	DMXELEMENT_UNPACK_FIELD('distance_bias_absolute_value', '0 0 0', Vector, m_vecDistanceBiasAbs)
		//	DMXELEMENT_UNPACK_FIELD('bias in local system', '0', bool, m_bLocalCoords)
		//	DMXELEMENT_UNPACK_FIELD('control_point_number', '0', int, m_nControlPointNumber)
		//	DMXELEMENT_UNPACK_FIELD('speed_min', '0', float, m_fSpeedMin)
		//	DMXELEMENT_UNPACK_FIELD('speed_max', '0', float, m_fSpeedMax)
		//	DMXELEMENT_UNPACK_FIELD('speed_random_exponent', '1', float, m_fSpeedRandExp)
		//	DMXELEMENT_UNPACK_FIELD('speed_in_local_coordinate_system_min', '0 0 0', Vector, m_LocalCoordinateSystemSpeedMin)
		//	DMXELEMENT_UNPACK_FIELD('speed_in_local_coordinate_system_max', '0 0 0', Vector, m_LocalCoordinateSystemSpeedMax)
		//	DMXELEMENT_UNPACK_FIELD('create in model', '0', int, m_nCreateInModel)
		//	DMXELEMENT_UNPACK_FIELD('randomly distribute to highest supplied Control Point', '0', bool, m_bUseHighestEndCP)
		//	DMXELEMENT_UNPACK_FIELD('randomly distribution growth time', '0', float, m_flEndCPGrowthTime)
	}

	doInit(particle: Source1Particle, elapsedTime: number): void {
		const m_fRadiusMin = this.getParameter('distance_min');
		const m_fRadiusMax = this.getParameter('distance_max');
		const speed_min = this.getParameter('speed_min');
		const speed_max = this.getParameter('speed_max');
		const m_vecDistanceBias = this.getParameter('distance_bias');
		const m_vecDistanceBiasAbs = this.getParameter('distance_bias_absolute_value');
		const controlPointNumber = this.getParameter('control_point_number');
		const m_bLocalCoords = this.getParameter('bias in local system');

		const m_bDistanceBias = (m_vecDistanceBias[0] != 1.0) || (m_vecDistanceBias[1] != 1.0) || (m_vecDistanceBias[2] != 1.0);
		const m_bDistanceBiasAbs = (m_vecDistanceBiasAbs[0] != 0.0) || (m_vecDistanceBiasAbs[1] != 0.0) || (m_vecDistanceBiasAbs[2] != 0.0);

		const speed_in_local_coordinate_system_min = this.getParameter('speed_in_local_coordinate_system_min');
		const speed_in_local_coordinate_system_max = this.getParameter('speed_in_local_coordinate_system_max');

		//const distance = (distance_max - distance_min) * Math.random() + distance_min;
		const speed = (speed_max - speed_min) * Math.random() + speed_min;

		//const v = vec3.random(vec3.create(), distance);
		//Lerp(flLength, m_fRadiusMin, m_fRadiusMax);


		const randpos = vec3.create();//, randDir;
		let cp;
		//for(int nTryCtr = 0 ; nTryCtr < 10; nTryCtr++)
		{
			const flLength = RandomVectorInUnitSphere(randpos);

			// Absolute value and biasing for creating hemispheres and ovoids.
			if (m_bDistanceBiasAbs) {
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
			vec3.scale(randpos, randpos, lerp(m_fRadiusMin, m_fRadiusMax, flLength));//randpos *= Lerp(flLength, m_fRadiusMin, m_fRadiusMax);

			if (!m_bDistanceBias || !m_bLocalCoords) {
				/*Vector vecControlPoint;
				pParticles->GetControlPointAtTime(nCurrentControlPoint, *ct, &vecControlPoint);
				randpos += vecControlPoint;*/
				cp = particle.system.getControlPoint(controlPointNumber);
				if (cp) {
					cp.getWorldPosition(tempVec3);
					vec3.add(randpos, randpos, tempVec3);
				}
			} else {
				/*matrix3x4_t mat;
				pParticles->GetControlPointTransformAtTime(nCurrentControlPoint, *ct, &mat);
				Vector vecTransformLocal = vec3_origin;
				VectorTransform(randpos, mat, vecTransformLocal);
				randpos = vecTransformLocal;*/

				cp = particle.system.getControlPoint(controlPointNumber);
				if (cp) {
					vec3.transformQuat(randpos, randpos, cp.getWorldQuaternion());
					cp.getWorldPosition(tempVec3);
					vec3.add(randpos, randpos, tempVec3);
				}
			}
		}



		//vec3.multiply(v, v, distance_bias);
		//vec3.add(particle.position, particle.position, v);
		//const cp = particle.system.getControlPoint(controlPointNumber);
		if (cp) {
			 cp.getWorldQuaternion(particle.cpOrientation);
		}
		vec3.copy(particle.position, randpos);

		vec3RandomBox(particle.velocity, speed_in_local_coordinate_system_min, speed_in_local_coordinate_system_max);//particle.velocity.randomize(speed_in_local_coordinate_system_min, speed_in_local_coordinate_system_max);
		particle.velocity[1] = -particle.velocity[1]; //For some reason y is inversed
		if (cp) {
			vec3.transformQuat(particle.velocity, particle.velocity, cp.getWorldQuaternion());
		}
		//vec3.transformQuat(particle.velocity, particle.velocity, particle.cpOrientation/*cp.getWorldQuaternion()*/);
		if (speed) {
			const v = vec3.random(vec3.create(), speed);
			vec3.add(particle.velocity, particle.velocity, v);
			//vec3.add(randpos, randpos, v);
		}
		quat.invert(particle.cpOrientationInvert, particle.cpOrientation);
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
		//vec3.scaleAndAdd(particle.position, particle.prevPosition, particle.velocity, 0.01);//TODO: fix
		//vec3.copy(particle.prevPosition, particle.position, particle.velocity);//TODO: fix
	}
}
Source1ParticleOperators.registerOperator(PositionWithinSphereRandom);
Source1ParticleOperators.registerOperator('Position Within Sphere', PositionWithinSphereRandom);
