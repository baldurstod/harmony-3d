import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { vec3RandomBox } from '../../../../../math/functions';
import { OperatorParam } from '../operatorparam';
import { Source2Particle } from '../../source2particle';

const v = vec3.create();

const DEFAULT_SCALE_CONTROL_POINT_NUMBER = -1;// TODO: check default value
const DEFAULT_RADIUS_COMPONENT = -1;// TODO: check default value
const DEFAULT_WARP_TIME = 0;// TODO: check default value
const DEFAULT_WARP_START_TIME = 0;// TODO: check default value
const DEFAULT_PREV_POS_SCALE = 1;// TODO: check default value
const DEFAULT_INVERT_WARP = false;// TODO: check default value
const DEFAULT_USE_COUNT = false;// TODO: check default value

export class PositionWarp extends Operator {
	#warpMin = vec3.fromValues(1, 1, 1);// TODO: check default value
	#warpMax = vec3.fromValues(1, 1, 1);// TODO: check default value
	#scaleControlPointNumber = DEFAULT_SCALE_CONTROL_POINT_NUMBER;
	#radiusComponent = DEFAULT_RADIUS_COMPONENT;
	#warpTime = DEFAULT_WARP_TIME;
	#warpStartTime = DEFAULT_WARP_START_TIME;
	#prevPosScale = DEFAULT_PREV_POS_SCALE;
	#invertWarp = DEFAULT_INVERT_WARP;
	#useCount = DEFAULT_USE_COUNT;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_vecWarpMin':
				console.error('do this param', paramName, param);
				vec3.copy(this.#warpMin, param);
				break;
			case 'm_vecWarpMax':
				console.error('do this param', paramName, param);
				vec3.copy(this.#warpMax, param);
				break;
			case 'm_nScaleControlPointNumber':
				this.#scaleControlPointNumber = param.getValueAsNumber() ?? DEFAULT_SCALE_CONTROL_POINT_NUMBER;
				break;
			case 'm_nRadiusComponent':
				console.error('do this param', paramName, param);
				this.#radiusComponent = (param);//TODO: check [-1 0 1 2]
				break;
			case 'm_flWarpTime':
				console.error('do this param', paramName, param);
				this.#warpTime = param;
				break;
			case 'm_flWarpStartTime':
				console.error('do this param', paramName, param);
				this.#warpStartTime = param;
				break;
			case 'm_flPrevPosScale':
				console.error('do this param', paramName, param);
				this.#prevPosScale = param;
				break;
			case 'm_bInvertWarp':
				console.error('do this param', paramName, param);
				this.#invertWarp = param;
				break;
			case 'm_bUseCount':
				console.error('do this param', paramName, param);
				this.#useCount = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: use time parameters, m_bUseCount
		vec3RandomBox(v, this.#warpMin, this.#warpMax);
		let scale;
		if (this.#scaleControlPointNumber != -1) {
			const scaleCp = this.system.getControlPoint(this.#scaleControlPointNumber);
			if (scaleCp) {
				vec3.mul(v, v, scaleCp._position);//Not sure if it's position or world position
			}
		}

		if (this.#radiusComponent != -1) {
			particle.radius *= v[this.#radiusComponent] ?? 1;
		}

		vec3.mul(particle.position, particle.position, v);
		vec3.mul(particle.prevPosition, particle.prevPosition, v);

		if (this.#prevPosScale != -1) {
			vec3.scale(particle.prevPosition, particle.prevPosition, this.#prevPosScale);
		}
	}
}
RegisterSource2ParticleOperator('C_INIT_PositionWarp', PositionWarp);
