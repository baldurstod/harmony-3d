import { vec3 } from 'gl-matrix';
import { PARTICLE_FIELD_POSITION, PARTICLE_FIELD_POSITION_PREVIOUS } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2Particle } from '../../source2particle';
import { Source2ParticleCpField, Source2ParticleVectorField } from '../../enums';

//const tempMat4 = mat4.create();
const tempPrevPos = vec3.create();
const tempPos = vec3.create();
const v = vec3.create();

const DEFAULT_SCALE_CONTROL_POINT = -1;//disabled
const DEFAULT_SCALE_CP_FIELD = Source2ParticleCpField.X;
const DEFAULT_FIELD_INPUT = Source2ParticleVectorField.PreviousPosition
const DEFAULT_FIELD_OUTPUT = Source2ParticleVectorField.Position;
const DEFAULT_OFFSET_LOCAL = true;

export class MovementRigidAttachToCP extends Operator {
	#scaleControlPoint = DEFAULT_SCALE_CONTROL_POINT;
	#scaleCPField = DEFAULT_SCALE_CP_FIELD;//-1: disabled, 0: X, 1: Y, 2 :Z
	#fieldInput = DEFAULT_FIELD_INPUT;
	#fieldOutput = DEFAULT_FIELD_OUTPUT;
	#offsetLocal = DEFAULT_OFFSET_LOCAL;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nScaleControlPoint':
				console.error('do this param', paramName, param);
				this.#scaleControlPoint = param.getValueAsNumber() ?? DEFAULT_SCALE_CONTROL_POINT;
				break;
			case 'm_nScaleCPField':
				this.#scaleCPField = param.getValueAsNumber() ?? DEFAULT_SCALE_CP_FIELD;
				break;
			case 'm_nFieldInput':
				this.#fieldInput = param.getValueAsNumber() ?? DEFAULT_FIELD_INPUT;
				break;
			case 'm_nFieldOutput':
				this.#fieldOutput = param.getValueAsNumber() ?? DEFAULT_FIELD_OUTPUT;
				break;
			case 'm_bOffsetLocal':
				this.#offsetLocal = param.getValueAsBool() ?? DEFAULT_OFFSET_LOCAL;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
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

			vec3.transformMat4(v, particle.getField(this.#fieldInput) as vec3, delta);
			particle.setField(this.#fieldInput, v);
			particle.setField(this.#fieldOutput, v);

		}
	}
}
RegisterSource2ParticleOperator('C_OP_MovementRigidAttachToCP', MovementRigidAttachToCP);
