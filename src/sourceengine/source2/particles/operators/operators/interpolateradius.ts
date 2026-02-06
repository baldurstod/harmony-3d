import { SimpleSpline } from '../../../../../math/functions';
import { AddSIMD, AndSIMD, BiasSIMD, CmpGeSIMD, CmpGtSIMD, CmpLtSIMD, MulSIMD, ReciprocalEstSIMD, SubSIMD } from '../../../../common/math/sse';
import { Source2Particle } from '../../source2particle';
import { Source2ParticleSystem } from '../../source2particlesystem';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_BIAS = 0.5;

export class InterpolateRadius extends Operator {
	#startTime = 0;
	#endTime = 1;
	#startScale = 1;
	#endScale = 1;
	#easeInAndOut = false;
	#bias = DEFAULT_BIAS;
	#invTime = 1;
	#biasParam = 1;
	#scaleWidth = 0;

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.#update();
	}

	#update(): void {
		this.#invTime = 1.0 / (this.#endTime - this.#startTime);
		this.#biasParam = 1.0 / this.#bias - 2;
		this.#scaleWidth = this.#endScale - this.#startScale;
	}

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flStartTime':
				this.#startTime = param.getValueAsNumber() ?? 0;
				this.#update();
				break;
			case 'm_flEndTime':
				this.#endTime = param.getValueAsNumber() ?? 1;
				this.#update();
				break;
			case 'm_flStartScale':
				this.#startScale = param.getValueAsNumber() ?? 1;
				this.#update();
				break;
			case 'm_flEndScale':
				this.#endScale = param.getValueAsNumber() ?? 1;
				this.#update();
				break;
			case 'm_bEaseInAndOut':
				this.#easeInAndOut = param.getValueAsBool() ?? false;
				break;
			case 'm_flBias':
				this.#bias = param.getValueAsNumber() ?? DEFAULT_BIAS;
				this.#update();
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(particle: Source2Particle): void {
		const fl4LifeDuration = particle.timeToLive;
		let fl4GoodMask = CmpGtSIMD(fl4LifeDuration, 0);
		const fl4CurTime = this.system.currentTime;
		const fl4LifeTime = MulSIMD(SubSIMD(fl4CurTime, particle.cTime), ReciprocalEstSIMD(fl4LifeDuration)); // maybe need accurate div here?
		fl4GoodMask = AndSIMD(fl4GoodMask, CmpGeSIMD(fl4LifeTime, this.#startTime));
		fl4GoodMask = AndSIMD(fl4GoodMask, CmpLtSIMD(fl4LifeTime, this.#endTime));

		fl4GoodMask = (fl4LifeDuration > 0) && (fl4LifeTime >= this.#startTime) && (fl4LifeTime < this.#endTime);
		if (fl4GoodMask/* IsAnyNegative(fl4GoodMask) */) {
			let fl4FadeWindow = MulSIMD(SubSIMD(fl4LifeTime, this.#startTime), this.#invTime);
			if (this.#easeInAndOut) {
				fl4FadeWindow = AddSIMD(this.#startScale, MulSIMD(SimpleSpline(fl4FadeWindow), this.#scaleWidth));
			} else {
				if (this.#bias != 0.5) {
					fl4FadeWindow = AddSIMD(this.#startScale, MulSIMD(BiasSIMD(fl4FadeWindow, this.#biasParam), this.#scaleWidth));
				} else {
					fl4FadeWindow = AddSIMD(this.#startScale, MulSIMD(fl4FadeWindow, this.#scaleWidth));
				}
			}
			if (fl4GoodMask) {
				particle.radius = fl4FadeWindow * particle.initialRadius;
			}
		}
	}
}
RegisterSource2ParticleOperator('C_OP_InterpolateRadius', InterpolateRadius);
