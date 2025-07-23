import { vec3 } from 'gl-matrix';

import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';

export class MaintainEmitter extends Operator {
	particlesToMaintain = 100;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nParticlesToMaintain':
				this.particlesToMaintain = (param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doEmit(elapsedTime) {
		const nToEmit = this.particlesToMaintain - this.system.livingParticles.length;

		if (nToEmit > 0) {
			let currentTime = this.system.currentTime;
			const timeStampStep = elapsedTime / nToEmit;
			for (let i = 0; i < nToEmit; ++i) {
				const particle = this.emitParticle(currentTime, elapsedTime);
				if (particle == null) {
					break; // Break if a particule can't emitted (max reached)
				}
				currentTime += timeStampStep;
			}
		}
	}
}
RegisterSource2ParticleOperator('C_OP_MaintainEmitter', MaintainEmitter);
