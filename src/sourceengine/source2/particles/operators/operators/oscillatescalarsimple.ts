import { DEG_TO_RAD } from '../../../../../math/constants';
import { clamp } from '../../../../../math/functions';
import { PARTICLE_FIELD_ALPHA } from '../../../../common/particles/particlefields';
import { Source2ParticleScalarField } from '../../enums';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';


export const DEFAULT_RATE = 0;
export const DEFAULT_FREQUENCY = 1;
export const DEFAULT_FIELD = Source2ParticleScalarField.Alpha;
export const DEFAULT_OSC_MULT = 2;
export const DEFAULT_OSC_ADD = 0.5;

export class OscillateScalarSimple extends Operator {
	#rate = DEFAULT_RATE;
	#frequency = DEFAULT_FREQUENCY;
	#field = DEFAULT_FIELD;
	#oscMult = DEFAULT_OSC_MULT;
	#oscAdd = DEFAULT_OSC_ADD;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_Rate':
				this.#rate = param.getValueAsNumber() ?? DEFAULT_RATE;
				break;
			case 'm_Frequency':
				this.#frequency = param.getValueAsNumber() ?? DEFAULT_FREQUENCY;
				break;
			case 'm_nField':
				this.#field = param.getValueAsNumber() ?? DEFAULT_FIELD;
				break;
			case 'm_flOscMult':
				this.#oscMult = param.getValueAsNumber() ?? DEFAULT_OSC_MULT;
				break;
			case 'm_flOscAdd':
				this.#oscAdd = param.getValueAsNumber() ?? DEFAULT_OSC_ADD;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const currentTime = this.system.currentTime;

		const sinFactor = (this.#oscMult * currentTime + this.#oscAdd) * this.#frequency;

		let value = particle.getScalarField(this.#field) + this.#rate * Math.sin(sinFactor * Math.PI) * DEG_TO_RAD;//DEG_TO_RAD seems to apply to all field even radius, alpha and so on. Valve style
		if (this.#field == PARTICLE_FIELD_ALPHA) {
			value = clamp(value, 0.0, 1.0);
		}
		particle.setField(this.#field, value);
	}
}
RegisterSource2ParticleOperator('C_OP_OscillateScalarSimple', OscillateScalarSimple);
