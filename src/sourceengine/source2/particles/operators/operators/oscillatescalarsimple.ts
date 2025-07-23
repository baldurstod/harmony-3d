import { DEG_TO_RAD } from '../../../../../math/constants';
import { clamp } from '../../../../../math/functions';
import { PARTICLE_FIELD_ALPHA } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class OscillateScalarSimple extends Operator {
	rate = 0;
	frequency = 1;
	field = PARTICLE_FIELD_ALPHA;
	oscMult = 2;
	oscAdd = 0.5;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_Rate':
				this.rate = param;
				break;
			case 'm_Frequency':
				this.frequency = param;
				break;
			case 'm_nField':
				this.field = (param);
				break;
			case 'm_flOscMult':
				this.oscMult = param;
				break;
			case 'm_flOscAdd':
				this.oscAdd = param;
				break;
			default:
				super._paramChanged(paramName, param);
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
