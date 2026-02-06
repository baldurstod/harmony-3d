import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_PERCENT = 0.5;

export class RandomYawFlip extends Operator {
	#percent = DEFAULT_PERCENT;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flPercent':
				this.#percent = param.getValueAsNumber() ?? DEFAULT_PERCENT;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle: Source2Particle): void {
		particle.rotationYaw += (Math.random() < this.#percent) ? Math.PI : 0;
	}

	override initMultipleOverride(): boolean {
		return true;
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomYawFlip', RandomYawFlip);
