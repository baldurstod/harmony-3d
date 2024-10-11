import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class InstantaneousEmitter extends Operator {
	emitted = 0;
	initFromKilledParentParticles = 0;
	maxEmittedPerFrame = -1;
	snapshotControlPoint = -1;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nParticlesToEmit':
			case 'm_flStartTime':
				break;
			case 'm_flInitFromKilledParentParticles':
				this.initFromKilledParentParticles = Number(value);
				break;
			case 'm_nMaxEmittedPerFrame':
				this.maxEmittedPerFrame = Number(value);
				break;
			case 'm_nSnapshotControlPoint':
				this.snapshotControlPoint = Number(value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doEmit(elapsedTime) {
		//todo: use snapshotControlPoint
		let particlesToEmit = this.getParamScalarValue('m_nParticlesToEmit') ?? 100;
		let startTime = this.getParamScalarValue('m_flStartTime') ?? 0;

		let system = this.system;
		if (this.snapshotControlPoint != -1) {
			let snapshot = system.getControlPoint(this.snapshotControlPoint)?.snapshot;
			if (snapshot) {
				particlesToEmit = snapshot.particleCount;
			} else {
				particlesToEmit = 0;//yep no snapshot = no particle
			}
		}
		//TODO: check start timeout

		let nToEmit = particlesToEmit - this.emitted;
		if (this.maxEmittedPerFrame != -1) {
			nToEmit = Math.min(nToEmit, this.maxEmittedPerFrame);
		}

		let currentTime = system.currentTime;
		const timeStampStep = elapsedTime / nToEmit;
		for (let i = 0; i < nToEmit; ++i) {
			const particle = this.emitParticle(currentTime, elapsedTime);
			if (particle == null) {
				break; // Break if a particule can't emitted (max reached)
			}
			currentTime += timeStampStep;
			++this.emitted;
		}
	}

	reset() {
		this.emitted = 0;
	}
}
RegisterSource2ParticleOperator('C_OP_InstantaneousEmitter', InstantaneousEmitter);
