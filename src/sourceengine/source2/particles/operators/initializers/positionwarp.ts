import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { vec3RandomBox } from '../../../../../math/functions';

const v = vec3.create();

export class PositionWarp extends Operator {
	warpMin = vec3.fromValues(1, 1, 1);
	warpMax = vec3.fromValues(1, 1, 1);
	scaleControlPointNumber = -1;
	radiusComponent = -1;
	warpTime = 0;
	warpStartTime = 0;
	prevPosScale = 1;
	invertWarp = false;
	useCount = false;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_vecWarpMin':
				vec3.copy(this.warpMin, value);
				break;
			case 'm_vecWarpMax':
				vec3.copy(this.warpMax, value);
				break;
			case 'm_nScaleControlPointNumber':
				this.scaleControlPointNumber = Number(value);
				break;
			case 'm_nRadiusComponent':
				this.radiusComponent = Number(value);//TODO: check [-1 0 1 2]
				break;
			case 'm_flWarpTime':
				this.warpTime = value;
				break;
			case 'm_flWarpStartTime':
				this.warpStartTime = value;
				break;
			case 'm_flPrevPosScale':
				this.prevPosScale = value;
				break;
			case 'm_bInvertWarp':
				this.invertWarp = value;
				break;
			case 'm_bUseCount':
				this.useCount = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		//TODO: use time parameters, m_bUseCount
		vec3RandomBox(v, this.warpMin, this.warpMax);
		let scale;
		if (this.scaleControlPointNumber != -1) {
			const scaleCp = this.system.getControlPoint(this.scaleControlPointNumber);
			if (scaleCp) {
				vec3.mul(v, v, scaleCp._position);//Not sure if it's position or world position
			}
		}

		if (this.radiusComponent != -1) {
			particle.radius *= v[this.radiusComponent];
		}

		vec3.mul(particle.position, particle.position, v);
		vec3.mul(particle.prevPosition, particle.prevPosition, v);

		if (this.prevPosScale != -1) {
			vec3.scale(particle.prevPosition, particle.prevPosition, this.prevPosScale);
		}
	}
}
RegisterSource2ParticleOperator('C_INIT_PositionWarp', PositionWarp);
