import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_ALPHA } from '../../../../common/particles/particlefields';
import { DEG_TO_RAD } from '../../../../../math/constants';
import { clamp } from '../../../../../math/functions';

export class OscillateScalarSimple extends Operator {
	rate = 0;
	frequency = 1;
	field = PARTICLE_FIELD_ALPHA;
	oscMult = 2;
	oscAdd = 0.5;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_Rate':
				this.rate = value;
				break;
			case 'm_Frequency':
				this.frequency = value;
				break;
			case 'm_nField':
				this.field = Number(value);
				break;
			case 'm_flOscMult':
				this.oscMult = value;
				break;
			case 'm_flOscAdd':
				this.oscAdd = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		const currentTime = this.system.currentTime;

		const sinFactor = (this.oscMult * currentTime + this.oscAdd) * this.frequency;

		let value = particle.getField(this.field) + this.rate * Math.sin(sinFactor * Math.PI) * DEG_TO_RAD;//DEG_TO_RAD seems to apply to all field even radius, alpha and so on. Valve style
		if (this.field == PARTICLE_FIELD_ALPHA) {
			value = clamp(value, 0.0, 1.0);
		}
		particle.setField(this.field, value);
	}
}
RegisterSource2ParticleOperator('C_OP_OscillateScalarSimple', OscillateScalarSimple);
