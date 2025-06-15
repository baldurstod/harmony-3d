import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_POSITION_PREVIOUS, PARTICLE_FIELD_POSITION } from '../../../../common/particles/particlefields';

//const tempMat4 = mat4.create();
const tempPrevPos = vec3.create();
const tempPos = vec3.create();
const v = vec3.create();

export class MovementRigidAttachToCP extends Operator {
	scaleControlPoint = -1;
	scaleCPField = 0;//-1: disabled, 0: X, 1: Y, 2 :Z
	fieldInput = PARTICLE_FIELD_POSITION_PREVIOUS;
	fieldOutput = PARTICLE_FIELD_POSITION;
	offsetLocal = true;
	constructor(system) {
		super(system);
	}

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nScaleControlPoint':
				this.scaleControlPoint = Number(value);
				break;
			case 'm_nScaleCPField':
				this.scaleCPField = Number(value);
				break;
			case 'm_bOffsetLocal':
				this.offsetLocal = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		//TODO: use scale cp and other parameters
		const cp = this.system.getControlPoint(this.controlPointNumber);
		if (cp) {
			/*if (!particle.initialCPPosition) {
				particle.initialCPPosition = vec3.clone(cp.getWorldPosition(vec));
			} else {
				vec3.copy(particle.initialCPPosition, particle.cpPosition);
			}

			particle.cpPosition = vec3.clone(cp.getWorldPosition(vec));

			const delta = vec3.subtract(vec3.create(), particle.cpPosition, particle.initialCPPosition);

			const deltaL = vec3.length(delta);
			particle.deltaL = particle.deltaL ?? 0;
			particle.deltaL += deltaL;

			//console.log(deltaL);
			if (this.range != 0 && particle.deltaL > this.range) {
				particle.posLockedToCP = -1;
			}

			mat4.invert(tempMat4, particle.cpPreviousTransform);

			let currentTransform = cp.getWorldTransformation(particle.cpPreviousTransform);//store the current tranform in the previous transform since we won't use it further
			mat4.mul(tempMat4, currentTransform, tempMat4);


			vec3.transformMat4(particle.position, particle.position, tempMat4);
			vec3.transformMat4(particle.prevPosition, particle.prevPosition, tempMat4);*/

			let delta;
			if (!particle.MovementRigidAttachToCP) {
				//TODO: this is dumb. try to do it better
				delta = cp.currentWorldTransformation;
				particle.MovementRigidAttachToCP = true;
			} else {
				delta = cp.deltaWorldTransformation;

			}
			//vec3.transformMat4(particle.position, particle.position, delta);
			//vec3.transformMat4(particle.prevPosition, particle.prevPosition, delta);

			vec3.transformMat4(v, particle.getField(this.fieldInput), delta);
			particle.setField(this.fieldInput, v);
			particle.setField(this.fieldOutput, v);

		}
	}
}
RegisterSource2ParticleOperator('C_OP_MovementRigidAttachToCP', MovementRigidAttachToCP);
