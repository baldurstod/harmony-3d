import { SimpleSplineRemapValWithDeltasClamped } from '../../../../common/math/sse';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_END_FADE_IN_TIME = 0.5;

export class FadeAndKill extends Operator {
	#startAlpha = 1;
	#startFadeInTime = 0;
	#endFadeInTime = DEFAULT_END_FADE_IN_TIME;
	#startFadeOutTime = DEFAULT_END_FADE_IN_TIME;
	#endFadeOutTime = 1.0;
	#endAlpha = 0;
	#forcePreserveParticleOrder = false;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flStartAlpha':
				console.error('do this param', paramName, param);
				this.#startAlpha = param;
				break;
			case 'm_flStartFadeInTime':
				this.#startFadeInTime = param.getValueAsNumber() ?? 0;
				break;
			case 'm_flEndFadeInTime':
				this.#endFadeInTime = param.getValueAsNumber() ?? DEFAULT_END_FADE_IN_TIME;
				break;
			case 'm_flStartFadeOutTime':
				this.#startFadeOutTime = param.getValueAsNumber() ?? DEFAULT_END_FADE_IN_TIME;
				break;
			case 'm_flEndFadeOutTime':
				this.#endFadeOutTime = param.getValueAsNumber() ?? 1;
				break;
			case 'm_flEndAlpha':
				console.error('do this param', paramName, param);
				this.#endAlpha = param;
				break;
			case 'm_bForcePreserveParticleOrder':
				console.error('do this param', paramName, param);
				this.#forcePreserveParticleOrder = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO:use forcePreserveParticleOrder
		const startAlpha = this.#startAlpha;
		const endAlpha = this.#endAlpha;

		const startFadeInTime = this.#startFadeInTime;
		const endFadeInTime = this.#endFadeInTime;
		const startFadeOutTime = this.#startFadeOutTime;
		const endFadeOutTime = this.#endFadeOutTime;

		const alpha = 1.0;

		const proportionOfLife = particle.currentTime / particle.timeToLive;
		const fl4FadeInDuration = endFadeInTime - startFadeInTime;
		const fl4OOFadeInDuration = 1.0 / fl4FadeInDuration;

		const fl4FadeOutDuration = endFadeOutTime - startFadeOutTime;
		const fl4OOFadeOutDuration = 1.0 / fl4FadeOutDuration;

		let fl4Goal, fl4NewAlpha;
		switch (true) {
			case proportionOfLife <= startFadeInTime:
				break;
			case proportionOfLife < endFadeInTime:
				fl4Goal = particle.startAlpha * startAlpha;
				fl4NewAlpha = SimpleSplineRemapValWithDeltasClamped(proportionOfLife, startFadeInTime, fl4FadeInDuration, fl4OOFadeInDuration, fl4Goal, particle.startAlpha - fl4Goal);
				particle.alpha = fl4NewAlpha;
				break;
			case proportionOfLife < startFadeOutTime:
				break;
			case proportionOfLife < endFadeOutTime:
				fl4Goal = particle.startAlpha * endAlpha;
				fl4NewAlpha = SimpleSplineRemapValWithDeltasClamped(proportionOfLife, startFadeOutTime, fl4FadeOutDuration, fl4OOFadeOutDuration, particle.startAlpha, fl4Goal - particle.startAlpha);
				particle.alpha = fl4NewAlpha;
				break;
			default:
				break;
		}

		if (particle.timeToLive < particle.currentTime) {
			particle.die();
		}
	}
}
RegisterSource2ParticleOperator('C_OP_FadeAndKill', FadeAndKill);
