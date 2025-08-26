import { vec2, vec3 } from 'gl-matrix';
import { vec3RandomBox } from '../../../../../math/functions';
import { PARAM_TYPE_BOOL, PARAM_TYPE_INT, PARAM_TYPE_VECTOR } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

const tempVec3 = vec3.create();

export class PositionModifyOffsetRandom extends SourceEngineParticleOperator {
	static functionName = 'Position Modify Offset Random';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('offset min', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('offset max', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('control_point_number', PARAM_TYPE_INT, 0);
		this.addParam('offset in local space 0/1', PARAM_TYPE_BOOL, 0);
		this.addParam('offset proportional to radius 0/1', PARAM_TYPE_BOOL, 0);
		//	DMXELEMENT_UNPACK_FIELD('control_point_number', '0', int, m_nControlPointNumber)
		//	DMXELEMENT_UNPACK_FIELD('offset min', '0 0 0', Vector, m_OffsetMin)
		//	DMXELEMENT_UNPACK_FIELD('offset max', '0 0 0', Vector, m_OffsetMax)
		//	DMXELEMENT_UNPACK_FIELD('offset in local space 0/1', '0', bool, m_bLocalCoords)
		//	DMXELEMENT_UNPACK_FIELD('offset proportional to radius 0/1', '0', bool, m_bProportional)
	}

	doInit(particle: SourceEngineParticle, elapsedTime: number): void {
		const localSpace = this.getParameter('offset in local space 0/1');
		const offsetMin = this.getParameter('offset min');
		const offsetMax = this.getParameter('offset max');
		vec2.random(vec2.create(), 1.0);
		const controlPointNumber = this.getParameter('control_point_number');

		const offset = vec3RandomBox(tempVec3, offsetMin, offsetMax);

		if (localSpace == 1) {

			const cp = particle.system.getControlPoint(controlPointNumber);
			if (cp) {
				vec3.transformQuat(offset, offset, cp.getWorldQuaternion());
			}
			/*const a = offset[1];
			offset[1] = offset[2];
			offset[2] = a;*/
			/*
// assume in2 is a rotation and rotate the input vector
void VectorRotate(const float *in1, const matrix3x4_t& in2, float *out)
{
	Assert(s_bMathlibInitialized);
	Assert(in1 != out);
	out[0] = DotProduct(in1, in2[0]);
	out[1] = DotProduct(in1, in2[1]);
	out[2] = DotProduct(in1, in2[2]);
}
*/
		}

		if (particle.initialVec) {
			particle.initialVecOffset = vec3.clone(offset);//TODO: optimize
		}

		vec3.add(particle.position, particle.position, offset);
		vec3.add(particle.prevPosition, particle.prevPosition, offset);
	}

	initMultipleOverride() {
		return true;
	}
}
SourceEngineParticleOperators.registerOperator(PositionModifyOffsetRandom);
