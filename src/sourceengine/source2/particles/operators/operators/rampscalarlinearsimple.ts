import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';

export class RampScalarLinearSimple extends Operator {
	rate = 0;
	startTime = 0;
	endTime = 1;
	field = PARTICLE_FIELD_RADIUS;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_Rate':
				this.rate = value;
				break;
			case 'm_flStartTime':
				this.startTime = value;
				break;
			case 'm_flEndTime':
				this.endTime = value;
				break;
			case 'm_nField':
				this.field = Number(value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		let particleTime = particle.proportionOfLife;
		if (particleTime < this.startTime || particleTime > this.endTime) {
			return;
		}

		let value = particle.getField(this.field) + this.rate * elapsedTime;
		particle.setField(this.field, value);
	}
}
RegisterSource2ParticleOperator('C_OP_RampScalarLinearSimple', RampScalarLinearSimple);
