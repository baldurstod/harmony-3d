import { vec3 } from 'gl-matrix';
import { FLT_EPSILON } from '../../../../../math/constants';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const vecCenter = vec3.create();
const vec = vec3.create();

export class AttractToControlPoint extends Operator {
	#componentScale = vec3.fromValues(1, 1, 1);
	#falloffPower = 0;
	#scaleLocal = false;
	#applyMinForce = false;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_fForceAmount':
			case 'm_fForceAmountMin':
				break;
			case 'm_vecComponentScale':// TODO: mutualise ?
				param.getValueAsVec3(this.#componentScale);
				break;
			case 'm_fFalloffPower':
				this.#falloffPower = param.getValueAsNumber() ?? 0;
				break;
			case 'm_bScaleLocal':
				this.#scaleLocal = param.getValueAsBool() ?? false;
				break;
			case 'm_bApplyMinForce':
				console.error('do this param', paramName, param);
				this.#applyMinForce = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doForce(particle: Source2Particle, elapsedTime: number, accumulatedForces: vec3, strength: number): void {
		const forceAmount = this.getParamScalarValue('m_fForceAmount') ?? 100;
		const forceAmountMin = this.getParamScalarValue('m_fForceAmountMin') ?? 0;

		const power_frac = (-4.0 * this.#falloffPower) << 0;					// convert to what pow_fixedpoint_exponent_simd wants
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
		vec3.scale(vecCenter, vecCenter, fForceScale / len * Math.pow(len, -this.#falloffPower));
		vec3.add(accumulatedForces, accumulatedForces, vecCenter);

		//TODO: use m_vecComponentScale m_bScaleLocal m_bApplyMinForce

	}
}
RegisterSource2ParticleOperator('C_OP_AttractToControlPoint', AttractToControlPoint);
