import { quat, vec3, vec4 } from 'gl-matrix';

import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT, PARAM_TYPE_INT } from '../../constants';
import { ERROR } from '../../../../../buildoptions';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';

export class MovementLocktoControlPoint extends SourceEngineParticleOperator {
	static functionName = 'Movement Lock to Control Point';
	static once;

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('control_point_number', PARAM_TYPE_INT, 0);
		this.addParam('distance fade range', PARAM_TYPE_INT, 0);

		this.addParam('start_fadeout_min', PARAM_TYPE_FLOAT, 1);
		this.addParam('start_fadeout_max', PARAM_TYPE_FLOAT, 1);
		this.addParam('start_fadeout_exponent', PARAM_TYPE_FLOAT, 0);
		this.addParam('end_fadeout_min', PARAM_TYPE_FLOAT, 1);
		this.addParam('end_fadeout_max', PARAM_TYPE_FLOAT, 1);
		this.addParam('lock rotation', PARAM_TYPE_BOOL, false);

				/*'start_fadeout_min' 'float' '0.1000000015'
				'start_fadeout_max' 'float' '0.200000003'
				'start_fadeout_exponent' 'float' '1'
				'end_fadeout_min' 'float' '0.3000000119'
				'end_fadeout_max' 'float' '0.400000006'*/
	}

	doOperate(particle, elapsedTime) {
		if (!MovementLocktoControlPoint.once) {
			if (ERROR) {console.error('Fix me');}
			MovementLocktoControlPoint.once = true;
		}
		//return;
		if (particle.posLockedToCP == -1) {
			return;
		}

		const start_fadeout_min = this.getParameter('start_fadeout_min');
		const start_fadeout_max = this.getParameter('start_fadeout_max');
		const end_fadeout_min = this.getParameter('end_fadeout_min');
		const end_fadeout_max = this.getParameter('end_fadeout_max');
		const lockRotation = this.getParameter('lock rotation');

		const start_fadeout = (start_fadeout_max - start_fadeout_min) * Math.random() + start_fadeout_min;
		const end_fadeout = (end_fadeout_max - end_fadeout_min) * Math.random() + end_fadeout_min;


		switch (true)
		{
			case end_fadeout ==1:
				break;
			case particle.proportionOfLife >= end_fadeout:
				particle.posLockedToCP = -1;
				break;
			default:
				break;
		}

		const cpNumber = this.getParameter('control_point_number');
		const distanceFadeRange = this.getParameter('distance fade range');

		const cp = this.particleSystem.getControlPoint(cpNumber);
		if (cp) {
			if (!particle.initialCPPosition) {
				particle.initialCPPosition = cp.getWorldPosition();
			} else {
				particle.initialCPPosition = vec3.clone(particle.cpPosition);
			}
			if (!particle.initialCPQuaternion) {
				particle.initialCPQuaternion = cp.getWorldQuaternion();
			} else {
				particle.initialCPQuaternion = quat.clone(particle.cpOrientation);
			}

			particle.cpPosition = cp.getWorldPosition();
			particle.cpOrientation = cp.getWorldQuaternion();

			const invertQuat = quat.invert(quat.create(), particle.initialCPQuaternion);//TODO: optimize

			const delta = vec3.subtract(vec3.create(), particle.cpPosition, particle.initialCPPosition);//TODO: optimize
			const deltaQuaternion = quat.mul(quat.create(), particle.cpOrientation, invertQuat);
			quat.normalize(deltaQuaternion, deltaQuaternion);

			const deltaL = vec3.length(delta);
			particle.deltaL = particle.deltaL || 0;
			particle.deltaL += deltaL;

			//console.log(deltaL);
			if (distanceFadeRange != 0 && particle.deltaL > distanceFadeRange) {
				particle.posLockedToCP = -1;
			}

			const oldPosition = vec3.clone(particle.position);
			const delta2 = vec3.sub(vec3.create(), particle.position, particle.cpPosition);
			const delta3 = vec3.sub(vec3.create(), particle.prevPosition, particle.cpPosition);
			vec3.transformQuat(delta2, delta2, deltaQuaternion);
			vec3.transformQuat(delta3, delta3, deltaQuaternion);
			vec3.add(particle.position, particle.cpPosition, delta2);
			vec3.add(particle.prevPosition, particle.cpPosition, delta3);

			vec3.add(particle.position, particle.position, delta);
			vec3.add(particle.prevPosition, particle.prevPosition, delta);
			if (lockRotation) {
				particle.cpOrientation = quat.clone(cp.getWorldQuaternion());
				//TODO
			} else {
				vec4.zero(particle.cpOrientation);
			}
		}
		if (particle.PositionFromParentParticles) {
			particle.PositionFromParentParticles = false;
		}
	}
}
SourceEngineParticleOperators.registerOperator(MovementLocktoControlPoint);


//TODO: postion lock to controlpoint
//SourceEngineParticleOperators.registerOperator('postion lock to controlpoint', MovementLocktoControlPoint);

/*
Movement Lock to Controlpoint
Forces the position of a particle to that of some control point on the emitter.

start_fadeout_min
Bottom range of time to start fading out the lock (leave the particle behind).
start_fadeout_max
Top range of time to start fading out the lock (leave the particle behind).
end_fadeout_min
Bottom range of time to end fading out the lock. Particle will be fully disengaged from the control points movement at this point.
end_fadeout_max
Top range of time to end fading out the lock. Particle will be fully disengaged from the control points movement at this point.
start/end exponents
Bias on the selection within the range.
control point number
Which control point to lock to
fade distance
Particles will detach as they approach this distance
lock rotation
This will update a particle relative to a Control Point's rotation as well as position.
*/
