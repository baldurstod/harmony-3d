import { quat, vec3 } from 'gl-matrix';
import { RemapValClamped } from '../../../../../math/functions';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT, PARAM_TYPE_INT, PARAM_TYPE_VECTOR3 } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

const tempQuat = quat.create();
const tempVec3 = vec3.create();
const tempVec3_2 = vec3.create();

export class RemapScalarToVector extends SourceEngineParticleOperator {
	static functionName = 'Remap Scalar to Vector';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('emitter lifetime start time (seconds)', PARAM_TYPE_FLOAT, -1);
		this.addParam('emitter lifetime end time (seconds)', PARAM_TYPE_FLOAT, -1);

		this.addParam('input field', PARAM_TYPE_INT, 8);
		this.addParam('input minimum', PARAM_TYPE_FLOAT, 0);
		this.addParam('input maximum', PARAM_TYPE_FLOAT, 1);

		this.addParam('output field', PARAM_TYPE_INT, 0);
		this.addParam('output minimum', PARAM_TYPE_VECTOR3, vec3.create());
		this.addParam('output maximum', PARAM_TYPE_VECTOR3, vec3.fromValues(1, 1, 1));

		this.addParam('output is scalar of initial random range', PARAM_TYPE_BOOL, 0);

		this.addParam('use local system', PARAM_TYPE_BOOL, 1);
		this.addParam('control_point_number', PARAM_TYPE_INT, 0);
	}

	doInit(particle: SourceEngineParticle, elapsedTime: number) {
		const m_flStartTime = this.getParameter('emitter lifetime start time (seconds)');
		const m_flEndTime = this.getParameter('emitter lifetime end time (seconds)');

		const m_nControlPointNumber = this.getParameter('control_point_number');

		const m_nFieldInput = this.getParameter('input field');
		const m_flInputMin = this.getParameter('input minimum');
		const m_flInputMax = this.getParameter('input maximum');

		const m_nFieldOutput = this.getParameter('output field');
		const m_vecOutputMin = this.getParameter('output minimum');
		const m_vecOutputMax = this.getParameter('output maximum');

		const m_bLocalCoords = this.getParameter('use local system');

		if ((m_flStartTime != -1) && (m_flStartTime != -1) && ((particle.currentTime < m_flStartTime) || (particle.currentTime >= m_flEndTime))) {
			return;
		}

		const input = particle.getField(m_nFieldInput);
		tempVec3[0] = RemapValClamped(input, m_flInputMin, m_flInputMax, m_vecOutputMin[0], m_vecOutputMax[0]);
		tempVec3[1] = RemapValClamped(input, m_flInputMin, m_flInputMax, m_vecOutputMin[1], m_vecOutputMax[1]);
		tempVec3[2] = RemapValClamped(input, m_flInputMin, m_flInputMax, m_vecOutputMin[2], m_vecOutputMax[2]);

		const cp = this.particleSystem.getControlPoint(m_nControlPointNumber);
		if (m_nFieldOutput == 0) { // Position
			if (!m_bLocalCoords) {
				vec3.add(tempVec3, cp.getWorldPosition(tempVec3_2), tempVec3);
			} else {
				if (cp) {
					cp.getWorldQuaternion(tempQuat);
					vec3.transformQuat(tempVec3, tempVec3, tempQuat);
					vec3.add(tempVec3, cp.getWorldPosition(tempVec3_2), tempVec3);
				}
				particle.setField(0, tempVec3);//position
				particle.setField(2, tempVec3);//previous position
			}
		} else {
			throw 'code me';
		}
	}

	initMultipleOverride() {
		return true;
	}
}

SourceEngineParticleOperators.registerOperator(RemapScalarToVector);
