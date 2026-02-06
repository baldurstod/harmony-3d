import { vec3 } from 'gl-matrix';
import { RandomFloatExp, clamp } from '../../../../../math/functions';
import { Source2ParticleSystem } from '../../export';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

//const tempPrevPos = vec3.create();
//const tempPos = vec3.create();
//const tempQuat = quat.create();
//const vec = vec3.create();

const DEFAULT_JUMP_THRESHOLD = 512;
const DEFAULT_RANGE = 0;// TODO: check default value
const DEFAULT_START_TIME_MIN = 1;// TODO: check default value
const DEFAULT_START_TIME_MAX = 1;// TODO: check default value
const DEFAULT_START_TIME_EXP = 1;// TODO: check default value
const DEFAULT_END_TIME_MIN = 1;// TODO: check default value
const DEFAULT_END_TIME_MAX = 1;// TODO: check default value
const DEFAULT_END_TIME_EXP = 1;// TODO: check default value
const DEFAULT_PREV_POS_SCALE = 1;
const DEFAULT_LOCK_ROT = false;// TODO: check default value
const DEFAULT_START_FADE_OUT_TIME = 0;// TODO: check default value
const DEFAULT_END_FADE_OUT_TIME = 0;// TODO: check default value

export class PositionLock extends Operator {//Movement lock to control point
	#startTimeMin = DEFAULT_START_TIME_MIN;
	#startTimeMax = DEFAULT_START_TIME_MAX;
	#startTimeExp = DEFAULT_START_TIME_EXP;
	#endTimeMin = DEFAULT_END_TIME_MIN;
	#endTimeMax = DEFAULT_END_TIME_MAX;
	#endTimeExp = DEFAULT_END_TIME_EXP;
	#range = DEFAULT_RANGE;
	#jumpThreshold = DEFAULT_JUMP_THRESHOLD;
	#prevPosScale = DEFAULT_PREV_POS_SCALE;
	#lockRot = DEFAULT_LOCK_ROT;
	#startFadeOutTime = DEFAULT_START_FADE_OUT_TIME;
	#endFadeOutTime = DEFAULT_END_FADE_OUT_TIME;

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.#update();
	}

	#update():void {
		//TODO: this is wrong: must be done per particle
		this.#startFadeOutTime = RandomFloatExp(this.#startTimeMin, this.#startTimeMax, this.#startTimeExp);
		this.#endFadeOutTime = RandomFloatExp(this.#endTimeMin, this.#endTimeMax, this.#endTimeExp);
	}

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flStartTime_min':
				this.#startTimeMin = param.getValueAsNumber() ?? DEFAULT_START_TIME_MIN;
				this.#update();
				break;
			case 'm_flStartTime_max':
				this.#startTimeMax = param.getValueAsNumber() ?? DEFAULT_START_TIME_MAX;
				this.#update();
				break;
			case 'm_flStartTime_exp':
				this.#startTimeExp = param.getValueAsNumber() ?? DEFAULT_START_TIME_EXP;
				this.#update();
				break;
			case 'm_flEndTime_min':
				this.#endTimeMin = param.getValueAsNumber() ?? DEFAULT_END_TIME_MIN;
				this.#update();
				break;
			case 'm_flEndTime_max':
				this.#endTimeMax = param.getValueAsNumber() ?? DEFAULT_END_TIME_MAX;
				this.#update();
				break;
			case 'm_flEndTime_exp':
				this.#endTimeExp = param.getValueAsNumber() ?? DEFAULT_END_TIME_EXP;
				this.#update();
				break;
			case 'm_flRange':// TODO: mutualize ?
				this.#range = param.getValueAsNumber() ?? DEFAULT_RANGE;
				break;
			case 'm_flJumpThreshold':// TODO: mutualize ?
				this.#jumpThreshold = param.getValueAsNumber() ?? DEFAULT_JUMP_THRESHOLD;
				break;
			case 'm_flPrevPosScale':
				this.#prevPosScale = param.getValueAsNumber() ?? DEFAULT_PREV_POS_SCALE;
				break;
			case 'm_bLockRot':
				this.#lockRot = param.getValueAsBool() ?? false;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(particle: Source2Particle): void {
		// TODO: use jumpThreshold
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
