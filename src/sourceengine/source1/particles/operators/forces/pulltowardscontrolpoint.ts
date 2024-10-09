import { vec3 } from 'gl-matrix';

import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator.js';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_INT } from '../../constants.js';
import { FLT_EPSILON } from '../../../../../math/constants';

let tempVec3 = vec3.create();

export class PullTowardsControlPoint extends SourceEngineParticleOperator {
	static functionName =  'Pull towards control point';
	constructor() {
		super();
		this.addParam('control point number', PARAM_TYPE_INT, 0);
		this.addParam('amount of force', PARAM_TYPE_FLOAT, 0);
		this.addParam('falloff power', PARAM_TYPE_FLOAT, 2);
	//	DMXELEMENT_UNPACK_FIELD('amount of force', '0', float, m_fForceAmount)
	//	DMXELEMENT_UNPACK_FIELD('falloff power', '2', float, m_fFalloffPower)
	//	DMXELEMENT_UNPACK_FIELD('control point number', '0', int, m_nControlPointNumber)
	}

	doForce(particle, elapsedTime, accumulatedForces) {
		//console.log(particle.position);
		const m_fForceAmount = this.getParameter('amount of force');
		const cpNumber = this.getParameter('control point number');
		const m_fFalloffPower = this.getParameter('falloff power');

		const power_frac = Math.round(-4.0 * m_fFalloffPower);					// convert to what pow_fixedpoint_exponent_simd wants
		const fForceScale = -m_fForceAmount * 1.0/*flStrength*/;

		const cp = this.particleSystem.getControlPoint(cpNumber);
		if (!cp) {
			return;
		}

		const ofs = vec3.clone(particle.position);
		vec3.subtract(ofs, ofs, cp.getWorldPosition(tempVec3));//TODO: add particle base cp
		let len = vec3.length(ofs);
		if (len === 0) {
			len = FLT_EPSILON;
		}
		vec3.scale(ofs, ofs, fForceScale / len * Math.pow(len, -m_fFalloffPower));
		///console.log(len, Math.pow(len, power_frac), ofs);
		//vec3.scale(ofs, ofs, 10000000);//TODO
		//vec3.scale(v, v, 1 / Math.pow(len, power_frac));
		vec3.add(accumulatedForces, accumulatedForces, ofs);
	}
}
SourceEngineParticleOperators.registerOperator(PullTowardsControlPoint);
