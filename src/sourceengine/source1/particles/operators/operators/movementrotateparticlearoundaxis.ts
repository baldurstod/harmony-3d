import { mat4, quat, vec3 } from 'gl-matrix';
import { DEG_TO_RAD } from '../../../../../math/constants';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT, PARAM_TYPE_INT, PARAM_TYPE_VECTOR } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../source1particleoperators';
import { SourceEngineParticleSystem } from '../../source1particlesystem';
import { SourceEngineParticleOperator } from '../operator';

const tempVec3 = vec3.create();

export class MovementRotateParticleAroundAxis extends SourceEngineParticleOperator {
	static functionName = 'Movement Rotate Particle Around Axis';
	once = true;

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('Rotation Axis', PARAM_TYPE_VECTOR, vec3.fromValues(0, 0, 1));
		this.addParam('Rotation Rate', PARAM_TYPE_FLOAT, 180);
		this.addParam('Control Point', PARAM_TYPE_INT, 0);
		this.addParam('Use Local Space', PARAM_TYPE_BOOL, 0);
		/*
		DMXELEMENT_UNPACK_FIELD( "Rotation Axis", "0 0 1", Vector, m_vecRotAxis )
		DMXELEMENT_UNPACK_FIELD( "Rotation Rate", "180", float, m_flRotRate )
		DMXELEMENT_UNPACK_FIELD( "Control Point", "0", int, m_nCP )
		DMXELEMENT_UNPACK_FIELD( "Use Local Space", "0", bool, m_bLocalSpace )*/
	}

	doOperate(particle: SourceEngineParticle, elapsedTime: number) {
		const axis = this.getParameter('Rotation Axis');
		const rate = this.getParameter('Rotation Rate');
		const useLocalSpace = this.getParameter('Use Local Space');
		const controlPointNumber = this.getParameter('Control Point');

		const modelView = mat4.create();
		mat4.identity(modelView);

		const q = quat.create();//TODO: memory

		const cp = particle.system.getControlPoint(controlPointNumber);
		if (cp) {
			if (useLocalSpace == 1) {
				quat.copy(q, cp.getWorldQuaternion());
			}

			cp.getWorldPosition(tempVec3);
			vec3.sub(particle.position, particle.position, tempVec3);
			vec3.sub(particle.prevPosition, particle.prevPosition, tempVec3);

			const axis2 = vec3.clone(axis);//TODO: memory

			if (useLocalSpace == 1) {
				/*const a = axis2[1];
				axis2[1] = axis2[2];
				axis2[2] = a;*/
			}
			//axis2[1] = -axis2[1];
			//const tempQuat = quat.fromEuler(quat.create(), vec3.scale(vec3.create(), vec3.normalize(vec3.create(), axis), Math.HALF_PI));
			//quat.mul(tempQuat, tempQuat, q);
			//quat.fromEuler7(axis2, tempQuat);
			vec3.transformQuat(axis2, axis2, q);


			mat4.rotate(modelView, modelView, DEG_TO_RAD * (rate * elapsedTime), axis2);
			vec3.transformMat4(particle.position, particle.position, modelView);
			vec3.add(particle.position, particle.position, tempVec3);

			vec3.transformMat4(particle.prevPosition, particle.prevPosition, modelView);
			vec3.add(particle.prevPosition, particle.prevPosition, tempVec3);
		} else {
			mat4.rotate(modelView, modelView, DEG_TO_RAD * (rate * elapsedTime), axis);
			vec3.transformMat4(particle.position, particle.position, modelView);
		}
	}
}
SourceEngineParticleOperators.registerOperator(MovementRotateParticleAroundAxis);
