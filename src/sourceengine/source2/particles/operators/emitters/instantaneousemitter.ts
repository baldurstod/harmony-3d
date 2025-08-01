import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Emitter } from './emitter';

const DEFAULT_SNAPSHOT_CONTROL_POINT = -1;// TODO: check default value
const DEFAULT_MAX_EMITTED_PER_FRAME = -1;// TODO: check default value
const DEFAULT_INIT_FROM_KILLED_PARENT_PARTICLES = 0;// TODO: check default value

export class InstantaneousEmitter extends Emitter {
	#emitted = 0;
	#initFromKilledParentParticles = DEFAULT_INIT_FROM_KILLED_PARENT_PARTICLES;
	#maxEmittedPerFrame = DEFAULT_MAX_EMITTED_PER_FRAME;
	#snapshotControlPoint = DEFAULT_SNAPSHOT_CONTROL_POINT;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nParticlesToEmit':
			case 'm_flStartTime':
				break;
			case 'm_flInitFromKilledParentParticles':
				this.#initFromKilledParentParticles = param.getValueAsNumber() ?? DEFAULT_INIT_FROM_KILLED_PARENT_PARTICLES;
				break;
			case 'm_nMaxEmittedPerFrame':
				console.error('do this param', paramName, param);
				this.#maxEmittedPerFrame = param.getValueAsNumber() ?? DEFAULT_MAX_EMITTED_PER_FRAME;
				break;
			case 'm_nSnapshotControlPoint':
				this.#snapshotControlPoint = param.getValueAsNumber() ?? DEFAULT_SNAPSHOT_CONTROL_POINT;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doEmit(elapsedTime: number): void {
		//todo: use snapshotControlPoint
		let particlesToEmit = this.getParamScalarValue('m_nParticlesToEmit') ?? 100;
		const startTime = this.getParamScalarValue('m_flStartTime') ?? 0;

		const system = this.system;
		if (this.#snapshotControlPoint != -1) {
			const snapshot = system.getControlPoint(this.#snapshotControlPoint)?.snapshot;
			if (snapshot) {
				particlesToEmit = snapshot.particleCount;
			} else {
				particlesToEmit = 0;//yep no snapshot = no particle
			}
		}
		//TODO: check start timeout

		let nToEmit = particlesToEmit - this.#emitted;
		if (this.#maxEmittedPerFrame != -1) {
			nToEmit = Math.min(nToEmit, this.#maxEmittedPerFrame);
		}

		let currentTime = system.currentTime;
		const timeStampStep = elapsedTime / nToEmit;
		for (let i = 0; i < nToEmit; ++i) {
			const particle = this.emitParticle(currentTime, elapsedTime);
			if (particle == null) {
				break; // Break if a particule can't emitted (max reached)
			}
			currentTime += timeStampStep;
			++this.#emitted;
		}
	}

	reset() {
		this.#emitted = 0;
	}
}
RegisterSource2ParticleOperator('C_OP_InstantaneousEmitter', InstantaneousEmitter);
