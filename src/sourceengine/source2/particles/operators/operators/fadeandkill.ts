import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { SimpleSplineRemapValWithDeltasClamped } from '../../../../common/math/sse';

export class FadeAndKill extends Operator {
	startAlpha = 1;
	startFadeInTime = 0;
	endFadeInTime = 0.5;
	startFadeOutTime = 0.5;
	endFadeOutTime = 1.0;
	endAlpha = 0;
	forcePreserveParticleOrder = false;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flStartAlpha':
				this.startAlpha = value;
				break;
			case 'm_flStartFadeInTime':
				this.startFadeInTime = value;
				break;
			case 'm_flEndFadeInTime':
				this.endFadeInTime = value;
				break;
			case 'm_flStartFadeOutTime':
				this.startFadeOutTime = value;
				break;
			case 'm_flEndFadeOutTime':
				this.endFadeOutTime = value;
				break;
			case 'm_flEndAlpha':
				this.endAlpha = value;
				break;
			case 'm_bForcePreserveParticleOrder':
				this.forcePreserveParticleOrder = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		//TODO:use forcePreserveParticleOrder
		const startAlpha = this.startAlpha;
		const endAlpha = this.endAlpha;

		const startFadeInTime = this.startFadeInTime;
		const endFadeInTime = this.endFadeInTime;
		const startFadeOutTime = this.startFadeOutTime;
		const endFadeOutTime = this.endFadeOutTime;

		const alpha = 1.0;

		const proportionOfLife = particle.currentTime / particle.timeToLive;
		const fl4FadeInDuration = endFadeInTime - startFadeInTime;
		const fl4OOFadeInDuration = 1.0 / fl4FadeInDuration;

		const fl4FadeOutDuration = endFadeOutTime - startFadeOutTime;
		const fl4OOFadeOutDuration = 1.0 / fl4FadeOutDuration;

		let fl4Goal, fl4NewAlpha;
		switch (true)
		{
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
