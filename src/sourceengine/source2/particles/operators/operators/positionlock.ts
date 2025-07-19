import { vec3 } from 'gl-matrix';
import { RandomFloatExp, clamp } from '../../../../../math/functions';
import { Source2ParticleSystem } from '../../export';
import { Operator, Source2OperatorParamValue } from '../operator';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2Particle } from '../../source2particle';

const tempPrevPos = vec3.create();
const tempPos = vec3.create();
//const tempQuat = quat.create();
const vec = vec3.create();

export class PositionLock extends Operator {
	#startTimeMin = 1;
	#startTimeMax = 1;
	#startTimeExp = 1;
	#endTimeMin = 1;
	#endTimeMax = 1;
	#endTimeExp = 1;
	#range = 0;
	#jumpThreshold = 512;
	#prevPosScale = 1;
	#lockRot = false;
	#startFadeOutTime = 0;
	#endFadeOutTime = 0;

	constructor(system: Source2ParticleSystem) {
		super(system);
		this._update();
	}

	_update() {
		//TODO: this is wrong: must be done per particle
		this.#startFadeOutTime = RandomFloatExp(this.#startTimeMin, this.#startTimeMax, this.#startTimeExp);
		this.#endFadeOutTime = RandomFloatExp(this.#endTimeMin, this.#endTimeMax, this.#endTimeExp);
	}

	_paramChanged(paramName: string, value: Source2OperatorParamValue) {
		switch (paramName) {
			case 'm_flStartTime_min':
				this.#startTimeMin = value;
				this._update();
				break;
			case 'm_flStartTime_max':
				this.#startTimeMax = value;
				this._update();
				break;
			case 'm_flStartTime_exp':
				this.#startTimeExp = value;
				this._update();
				break;
			case 'm_flEndTime_min':
				this.#endTimeMin = value;
				this._update();
				break;
			case 'm_flEndTime_max':
				this.#endTimeMax = value;
				this._update();
				break;
			case 'm_flEndTime_exp':
				this.#endTimeExp = value;
				this._update();
				break;
			case 'm_flRange':
				this.#range = value;
				break;
			case 'm_flJumpThreshold':
				this.#jumpThreshold = value;
				break;
			case 'm_flPrevPosScale':
				this.#prevPosScale = value;
				break;
			case 'm_bLockRot':
				this.#lockRot = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const proportionOfLife = clamp(particle.proportionOfLife, 0, 1);
		if (proportionOfLife > this.#endFadeOutTime) {
			return;
		}

		const cp = this.system.getControlPoint(this.controlPointNumber);
		if (cp) {
			let delta;
			/*	if (!particle.initialCPPosition) {
					particle.initialCPPosition = vec3.clone(cp.getWorldPosition(vec));
				} else {
					vec3.copy(particle.initialCPPosition, particle.cpPosition);
				}

				particle.cpPosition = vec3.clone(cp.getWorldPosition(vec));

				let delta = vec3.subtract(vec3.create(), particle.cpPosition, particle.initialCPPosition);

				const deltaL = vec3.length(delta);
				particle.deltaL = particle.deltaL ?? 0;
				particle.deltaL += deltaL;

				//console.log(deltaL);
				if (this.range != 0 && particle.deltaL > this.range) {
					particle.posLockedToCP = -1;
				}*/

			//TODO: use m_flRange and other parameters
			if (this.#lockRot) {
				delta = cp.deltaWorldTransformation;
				vec3.transformMat4(particle.position, particle.position, delta);
				vec3.transformMat4(particle.prevPosition, particle.prevPosition, delta);
				//TODO: do LockStrength
			} else {
				delta = cp.deltaWorldPosition;
				vec3.add(particle.position, particle.position, delta);
				vec3.add(particle.prevPosition, particle.prevPosition, delta);
			}
		}
	}
}
RegisterSource2ParticleOperator('C_OP_PositionLock', PositionLock);
