import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { FLT_EPSILON } from '../../../../../math/constants';

const vecCenter = vec3.create();
let vec = vec3.create();

export class AttractToControlPoint extends Operator {
	componentScale = vec3.fromValues(1, 1, 1);
	falloffPower = 0;
	scaleLocal = false;
	applyMinForce = false;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_fForceAmount':
			case 'm_fForceAmountMin':
				break;
			case 'm_vecComponentScale':
				vec3.copy(this.componentScale, value);
				break;
			case 'm_fFalloffPower':
				this.falloffPower = value;
				break;
			case 'm_bScaleLocal':
				this.scaleLocal = value;
				break;
			case 'm_bApplyMinForce':
				this.applyMinForce = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doForce(particle, elapsedTime, accumulatedForces, strength = 1) {
		let forceAmount = this.getParamScalarValue('m_fForceAmount') ?? 100;
		let forceAmountMin = this.getParamScalarValue('m_fForceAmountMin') ?? 0;

		const power_frac = (-4.0 * this.falloffPower) << 0;					// convert to what pow_fixedpoint_exponent_simd wants
		const fForceScale = -forceAmount * strength/*flStrength*/;

		const cp = this.system.getControlPoint(this.controlPointNumber);
		if (!cp) {
			return;
		}

		vec3.subtract(vecCenter, particle.position, cp.getWorldPosition(vec));//TODO: add particle base cp
		let len = vec3.length(vecCenter);
		if (len === 0) {
			len = FLT_EPSILON;
		}
		vec3.scale(vecCenter, vecCenter, fForceScale / len * Math.pow(len, -this.falloffPower));
		vec3.add(accumulatedForces, accumulatedForces, vecCenter);

		//TODO: use m_vecComponentScale m_bScaleLocal m_bApplyMinForce

	}
}
RegisterSource2ParticleOperator('C_OP_AttractToControlPoint', AttractToControlPoint);
