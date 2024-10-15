import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { AddSIMD, AndSIMD, BiasSIMD, CmpGeSIMD, CmpGtSIMD, CmpLtSIMD, MulSIMD, ReciprocalEstSIMD, ReciprocalSIMD, SubSIMD } from '../../../../common/math/sse';
import { SimpleSpline } from '../../../../../math/functions';

export class InterpolateRadius extends Operator {
	startTime = 0;
	endTime = 1;
	startScale = 1;
	endScale = 1;
	easeInAndOut = false;
	bias = 0.5;
	invTime;
	biasParam;
	scaleWidth;
	constructor(system) {
		super(system);
		this._update();
	}

	_update() {
		this.invTime = 1.0 / (this.endTime - this.startTime);
		this.biasParam = 1.0 / this.bias - 2;
		this.scaleWidth = this.endScale - this.startScale;
	}

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flStartTime':
				this.startTime = value;
				this._update();
				break;
			case 'm_flEndTime':
				this.endTime = value;
				this._update();
				break;
			case 'm_flStartScale':
				this.startScale = value;
				this._update();
				break;
			case 'm_flEndScale':
				this.endScale = value;
				this._update();
				break;
			case 'm_bEaseInAndOut':
				this.easeInAndOut = value;
				break;
			case 'm_flBias':
				this.bias = value;
				this._update();
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		const fl4LifeDuration = particle.timeToLive;
		let fl4GoodMask = CmpGtSIMD(fl4LifeDuration, 0);
		const fl4CurTime = this.system.currentTime;
		const fl4LifeTime = MulSIMD(SubSIMD(fl4CurTime, particle.cTime), ReciprocalEstSIMD(fl4LifeDuration)); // maybe need accurate div here?
		fl4GoodMask = AndSIMD(fl4GoodMask, CmpGeSIMD(fl4LifeTime, this.startTime));
		fl4GoodMask = AndSIMD(fl4GoodMask, CmpLtSIMD(fl4LifeTime, this.endTime));

		fl4GoodMask = (fl4LifeDuration > 0) && (fl4LifeTime >= this.startTime) && (fl4LifeTime < this.endTime);
		if (fl4GoodMask/* IsAnyNegative(fl4GoodMask) */) {
			let fl4FadeWindow = MulSIMD(SubSIMD(fl4LifeTime, this.startTime), this.invTime);
			if (this.easeInAndOut) {
					fl4FadeWindow = AddSIMD(this.startScale, MulSIMD(SimpleSpline(fl4FadeWindow), this.scaleWidth));
			} else {
				if (this.bias != 0.5) {
					fl4FadeWindow = AddSIMD(this.startScale, MulSIMD(BiasSIMD(fl4FadeWindow, this.biasParam), this.scaleWidth));
				} else {
					fl4FadeWindow = AddSIMD(this.startScale, MulSIMD(fl4FadeWindow, this.scaleWidth));
				}
			}
			if (fl4GoodMask) {
				particle.radius = fl4FadeWindow * particle.initialRadius;
			}
		}
	}
}
RegisterSource2ParticleOperator('C_OP_InterpolateRadius', InterpolateRadius);
